#!/usr/bin/env python3
"""
Seed Script for PhoneLedger / SmartPickr Supabase Database (Python)
------------------------------------------------------------------
Upserts:
1. 21 phones under ₹30,000 across Vivo, OnePlus, Realme, and Samsung with complete structured specs
2. West Bengal (7xxxxx / 700034) delivery availability into pincode_availability
3. 365 days of realistic Indian retail step-curve prices into price_history
"""

import os
import sys
import datetime
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

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase-py not installed. Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

supabase: Client = create_client(supabase_url, service_role_key)
print(f"🔗 Connected to Supabase at: {supabase_url}")

# Run node seeder or execute direct logic
print("🌱 Executing complete database seed...")
os.system(f"node scripts/seed_supabase.mjs")
