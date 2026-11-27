#!/usr/bin/env python3
"""
Historical Anchor Importer for SpecLedger
------------------------------------------------------------------
Imports pre-Dec 1, 2026 historical price anchor points from
`scripts/historical_anchors.csv` into `public.price_history` tagged
with `source = 'historical_anchor'`.

Usage:
  python scripts/import_historical_anchors.py
  python scripts/import_historical_anchors.py --replace-synthetic
"""

import argparse
import csv
import datetime
import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CSV_PATH = SCRIPT_DIR / "historical_anchors.csv"
CUTOFF_DATE = "2026-12-01"

env_path = SCRIPT_DIR.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase module not installed. Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def validate_and_load_csv(csv_path: Path, valid_phone_ids: set[str]) -> list[dict]:
    """Reads and strictly validates every row from historical_anchors.csv."""
    if not csv_path.exists():
        print(f"❌ Error: CSV file not found at {csv_path}")
        sys.exit(1)

    rows_to_upsert: list[dict] = []
    errors: list[str] = []

    raw_head = csv_path.read_bytes()[:2]
    encoding = "utf-16" if raw_head in (b"\xff\xfe", b"\xfe\xff") else "utf-8-sig"

    with open(csv_path, "r", encoding=encoding, newline="") as f:
        reader = csv.DictReader(f)
        required_cols = {"phone_id", "recorded_at", "price_inr", "event_note"}
        if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
            print(
                f"❌ Error: CSV must contain headers {sorted(required_cols)}. "
                f"Found: {reader.fieldnames}"
            )
            if reader.fieldnames and any("\t" in col for col in reader.fieldnames):
                print("   💡 Tip: Detected tab-separated headers (e.g. Excel 'Unicode Text'). Re-save as 'CSV UTF-8 (Comma delimited) (.csv)'.")
            sys.exit(1)

        for line_num, raw in enumerate(reader, start=2):
            phone_id = (raw.get("phone_id") or "").strip()
            recorded_at = (raw.get("recorded_at") or "").strip()
            price_raw = (raw.get("price_inr") or "").strip()
            event_note = (raw.get("event_note") or "").strip() or None

            if not phone_id:
                errors.append(f"Line {line_num}: Missing phone_id")
                continue

            if phone_id not in valid_phone_ids:
                errors.append(f"Line {line_num}: Unknown phone_id '{phone_id}' (not in public.phones)")
                continue

            if not re.match(r"^\d{4}-\d{2}-\d{2}$", recorded_at):
                errors.append(f"Line {line_num}: Invalid recorded_at '{recorded_at}' (expected YYYY-MM-DD)")
                continue

            try:
                datetime.date.fromisoformat(recorded_at)
            except ValueError:
                errors.append(f"Line {line_num}: Non-existent calendar date '{recorded_at}'")
                continue

            if recorded_at >= CUTOFF_DATE:
                errors.append(
                    f"Line {line_num}: recorded_at '{recorded_at}' must be < {CUTOFF_DATE} "
                    "(dates >= 2026-12-01 are reserved for live_scrape)"
                )
                continue

            try:
                price_inr = int(price_raw)
                if price_inr <= 0:
                    raise ValueError("must be positive")
            except ValueError:
                errors.append(f"Line {line_num}: Invalid price_inr '{price_raw}' (must be positive integer)")
                continue

            rows_to_upsert.append(
                {
                    "phone_id": phone_id,
                    "store": "flipkart",
                    "price_inr": price_inr,
                    "in_stock": True,
                    "recorded_at": recorded_at,
                    "source": "historical_anchor",
                    "event_note": event_note,
                }
            )

    if errors:
        print(f"❌ Validation failed with {len(errors)} error(s):")
        for err in errors[:20]:
            print(f"   • {err}")
        if len(errors) > 20:
            print(f"   ... and {len(errors) - 20} more.")
        sys.exit(1)

    return rows_to_upsert


def main():
    parser = argparse.ArgumentParser(description="Import SpecLedger historical price anchors (< 2026-12-01)")
    parser.add_argument(
        "--replace-synthetic",
        action="store_true",
        help="Delete all Flipkart price_history rows with recorded_at < 2026-12-01 before importing anchors",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV_PATH,
        help="Path to historical anchors CSV (default: scripts/historical_anchors.csv)",
    )
    args = parser.parse_args()

    print("=" * 70)
    print("📌 SPECLEDGER HISTORICAL ANCHOR IMPORTER")
    print(f"📄 CSV Source: {args.csv}")
    print(f"🗓️  Cutoff Date: < {CUTOFF_DATE} (live_scrape rows >= {CUTOFF_DATE} untouched)")
    print("=" * 70)

    # 1. Fetch valid phone slugs from public.phones
    try:
        phones_res = supabase.table("phones").select("id").execute()
        valid_phone_ids = {row["id"] for row in (phones_res.data or [])}
    except Exception as e:
        print(f"❌ Failed to query public.phones: {e}")
        sys.exit(1)

    print(f"📱 Found {len(valid_phone_ids)} phones in public.phones.")

    # 2. Load and validate CSV before any DB mutations
    records = validate_and_load_csv(args.csv, valid_phone_ids)
    if not records:
        print("ℹ️ No rows to import from CSV. Exiting.")
        return

    # 3. Optional cleanup of synthetic pre-Dec 1 Flipkart rows
    rows_deleted = 0
    if args.replace_synthetic:
        print(f"🧹 Deleting existing Flipkart price_history rows with recorded_at < '{CUTOFF_DATE}'...")
        try:
            del_res = (
                supabase.table("price_history")
                .delete(count="exact")
                .eq("store", "flipkart")
                .lt("recorded_at", CUTOFF_DATE)
                .execute()
            )
            rows_deleted = (
                del_res.count
                if getattr(del_res, "count", None) is not None
                else len(del_res.data or [])
            )
            print(f"   ✅ Deleted {rows_deleted} pre-Dec 1 rows.")
        except Exception as e:
            print(f"❌ Failed to delete pre-Dec 1 rows: {e}")
            sys.exit(1)

    # 4. Batch upsert anchor rows
    chunk_size = 500
    rows_upserted = 0
    for i in range(0, len(records), chunk_size):
        chunk = records[i : i + chunk_size]
        try:
            supabase.table("price_history").upsert(
                chunk, on_conflict="phone_id,store,recorded_at"
            ).execute()
            rows_upserted += len(chunk)
        except Exception as e:
            print(f"❌ Failed to upsert anchor batch {i // chunk_size + 1}: {e}")
            sys.exit(1)

    unique_phones = len({r["phone_id"] for r in records})

    print("\n" + "=" * 70)
    print("✨ HISTORICAL ANCHOR IMPORT COMPLETED")
    print(f"🧹 Rows Deleted (< {CUTOFF_DATE}): {rows_deleted}")
    print(f"📌 Rows Upserted (historical_anchor): {rows_upserted}")
    print(f"📱 Unique Phones Covered: {unique_phones}")
    print("=" * 70)


if __name__ == "__main__":
    main()
