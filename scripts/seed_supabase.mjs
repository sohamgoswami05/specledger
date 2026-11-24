import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { RAW_CATALOG, generateBaselineSnapshot } from '../src/data/catalogData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env manually
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
console.log(`🔗 Connected to Supabase at: ${supabaseUrl}`);

function sanitizeUrl(url) {
  if (!url) return url;
  return url
    .replace('flipkarrt.com', 'flipkart.com')
    .replace('flipkart.coom', 'flipkart.com')
    .replace('seaarch', 'search')
    .replace('searcch', 'search');
}

export async function runFullSeed() {
  console.log(`\n🚀 Seeding ${RAW_CATALOG.length} finalized SpecLedger models into Supabase...`);

  // Query existing phones to preserve any real /p/ URLs already stored in Supabase
  const { data: existingRows } = await supabase
    .from('phones')
    .select('id, flipkart_url');
  const existingPUrls = new Map();
  if (existingRows) {
    existingRows.forEach((r) => {
      if (r.flipkart_url && r.flipkart_url.includes('/p/')) {
        existingPUrls.set(r.id, r.flipkart_url);
      }
    });
  }

  const phonesPayload = RAW_CATALOG.map((p) => {
    const finalUrl = existingPUrls.get(p.id) || sanitizeUrl(p.flipkart_url);
    return {
      id: p.id,
      brand: p.brand,
      model_name: p.model_name,
      ram_storage_variant: p.ram_storage_variant,
      release_date: p.release_date,
      launch_price_inr: p.launch_price_inr,
      current_price_inr: p.current_price_inr,
      flipkart_url: finalUrl,
      amazon_url: null,
      image_url: p.image_url,
      specs: p.specs,
      forecast: p.forecast,
      is_special_mention: Boolean(p.is_special_mention),
      special_mention_note: p.special_mention_note || null,
      special_mention_tier: p.special_mention_tier || null,
    };
  });

  const pincodePayload = RAW_CATALOG.map((p) => ({
    phone_id: p.id,
    pincode_prefix: '7',
    sample_pincode: '700034',
    status: p.stock_status,
    delivery_text: p.delivery_text,
    last_in_stock_date: p.last_in_stock_date,
    last_checked_at: new Date().toISOString(),
  }));

  // Single current baseline snapshot per phone (no synthetic 365-day festival dips)
  const baselineHistory = [];
  RAW_CATALOG.forEach((p) => {
    baselineHistory.push(...generateBaselineSnapshot(p.id, p.current_price_inr));
  });

  // 1. Upsert phones table
  const { error: phoneErr } = await supabase.from('phones').upsert(phonesPayload, { onConflict: 'id' });
  if (phoneErr) {
    console.error('❌ Failed to upsert phones:', phoneErr);
    process.exit(1);
  }
  console.log(`✅ Upserted ${phonesPayload.length} phones into 'phones' table.`);

  // 2. Upsert pincode availability
  const { error: pinErr } = await supabase
    .from('pincode_availability')
    .upsert(pincodePayload, { onConflict: 'phone_id,pincode_prefix' });
  if (pinErr) {
    console.error('❌ Failed to upsert pincode availability:', pinErr);
    process.exit(1);
  }
  console.log(`✅ Upserted ${pincodePayload.length} records into 'pincode_availability' (West Bengal 700034).`);

  // 3. Upsert single baseline price point per phone
  const { error: histErr } = await supabase
    .from('price_history')
    .upsert(
      baselineHistory.map((c) => ({
        phone_id: c.phone_id,
        store: c.store,
        price_inr: c.price_inr,
        in_stock: c.in_stock,
        recorded_at: c.recorded_at,
      })),
      { onConflict: 'phone_id,store,recorded_at' }
    );
  if (histErr) {
    console.error('❌ Failed to upsert baseline price_history:', histErr);
    process.exit(1);
  }
  console.log(`✅ Seeded ${baselineHistory.length} current baseline price points (synthetic 365-day dips disabled).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullSeed();
}
