-- ==============================================================================
-- SpecLedger Migration 002: Price History Source Tagging & Event Notes
-- ==============================================================================
-- Adds `source` ('historical_anchor' | 'live_scrape') and optional `event_note`
-- to `public.price_history` so pre-Dec 2026 anchor points and automated daily
-- Flipkart scrapes coexist cleanly.
-- ==============================================================================

ALTER TABLE public.price_history
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'live_scrape';

ALTER TABLE public.price_history
    DROP CONSTRAINT IF EXISTS chk_price_history_source;

ALTER TABLE public.price_history
    ADD CONSTRAINT chk_price_history_source
    CHECK (source IN ('historical_anchor', 'live_scrape'));

ALTER TABLE public.price_history
    ADD COLUMN IF NOT EXISTS event_note TEXT;

-- Index for filtering/cleanup by source and recorded date
CREATE INDEX IF NOT EXISTS idx_price_history_source_date
    ON public.price_history (source, recorded_at);
