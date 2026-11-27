#!/usr/bin/env python3
"""
Flipkart Daily Price & Pincode Stock Sync Script (Playwright Stealth)
-------------------------------------------------------------------
Runs via GitHub Actions daily at 08:30 AM IST (03:00 UTC) or manually.
1. Queries Supabase for phones with active Flipkart product URLs (/p/).
2. Launches Chromium with stealth arguments and webdriver evasion.
3. Checks delivery availability for TARGET_PINCODE (default 700034, West Bengal).
4. Extracts live INR price and delivery/stock status via a 3-layer fallback:
   (a) <script type="application/ld+json"> Product schema (offers.price & offers.availability)
   (b) Primary Flipkart DOM selectors + regex matching ₹XX,XXX near <h1>
   (c) Delivery estimation and stock indicators
5. Supports --debug CLI flag to inspect HTTP status, page title, and dump debug_page.png/.html on failure.
6. Detects restock events (out_of_stock -> in_stock) and price drops (>= ₹1,000 or >= 5%).
7. Sends instant Telegram alerts for Restock & Price Drops.
8. If live parsing fails: logs [FAIL] and skips ALL database writes for that phone.
"""

import os
import re
import sys
import json
import time
import random
import datetime
from pathlib import Path
from dotenv import load_dotenv
import requests

# Enable line-buffered stdout for real-time logs
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

# Load .env file if running locally
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
TARGET_PINCODE = os.getenv('TARGET_PINCODE', '700034').strip()
PINCODE_PREFIX = TARGET_PINCODE[0] if TARGET_PINCODE else '7'

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

IS_DEBUG_MODE = "--debug" in sys.argv
IS_LIST_MISSING_URLS = "--list-missing-urls" in sys.argv

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase module not installed. Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
except ImportError:
    print("❌ Error: playwright module not installed. Run: playwright install --with-deps chromium")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Realistic Desktop User-Agents and Viewports (Chromium-only to match Sec-CH-UA)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"
]

VIEWPORTS = [
    {"width": 1440, "height": 900},
    {"width": 1920, "height": 1080},
    {"width": 1366, "height": 768},
    {"width": 1536, "height": 864}
]

# Track if debug evidence was already dumped once
debug_dump_saved = False


def send_telegram_alert(message: str):
    """Sends a Telegram notification if credentials are configured."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            print("   📲 Telegram alert dispatched successfully.")
        else:
            print(f"   ⚠️ Telegram alert failed with code {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"   ⚠️ Could not send Telegram alert: {e}")


def clean_inr_price(price_text: str) -> int:
    """Extracts integer value from Flipkart price strings like '₹24,999' or '₹ 21,449'."""
    clean = re.sub(r'[^\d]', '', str(price_text))
    return int(clean) if clean else 0


def is_valid_delivery_text(text: str) -> bool:
    """Verifies that extracted text is a genuine Flipkart delivery estimate and not header/nav garbage."""
    if not text or len(text.strip()) < 4:
        return False
    lower = text.lower().strip()
    banned = ["login", "sign in", "cart", "flipkart", "explore plus", "become a seller", "notifications", "orders", "wishlist"]
    if any(b in lower for b in banned):
        return False
    valid_keywords = [
        "delivery by",
        "delivered by",
        "delivery in",
        "tomorrow",
        "days",
        "not deliverable",
        "currently out of stock",
        "serviceable"
    ]
    return any(k in lower for k in valid_keywords)


def dump_debug_artifacts(page, reason: str):
    """Dumps screenshot and HTML content when parsing fails in debug mode."""
    global debug_dump_saved
    if debug_dump_saved:
        return

    debug_dump_saved = True
    script_dir = Path(__file__).resolve().parent
    screenshot_path = script_dir / "debug_page.png"
    html_path = script_dir / "debug_page.html"

    try:
        page.screenshot(path=str(screenshot_path), full_page=True)
        html_content = page.content()
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"   🔍 [DEBUG] Dumped failure evidence ({reason}):")
        print(f"      📸 Screenshot: {screenshot_path.resolve()}")
        print(f"      📄 HTML dump:   {html_path.resolve()}")
    except Exception as dump_err:
        print(f"   ⚠️ [DEBUG] Could not save debug artifacts: {dump_err}")


def scrape_flipkart_product(page, url: str, pincode: str) -> dict:
    """
    Navigates to a Flipkart product page with stealth bypass, sets delivery pincode,
    and returns live price, stock status, delivery text, and success flag.
    Uses 3-layer extraction:
      Layer (a): application/ld+json Product schema
      Layer (b): Primary DOM selectors + regex near <h1>
      Layer (c): Pincode delivery input & stock indicator checks
    """
    result = {
        "price": None,
        "status": "out_of_stock",
        "delivery_text": None,
        "success": False,
        "source": None
    }

    response = None
    try:
        # Navigate to product page
        response = page.goto(url, wait_until="domcontentloaded", timeout=40000)
        time.sleep(random.uniform(1.8, 2.8))

        http_status = response.status if response else "N/A"
        page_title = page.title()

        if IS_DEBUG_MODE:
            print(f"   🔍 [DEBUG] HTTP: {http_status} | Title: {page_title[:60]}")

        # 1. Dismiss any login popup / overlay if present
        try:
            close_btn = page.locator('button._2KpZ6l._2doB4z, span[role="button"]:has-text("✕"), span._30XB9F, button:has-text("✕")')
            if close_btn.count() > 0 and close_btn.first.is_visible():
                close_btn.first.click(timeout=2000)
                time.sleep(0.3)
        except Exception:
            pass

        # ----------------------------------------------------------------------
        # LAYER (a): <script type="application/ld+json"> Product Schema
        # ----------------------------------------------------------------------
        try:
            json_ld_elements = page.locator('script[type="application/ld+json"]')
            count = json_ld_elements.count()
            for i in range(count):
                raw_script = (json_ld_elements.nth(i).text_content() or "").strip()
                if not raw_script:
                    continue
                try:
                    parsed = json.loads(raw_script)
                except Exception:
                    continue

                candidates = parsed if isinstance(parsed, list) else [parsed]
                for item in candidates:
                    items_to_check = [item]
                    if "@graph" in item and isinstance(item["@graph"], list):
                        items_to_check.extend(item["@graph"])

                    for cand in items_to_check:
                        cand_type = cand.get("@type", "")
                        if cand_type in ("Product", "ItemPage") and "offers" in cand:
                            offers = cand["offers"]
                            offer_list = offers if isinstance(offers, list) else [offers]
                            for off in offer_list:
                                if "price" in off and off["price"]:
                                    p_int = clean_inr_price(str(off["price"]))
                                    if p_int >= 1000:
                                        result["price"] = p_int
                                        result["source"] = "schema.org"
                                        avail = off.get("availability", "")
                                        if "InStock" in avail:
                                            result["status"] = "in_stock"
                                        elif "OutOfStock" in avail or "SoldOut" in avail:
                                            result["status"] = "out_of_stock"
                                        break
                                if result["price"]:
                                    break
                        if result["price"]:
                            break
                if result["price"]:
                    break
        except Exception as schema_err:
            if IS_DEBUG_MODE:
                print(f"   🔍 [DEBUG] Schema extraction notice: {schema_err}")

        # ----------------------------------------------------------------------
        # LAYER (b): DOM Selectors + Regex near <h1>
        # ----------------------------------------------------------------------
        if not result["price"]:
            price_selectors = [
                "div.Nx9bqj.CxhGGd",
                "div._30jeq3._16Jk6d",
                "div[class*='Nx9bqj'][class*='CxhGGd']",
                "div[class*='Nx9bqj']",
                "div[class*='_30jeq3']",
                "span[class*='price']"
            ]

            for sel in price_selectors:
                loc = page.locator(sel)
                if loc.count() > 0:
                    for k in range(min(3, loc.count())):
                        try:
                            txt = loc.nth(k).inner_text().strip()
                            val = clean_inr_price(txt)
                            if 5000 <= val <= 90000:
                                result["price"] = val
                                result["source"] = f"dom_selector ({sel})"
                                break
                        except Exception:
                            continue
                if result["price"]:
                    break

        # Sibling/Container Regex near <h1>
        if not result["price"]:
            try:
                h1 = page.locator("h1")
                if h1.count() > 0:
                    # Look up to grand-parent container of h1
                    parent_text = h1.first.locator("xpath=../..").inner_text()
                    matches = re.findall(r'₹\s*([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,3},[0-9]{3})', parent_text)
                    for m in matches:
                        val = clean_inr_price(m)
                        if 5000 <= val <= 90000:
                            result["price"] = val
                            result["source"] = "regex_near_h1"
                            break
            except Exception:
                pass

        # Global body regex fallback if still unextracted
        if not result["price"]:
            try:
                body_text = page.locator("body").inner_text()
                matches = re.findall(r'₹\s*([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,3},[0-9]{3})', body_text)
                for m in matches:
                    val = clean_inr_price(m)
                    if 10000 <= val <= 60000:
                        result["price"] = val
                        result["source"] = "body_regex"
                        break
            except Exception:
                pass

        # ----------------------------------------------------------------------
        # LAYER (c): Delivery Pincode Check & Stock State
        # ----------------------------------------------------------------------
        # 1. Enter target delivery pincode BEFORE evaluating stock & delivery
        try:
            pincode_input = page.locator('#pincodeInputId, input[placeholder*="pincode" i], input[placeholder*="PIN code" i], input[placeholder*="Delivery" i]')
            if pincode_input.count() > 0 and pincode_input.first.is_visible():
                pincode_input.first.scroll_into_view_if_needed(timeout=2000)
                pincode_input.first.click()
                pincode_input.first.fill('')
                pincode_input.first.type(pincode, delay=random.randint(40, 80))
                time.sleep(0.3)

                check_btn = page.locator('span:has-text("Check"), span._2P_LDn, button:has-text("Check")')
                if check_btn.count() > 0 and check_btn.first.is_visible():
                    check_btn.first.click()
                else:
                    pincode_input.first.press('Enter')
                time.sleep(1.8)
        except Exception as pin_err:
            if IS_DEBUG_MODE:
                print(f"   🔍 [DEBUG] Pincode entry note: {pin_err}")

        # 2. Extract delivery estimate text right after pincode check
        delivery_locators = [
            "div._3XINqE",
            "span._1TPvTK",
            "div:has-text('Delivery by')",
            "div.hVvnXm",
            "div:has-text('Delivery in')",
            "div:has-text('Delivered by')",
            "div:has-text('Not deliverable')",
            "div:has-text('Currently out of stock')"
        ]
        found_delivery = None
        for d_sel in delivery_locators:
            try:
                loc = page.locator(d_sel)
                count = loc.count()
                for k in range(min(4, count)):
                    raw_text = loc.nth(k).inner_text().strip()
                    for line in raw_text.split('\n'):
                        cleaned = line.strip()
                        if is_valid_delivery_text(cleaned):
                            found_delivery = cleaned[:80]
                            break
                    if found_delivery:
                        break
            except Exception:
                continue
            if found_delivery:
                break

        result["delivery_text"] = found_delivery

        # 3. Evaluate explicit out-of-stock indicators, buttons, and delivery text
        out_of_stock_indicators = [
            "text='Currently Out of Stock'",
            "text='Currently out of stock in this area'",
            "text='Sold Out'",
            "text='Item is out of stock'",
            "div._16FRp0",
            "div._1V9wT4"
        ]
        is_sold_out = any(page.locator(ind).count() > 0 for ind in out_of_stock_indicators)

        buy_now_btn = page.locator("button:has-text('Buy Now'), button:has-text('Add to Cart'), button._2KpZ6l._2U9uOA")
        has_buy_button = buy_now_btn.count() > 0 and buy_now_btn.first.is_visible()

        delivery_lower = (found_delivery or "").lower()
        is_delivery_unavailable = ("not deliverable" in delivery_lower) or ("out of stock" in delivery_lower)

        if is_sold_out or not has_buy_button or is_delivery_unavailable:
            result["status"] = "out_of_stock"
        else:
            result["status"] = "in_stock"

        # Check if parsing succeeded
        if result["price"] and result["price"] > 1000:
            result["success"] = True
        else:
            if IS_DEBUG_MODE:
                dump_debug_artifacts(page, "Price extraction failed (no price found)")

    except PlaywrightTimeoutError:
        print(f"   ⏱️ Timeout loading {url}")
        if IS_DEBUG_MODE:
            dump_debug_artifacts(page, "Navigation timeout")
    except Exception as e:
        print(f"   ⚠️ Scrape exception: {e}")
        if IS_DEBUG_MODE:
            dump_debug_artifacts(page, f"Exception: {e}")

    return result


def main():
    today_str = datetime.date.today().isoformat()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    print("=" * 70)
    print(f"🛒 SPECLEDGER FLIPKART DAILY SYNC · {today_str}")
    print(f"📍 Target Pincode: {TARGET_PINCODE} (Prefix: {PINCODE_PREFIX} - West Bengal / East)")
    if IS_DEBUG_MODE:
        print("🐞 DEBUG MODE: ENABLED (Will log page title/HTTP status and dump artifacts on failure)")
    print("=" * 70)

    # 1. Fetch phones from Supabase
    try:
        phones_res = supabase.table("phones").select(
            "id, brand, model_name, current_price_inr, flipkart_url, launch_price_inr"
        ).execute()
        all_phones = phones_res.data or []
    except Exception as e:
        print(f"❌ Failed to query phones table: {e}")
        sys.exit(1)

    if IS_LIST_MISSING_URLS:
        missing = [p for p in all_phones if "/p/" not in (p.get("flipkart_url") or "")]
        missing.sort(key=lambda x: (x.get("brand") or "", x.get("model_name") or ""))
        linked_count = len(all_phones) - len(missing)
        print(f"\n📋 Unlinked Phones Audit ({len(missing)} missing / {len(all_phones)} total; {linked_count} already linked with /p/):\n")
        if not missing:
            print("✅ All phones have direct /p/ Flipkart URLs!")
        else:
            for idx, p in enumerate(missing, 1):
                print(f"  {idx:2d}. {p['id']:<32} | {p['model_name']}")
        print("")
        return

    # 2. Fetch existing pincode availability for comparison
    try:
        stock_res = supabase.table("pincode_availability").select(
            "phone_id, status, last_in_stock_date"
        ).eq("pincode_prefix", PINCODE_PREFIX).execute()
        current_stock_map = {row["phone_id"]: row for row in (stock_res.data or [])}
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch pincode_availability: {e}")
        current_stock_map = {}

    # Filter for real Flipkart product URLs containing '/p/'
    active_phones = []
    skipped_count = 0

    for phone in all_phones:
        url = phone.get("flipkart_url", "")
        if "/p/" in url:
            active_phones.append(phone)
        else:
            skipped_count += 1
            print(f"ℹ️ Skipping '{phone['model_name']}': placeholder search URL ({url})")

    print(f"\n📱 Found {len(active_phones)} active product URLs to scrape ({skipped_count} placeholder search URLs skipped).\n")

    if not active_phones:
        print("ℹ️ No active Flipkart product URLs (/p/) found. Update phone URLs in Supabase to start scraping.")
        return

    # 3. Launch Playwright Chromium with Stealth Arguments
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certificate-errors",
                "--disable-extensions",
            ]
        )

        chosen_ua = random.choice(USER_AGENTS)
        chosen_vp = random.choice(VIEWPORTS)

        context = browser.new_context(
            user_agent=chosen_ua,
            viewport=chosen_vp,
            locale="en-IN",
            timezone_id="Asia/Kolkata",
            extra_http_headers={
                "Accept-Language": "en-IN,en;q=0.9",
                "Upgrade-Insecure-Requests": "1"
            }
        )

        # Stealth evasion scripts: hide webdriver, mock chrome.runtime, plugins, languages
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            window.chrome = {
                runtime: {}
            };
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-IN', 'en', 'hi']
            });
        """)

        page = context.new_page()

        scraped_success = 0
        scraped_failed = 0
        restock_alerts = 0
        price_drop_alerts = 0

        for idx, phone in enumerate(active_phones, start=1):
            phone_id = phone["id"]
            name = phone["model_name"]
            url = phone["flipkart_url"]
            old_price = phone.get("current_price_inr") or 0

            prev_stock_record = current_stock_map.get(phone_id, {})
            prev_status = prev_stock_record.get("status", "out_of_stock")
            prev_last_in_stock = prev_stock_record.get("last_in_stock_date", today_str)

            print(f"[{idx}/{len(active_phones)}] Scraping: {name}...")
            data = scrape_flipkart_product(page, url, TARGET_PINCODE)

            # CRITICAL: If live parsing fails, log [FAIL] and skip ALL database writes
            if not data["success"] or data["price"] is None or data["price"] <= 1000:
                scraped_failed += 1
                print(f"   ❌ [FAIL] Live parsing failed for '{name}'. Skipping ALL database updates (retaining existing price ₹{old_price:,}).\n")
                continue

            price_to_record = data["price"]
            new_status = data["status"]
            delivery_text = data["delivery_text"] or (
                f"In Stock for {TARGET_PINCODE}" if new_status != 'out_of_stock' else f"Unavailable for {TARGET_PINCODE}"
            )
            scraped_success += 1
            print(f"   ✅ [OK] Live extracted: ₹{price_to_record:,} (Source: {data.get('source', 'live')}) | Stock: {new_status} | Delivery: {delivery_text}")

            # Determine restock transition (out_of_stock -> in_stock becomes 'back_in_stock')
            final_status = new_status
            if prev_status == 'out_of_stock' and new_status == 'in_stock':
                final_status = 'back_in_stock'
                restock_alerts += 1
                last_in_stock_date = today_str

                print(f"   🚨 RESTOCK DETECTED! {name} is back in stock for PIN {TARGET_PINCODE}!")
                send_telegram_alert(
                    f"🔥 <b>RESTOCK ALERT — SpecLedger</b>\n\n"
                    f"📱 <b>{name}</b> is back in stock for PIN <b>{TARGET_PINCODE}</b> (West Bengal)!\n"
                    f"💰 Current Price: <b>₹{price_to_record:,}</b>\n"
                    f"🚚 {delivery_text}\n\n"
                    f"👉 <a href='{url}'>Buy on Flipkart</a>"
                )
            elif new_status == 'in_stock':
                last_in_stock_date = today_str
            else:
                last_in_stock_date = prev_last_in_stock

            # Determine price drop
            price_diff = old_price - price_to_record
            pct_drop = (price_diff / old_price) * 100 if old_price > 0 else 0

            if price_diff >= 1000 or pct_drop >= 5.0:
                price_drop_alerts += 1
                print(f"   📉 PRICE DROP! ₹{old_price:,} ➔ ₹{price_to_record:,} (Down ₹{price_diff:,} / -{pct_drop:.1f}%)")
                send_telegram_alert(
                    f"📉 <b>PRICE DROP ALERT — SpecLedger</b>\n\n"
                    f"📱 <b>{name}</b> dropped in price!\n"
                    f"💰 Old Price: <s>₹{old_price:,}</s>\n"
                    f"🔥 New Price: <b>₹{price_to_record:,}</b> (-₹{price_diff:,} / -{pct_drop:.1f}%)\n"
                    f"📦 Delivery to {TARGET_PINCODE}: {final_status.replace('_', ' ').title()}\n\n"
                    f"👉 <a href='{url}'>Check on Flipkart</a>"
                )

            # 4. Upsert today's snapshot into price_history
            try:
                supabase.table("price_history").upsert({
                    "phone_id": phone_id,
                    "store": "flipkart",
                    "price_inr": price_to_record,
                    "in_stock": final_status != 'out_of_stock',
                    "recorded_at": today_str,
                    "source": "live_scrape"
                }, on_conflict="phone_id,store,recorded_at").execute()
            except Exception as e:
                print(f"   ❌ Error updating price_history: {e}")

            # 5. Update phones table current_price_inr
            try:
                supabase.table("phones").update({
                    "current_price_inr": price_to_record,
                    "updated_at": now_iso
                }).eq("id", phone_id).execute()
            except Exception as e:
                print(f"   ❌ Error updating phones: {e}")

            # 6. Upsert pincode_availability
            try:
                supabase.table("pincode_availability").upsert({
                    "phone_id": phone_id,
                    "pincode_prefix": PINCODE_PREFIX,
                    "sample_pincode": TARGET_PINCODE,
                    "status": final_status,
                    "delivery_text": delivery_text,
                    "last_in_stock_date": last_in_stock_date,
                    "last_checked_at": now_iso
                }, on_conflict="phone_id,pincode_prefix").execute()
            except Exception as e:
                print(f"   ❌ Error updating pincode_availability: {e}")

            print(f"   💾 Saved: ₹{price_to_record:,} · Status: {final_status} · Last seen: {last_in_stock_date}")

            # Randomized delay between requests (5 to 11 seconds)
            if idx < len(active_phones):
                delay = random.uniform(5.0, 11.0)
                print(f"   ⏳ Sleeping {delay:.1f}s to respect Flipkart rate limits...\n")
                time.sleep(delay)

        context.close()
        browser.close()

    print("\n" + "=" * 70)
    print("✨ DAILY SYNC RUN COMPLETED")
    print(f"📊 Phones Processed: {len(active_phones)} | Success: {scraped_success} | Failed/Skipped: {scraped_failed}")
    print(f"🚨 Restock Alerts: {restock_alerts} | 📉 Price Drop Alerts: {price_drop_alerts}")
    print("=" * 70)

    if len(active_phones) > 0 and scraped_success == 0:
        print("❌ [ERROR] All active product scrapes failed (0 succeeded). Exiting with code 1.")
        sys.exit(1)


if __name__ == "__main__":
    main()
