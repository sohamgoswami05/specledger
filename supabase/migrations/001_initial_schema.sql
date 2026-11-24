-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Project: PhoneLedger / SmartPickr
-- Description: Core schema for sub-₹30,000 Indian smartphone price tracking,
--              daily Flipkart price history, and West Bengal (7xxxxx) stock tracking.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Automatic updated_at Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Phones Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phones (
    id TEXT PRIMARY KEY, -- e.g. 'oneplus-nord-ce4-8-128'
    brand TEXT NOT NULL CHECK (brand IN ('Vivo', 'OnePlus', 'Realme', 'Samsung')),
    model_name TEXT NOT NULL,
    ram_storage_variant TEXT NOT NULL, -- e.g. '8GB / 128GB'
    release_date DATE,
    launch_price_inr INTEGER NOT NULL CHECK (launch_price_inr > 0),
    current_price_inr INTEGER NOT NULL CHECK (current_price_inr > 0),
    flipkart_url TEXT NOT NULL,
    amazon_url TEXT, -- nullable for Phase 3 expansion
    image_url TEXT,
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    forecast JSONB, -- reserved for Phase 4 ML: { "signal": "buy" | "wait", "confidence": 0.85 }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS set_phones_updated_at ON public.phones;
CREATE TRIGGER set_phones_updated_at
    BEFORE UPDATE ON public.phones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helpful indexes for brand and price ceiling lookups
CREATE INDEX IF NOT EXISTS idx_phones_brand ON public.phones (brand);
CREATE INDEX IF NOT EXISTS idx_phones_current_price ON public.phones (current_price_inr);

-- ------------------------------------------------------------------------------
-- 3. Price History Table (Daily Store Scraping Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
    id BIGSERIAL PRIMARY KEY,
    phone_id TEXT NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
    store TEXT NOT NULL DEFAULT 'flipkart' CHECK (store IN ('flipkart', 'amazon')),
    price_inr INTEGER NOT NULL CHECK (price_inr > 0),
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    recorded_at DATE NOT NULL,
    CONSTRAINT uq_phone_store_recorded_at UNIQUE (phone_id, store, recorded_at)
);

-- Fast composite index for querying 365-day price trajectories per phone
CREATE INDEX IF NOT EXISTS idx_price_history_lookup
    ON public.price_history (phone_id, store, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Pincode Availability Table (West Bengal 7xxxxx / Eastern Hub Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pincode_availability (
    id BIGSERIAL PRIMARY KEY,
    phone_id TEXT NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
    pincode_prefix TEXT NOT NULL DEFAULT '7',
    sample_pincode TEXT NOT NULL DEFAULT '700034',
    status TEXT NOT NULL CHECK (status IN ('in_stock', 'back_in_stock', 'out_of_stock')),
    delivery_text TEXT, -- e.g. 'Delivery by 27 Nov, Fri'
    last_in_stock_date DATE,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_phone_pincode_prefix UNIQUE (phone_id, pincode_prefix)
);

CREATE INDEX IF NOT EXISTS idx_pincode_availability_lookup
    ON public.pincode_availability (phone_id, pincode_prefix, status);

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) & Access Policies
-- ------------------------------------------------------------------------------
-- Enable RLS across all tables
ALTER TABLE public.phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincode_availability ENABLE ROW LEVEL SECURITY;

-- Public read-only access (anon & authenticated roles) for client queries
DROP POLICY IF EXISTS "Public read access for phones" ON public.phones;
CREATE POLICY "Public read access for phones"
    ON public.phones
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Public read access for price_history" ON public.price_history;
CREATE POLICY "Public read access for price_history"
    ON public.price_history
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Public read access for pincode_availability" ON public.pincode_availability;
CREATE POLICY "Public read access for pincode_availability"
    ON public.pincode_availability
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Explicit write restrictions: Service role only (bypasses RLS by default in Supabase)
-- All INSERT, UPDATE, DELETE requests from anon or authenticated roles are denied.

-- ------------------------------------------------------------------------------
-- 6. Lightweight Aggregated View: phone_catalog_summary
-- ------------------------------------------------------------------------------
-- Joins phones with:
--   1) Latest West Bengal 7xxxxx availability
--   2) 365-day price statistics (min, max, avg) from price_history (Flipkart)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.phone_catalog_summary AS
WITH stats_365d AS (
    SELECT
        phone_id,
        MIN(price_inr) AS min_1y_price,
        MAX(price_inr) AS max_1y_price,
        ROUND(AVG(price_inr))::INTEGER AS avg_1y_price,
        COUNT(*) AS recorded_days_count
    FROM public.price_history
    WHERE store = 'flipkart'
      AND recorded_at >= (CURRENT_DATE - INTERVAL '365 days')
    GROUP BY phone_id
)
SELECT
    p.id,
    p.brand,
    p.model_name,
    p.ram_storage_variant,
    p.release_date,
    p.launch_price_inr,
    p.current_price_inr,
    p.flipkart_url,
    p.amazon_url,
    p.image_url,
    p.specs,
    p.forecast,
    p.created_at,
    p.updated_at,
    -- Pincode availability (West Bengal 7xxxxx)
    pa.pincode_prefix AS delivery_zone_prefix,
    pa.sample_pincode,
    COALESCE(pa.status, 'out_of_stock') AS stock_status_wb,
    pa.delivery_text,
    pa.last_in_stock_date,
    pa.last_checked_at,
    -- 365-day Price Intelligence Aggregates
    COALESCE(s.min_1y_price, p.current_price_inr) AS min_1y_price,
    COALESCE(s.max_1y_price, p.current_price_inr) AS max_1y_price,
    COALESCE(s.avg_1y_price, p.current_price_inr) AS avg_1y_price,
    COALESCE(s.recorded_days_count, 0) AS recorded_days_count,
    -- Deal Badges
    (p.current_price_inr <= COALESCE(s.min_1y_price, p.current_price_inr)) AS is_at_year_low,
    CASE 
        WHEN COALESCE(s.avg_1y_price, 0) > p.current_price_inr 
        THEN ROUND(((s.avg_1y_price - p.current_price_inr)::NUMERIC / s.avg_1y_price) * 100, 1)
        ELSE 0.0
    END AS percent_below_avg
FROM public.phones p
LEFT JOIN public.pincode_availability pa
    ON p.id = pa.phone_id AND pa.pincode_prefix = '7'
LEFT JOIN stats_365d s
    ON p.id = s.phone_id;

-- Ensure view is queryable by client roles
GRANT SELECT ON public.phone_catalog_summary TO anon, authenticated;
