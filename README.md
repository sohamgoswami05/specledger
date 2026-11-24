# SpecLedger (https://specledger.pages.dev)

> Sub-₹30,000 Flipkart price ledger & technical spec matrix for budget-conscious Indian smartphone buyers.

SpecLedger tracks daily Flipkart prices, compares technical specs side by side across up to 3 slots, monitors 1-year historical price trajectories, and provides pincode-level stock and restock intelligence for West Bengal / Eastern India (`7xxxxx`).

## Features
- **Strict Sub-₹30,000 Catalog:** Vivo, OnePlus, Realme, and Samsung devices under ₹30,000.
- **3-Slot Side-by-Side Spec Matrix:** Direct hardware comparison with best-in-row highlights (`#0F766E`), diff highlighting, and sticky headers.
- **365-Day Daily Flipkart Price History:** Interactive SVG chart with 1-Year Low, 1-Year High, 1-Year Average reference lines, and festival discount benchmarks (Republic Day, Big Billion Days, Diwali).
- **Delivery Pincode & Restock Tracker:** Delivery validation (defaults to `700034` Kolkata / West Bengal) with daily restock monitoring and persistent watchlist drawer.
- **Live Search & Autocomplete:** Dynamic search by model name, brand, or chipset with quick compare and inspect triggers.
- **Production-Ready Automation:** Supabase PostgreSQL backend, Playwright headless daily sync script, and GitHub Actions cron workflow.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Design System:** Direction A (Analytical Consumer Ledger), `#F7F7F5` background, `#FFFFFF` surfaces, `#141413` text, `#0F766E` accent, Plus Jakarta Sans & IBM Plex Sans typography
- **Data & Automation:** Supabase PostgreSQL, Python 3.11, Playwright
