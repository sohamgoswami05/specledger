-- ==============================================================================
-- SpecLedger Migration 003: Purge Non-Target Prototype Phones
-- ==============================================================================
-- Deletes any phone from public.phones (cascading to price_history and
-- pincode_availability via ON DELETE CASCADE) whose id (slug) is NOT in the
-- finalized 30-model production roster.
-- ==============================================================================

DELETE FROM public.phones
WHERE id NOT IN (
    -- Core Under ₹30,000 (18 models)
    'oneplus-nord-5-8-256',
    'oneplus-nord-ce5-8-128',
    'oneplus-nord-4-8-128',
    'oneplus-nord-ce4-8-128',
    'vivo-v60e-8-128',
    'vivo-v50-8-128',
    'vivo-t4-pro-8-128',
    'vivo-t4-8-128',
    'realme-p4-pro-8-128',
    'realme-15-pro-8-128',
    'realme-p4-8-128',
    'realme-p4x-8-128',
    'realme-gt-6t-8-128',
    'realme-14-pro-plus-8-128',
    'samsung-galaxy-a36-8-128',
    'samsung-galaxy-a26-8-128',
    'samsung-galaxy-m56-8-128',
    'samsung-galaxy-f56-8-128',

    -- Special Mentions: Stretch Picks ₹30k–₹35k (10 models)
    'oneplus-nord-5-12-256',
    'oneplus-13r-12-256',
    'vivo-v60-8-256',
    'vivo-v60e-12-256',
    'vivo-t4-ultra-8-256',
    'realme-gt-7t-8-256',
    'realme-p4s-8-128',
    'samsung-galaxy-s24-fe-8-256',
    'realme-p4-power-8-128',
    'samsung-galaxy-a56-8-128',

    -- Special Mentions: Budget Spotlights Under ₹20k (2 models)
    'realme-p4-lite-6-128',
    'vivo-t4-lite-6-128'
);
