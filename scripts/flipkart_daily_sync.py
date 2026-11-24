#!/usr/bin/env python3
"""
Flipkart Daily Price & Pincode Stock Sync Script (Playwright)
------------------------------------------------------------
Runs via GitHub Actions daily at 08:30 AM IST (03:00 UTC) or manually.
1. Queries Supabase for phones with active Flipkart product URLs (/p/).
2. Launches headless Chromium with randomized User-Agents and viewports.
3. Checks delivery availability for TARGET_PINCODE (default 700034, West Bengal).
4. Extracts live INR price and delivery/stock status.
5. Detects restock events (out_of_stock -> in_stock) and price drops (>= ₹1,000 or >= 5%).
6. Sends instant Telegram alerts for Restock & Price Drops.
7. Upserts to price_history, phones, and pincode_availability in Supabase.
"""

import os
import re
import sys
import time
import random
import datetime
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load .env file if running locally
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
TARGET_PINCODE = os.getenv('TARGET_PINCODE', '700034').strip()
PINCODE_PREFIX = TARGET_PINCODE[0] if TARGET_PINCODE else '7'

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

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

# Realistic Desktop User-Agents and Viewports
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
]

VIEWPORTS = [
    {"width": 1440, "height": 900},
    {"width": 1920, "height": 1080},
    {"width": 1366, "height": 768},
    {"width": 1536, "height": 864}
]


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
    clean = re.sub(r'[^\d]', '', price_text)
    return int(clean) if clean else 0


def scrape_flipkart_product(page, url: str, pincode: str) -> dict:
    """
    Navigates to a Flipkart product page, sets delivery pincode,
    and returns live price, stock status, and delivery text.
    """
    result = {
        "price": None,
        "status": "out_of_stock",
        "delivery_text": None,
        "success": False
    }

    try:
        page.goto(url, wait_until="domcontentloaded", timeout=45000)
        time.sleep(2)

        # 1. Dismiss any login popup if present
        try:
            close_btn = page.locator('button._2KpZ6l._2doB4z, span[role="button"]:has-text("✕"), span._30XB9F')
            if close_btn.count() > 0 and close_btn.first.is_visible():
                close_btn.first.click(timeout=3000)
                time.sleep(0.5)
        except Exception:
            pass

        # 2. Extract Price
        # Flipkart uses several class variants for the main product price
        price_selectors = [
            "div.Nx9bqj.CxhGGd",
            "div._30jeq3._16Jk6d",
            "div[class*='Nx9bqj'][class*='CxhGGd']",
            "div[class*='_30jeq3']",
            "span[class*='price']"
        ]

        for sel in price_selectors:
            locator = page.locator(sel)
            if locator.count() > 0:
                raw_text = locator.first.inner_text().strip()
                extracted = clean_inr_price(raw_text)
                if extracted > 1000:
                    result["price"] = extracted
                    break

        # 3. Enter delivery pincode to check location stock
        pincode_input = page.locator('#pincodeInputId, input[placeholder*="pincode" i], input[placeholder*="PIN code" i]')
        if pincode_input.count() > 0:
            try:
                pincode_input.first.scroll_into_view_if_needed(timeout=3000)
                pincode_input.first.click()
                pincode_input.first.fill('')
                pincode_input.first.type(pincode, delay=random.randint(50, 100))
                time.sleep(0.5)

                # Click "Check" button or press Enter
                check_btn = page.locator('span:has-text("Check"), span._2P_LDn, button:has-text("Check")')
                if check_btn.count() > 0 and check_btn.first.is_visible():
                    check_btn.first.click()
                else:
                    pincode_input.first.press('Enter')
                time.sleep(2)
            except Exception as e:
                print(f"      Pincode input notice: {e}")

        # 4. Check Stock Availability
        # Look for explicit out-of-stock badges
        out_of_stock_indicators = [
            "text='Currently Out of Stock'",
            "text='Sold Out'",
            "text='Item is out of stock'",
            "div._16FRp0",
            "div._1V9wT4"
        ]

        is_sold_out = False
        for ind in out_of_stock_indicators:
            if page.locator(ind).count() > 0:
                is_sold_out = True
                break

        # Check for Buy Now / Add to Cart buttons
        buy_now_btn = page.locator("button:has-text('Buy Now'), button:has-text('Add to Cart'), button._2KpZ6l._2U9uOA")
        has_buy_button = buy_now_btn.count() > 0

        # Extract delivery estimate text
        delivery_locators = [
            "div._3XINqE",
            "span._1TPvTK",
            "div:has-text('Delivery by')",
            "div.hVvnXm"
        ]
        for d_sel in delivery_locators:
            loc = page.locator(d_sel)
            if loc.count() > 0:
                d_text = loc.first.inner_text().strip()
                if "Delivery" in d_text:
                    result["delivery_text"] = d_text.split('\n')[0][:80]
                    break

        if is_sold_out or not has_buy_button:
            result["status"] = "out_of_stock"
        else:
            result["status"] = "in_stock"

        result["success"] = True

    except PlaywrightTimeoutError:
        print(f"      ⏱️ Timeout loading {url}")
    except Exception as e:
        print(f"      ⚠️ Scrape exception: {e}")

    return result


def main():
    today_str = datetime.date.today().isoformat()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    print("=" * 70)
    print(f"🛒 SPECLEDGER FLIPKART DAILY SYNC · {today_str}")
    print(f"📍 Target Pincode: {TARGET_PINCODE} (Prefix: {PINCODE_PREFIX} - West Bengal / East)")
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

    # 3. Launch Playwright Headless Chromium
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ]
        )

        context = browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport=random.choice(VIEWPORTS),
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )
        page = context.new_page()

        scraped_success = 0
        restock_alerts = 0
        price_drop_alerts = 0

        for idx, phone in enumerate(active_phones, start=1):
            phone_id = phone["id"]
            name = phone["model_name"]
            url = phone["flipkart_url"]
            old_price = phone["current_price_inr"]

            prev_stock_record = current_stock_map.get(phone_id, {})
            prev_status = prev_stock_record.get("status", "out_of_stock")
            prev_last_in_stock = prev_stock_record.get("last_in_stock_date", today_str)

            print(f"[{idx}/{len(active_phones)}] Scraping: {name}...")
            data = scrape_flipkart_product(page, url, TARGET_PINCODE)

            if not data["success"] or data["price"] is None:
                print(f"   ⚠️ Could not parse live data; keeping previous price ₹{old_price:,}")
                price_to_record = old_price
                new_status = prev_status
                delivery_text = "Live check inconclusive"
            else:
                price_to_record = data["price"]
                new_status = data["status"]
                delivery_text = data["delivery_text"] or f"Status: {new_status}"
                scraped_success += 1

            # Determine restock transition
            # Transition: out_of_stock -> in_stock becomes 'back_in_stock'
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
                    "recorded_at": today_str
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

            print(f"   ✅ Recorded: ₹{price_to_record:,} · Status: {final_status} · Last seen: {last_in_stock_date}")

            # Randomized delay between requests (5 to 11 seconds)
            if idx < len(active_phones):
                delay = random.uniform(5.0, 11.0)
                print(f"   ⏳ Sleeping {delay:.1f}s to respect Flipkart rate limits...\n")
                time.sleep(delay)

        context.close()
        browser.close()

    print("\n" + "=" * 70)
    print("✨ DAILY SYNC RUN COMPLETED")
    print(f"📊 Phones Processed: {len(active_phones)} | Success: {scraped_success}")
    print(f"🚨 Restock Alerts: {restock_alerts} | 📉 Price Drop Alerts: {price_drop_alerts}")
    print("=" * 70)


if __name__ == "__main__":
    main()
