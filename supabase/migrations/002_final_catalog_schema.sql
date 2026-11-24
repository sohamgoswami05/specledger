-- ==============================================================================
-- SpecLedger Migration 002: Final Catalog Schema & Special Mention Tiers
-- ==============================================================================
-- Adds special_mention_tier ('stretch_30k_35k' | 'budget_under_20k') alongside
-- is_special_mention and special_mention_note on public.phones, and exposes them
-- in public.phone_catalog_summary.
-- ==============================================================================

ALTER TABLE public.phones
    ADD COLUMN IF NOT EXISTS is_special_mention BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.phones
    ADD COLUMN IF NOT EXISTS special_mention_note TEXT;

ALTER TABLE public.phones
    ADD COLUMN IF NOT EXISTS special_mention_tier TEXT;

ALTER TABLE public.phones
    DROP CONSTRAINT IF EXISTS chk_phones_special_mention_tier;

ALTER TABLE public.phones
    ADD CONSTRAINT chk_phones_special_mention_tier
    CHECK (
        special_mention_tier IS NULL
        OR special_mention_tier IN ('stretch_30k_35k', 'budget_under_20k')
    );

CREATE INDEX IF NOT EXISTS idx_phones_special_mention
    ON public.phones (is_special_mention, special_mention_tier);

-- Recreate phone_catalog_summary view exposing special_mention fields
-- Note: Adding columns at the end preserves column order for existing queries.
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
    END AS percent_below_avg,
    -- Special Mention Metadata
    p.is_special_mention,
    p.special_mention_note,
    p.special_mention_tier
FROM public.phones p
LEFT JOIN public.pincode_availability pa
    ON p.id = pa.phone_id AND pa.pincode_prefix = '7'
LEFT JOIN stats_365d s
    ON p.id = s.phone_id;

GRANT SELECT ON public.phone_catalog_summary TO anon, authenticated;
