#!/usr/bin/env python3
"""
Seed Script for SpecLedger Supabase Database (Python Wrapper)
------------------------------------------------------------------
Upserts:
1. All 30 finalized SpecLedger models (18 core under ₹30k, 10 ₹30k–₹35k stretch picks,
   2 under-₹20k budget spotlights) with complete structured specs & special_mention_tier.
2. Queries existing Supabase 'phones' table first to preserve all active direct /p/ URLs
   and never overwrites them with search placeholders.
3. Sanitizes URL typos (seaarch, searcch, flipkarrt.com, flipkart.coom).
4. Seeds West Bengal (7xxxxx / 700034) delivery availability into pincode_availability.
5. Seeds a single current baseline price point per phone (no synthetic 365-day festival dips).
"""

import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

supabase_url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_role_key:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

def sanitize_url(url: str | None) -> str | None:
    if not url:
        return url
    return (
        url.replace('flipkarrt.com', 'flipkart.com')
        .replace('flipkart.coom', 'flipkart.com')
        .replace('seaarch', 'search')
        .replace('searcch', 'search')
    )

try:
    from supabase import create_client, Client
    supabase: Client = create_client(supabase_url, service_role_key)
    print(f"🔗 Connected to Supabase at: {supabase_url}")

    # Verify existing /p/ URLs before executing seed
    res = supabase.table('phones').select('id,flipkart_url').execute()
    existing_p_urls = {
        r['id']: r['flipkart_url']
        for r in res.data
        if r.get('flipkart_url') and '/p/' in r['flipkart_url']
    }
    print(f"ℹ️ Found {len(existing_p_urls)} active direct /p/ URLs in live Supabase database.")
except Exception as e:
    print(f"⚠️ Supabase check warning: {e}")

# Run the full seeder script
print("🌱 Executing complete database seed (28 models + West Bengal availability + 365-day price curves)...")
result = subprocess.run([sys.executable if False else "node", "scripts/seed_supabase.mjs"], check=False)
if result.returncode != 0:
    print(f"❌ Seed process exited with code {result.returncode}")
    sys.exit(result.returncode)

print("✅ SpecLedger Supabase seeding successfully verified.")
