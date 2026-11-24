import type { Phone } from '../types/phone';
import { RAW_CATALOG, generateBaselineSnapshot } from './catalogData';

export const phones: Phone[] = RAW_CATALOG.map((raw) => {
  const history = generateBaselineSnapshot(raw.id, raw.current_price_inr);

  const minP = Math.min(raw.current_price_inr, raw.launch_price_inr);
  const maxP = Math.max(raw.current_price_inr, raw.launch_price_inr);
  const avgP = Math.round((minP + maxP) / 2);

  const isAtYearLow = raw.current_price_inr <= minP;
  const percentDiff = avgP > 0 ? ((avgP - raw.current_price_inr) / avgP) * 100 : 0;
  const percentBelowAvg = Math.max(0, Math.round(percentDiff * 10) / 10);

  return {
    id: raw.id,
    name: raw.model_name,
    brand: raw.brand as any,
    model: `${raw.model_name} (${raw.ram_storage_variant})`,
    image: raw.image_url,
    currentPrice: raw.current_price_inr,
    mrp: raw.launch_price_inr,
    oneYearLow: minP,
    oneYearHigh: maxP,
    oneYearAvg: avgP,
    isAtYearLow,
    percentBelowAvg,
    priceHistory: history.map((h) => ({
      date: h.recorded_at,
      price: h.price_inr,
      event: h.event,
    })),
    forecastStatus: raw.forecast.signal === 'buy' ? 'At Floor' : 'Stable',
    forecastNote: raw.forecast.signal === 'buy'
      ? 'Currently trading near its 1-year floor price on Flipkart.'
      : 'Stable market price; next discount expected during seasonal sale event.',
    pincodeAvailability: {
      regionPrefix: '7',
      status: raw.stock_status as any,
      lastCheckedAt: '2026-11-24 09:00 AM IST',
      lastInStockDate: raw.last_in_stock_date,
      estimatedDeliveryDays: 2,
    },
    store: {
      storeName: 'Flipkart',
      url: raw.flipkart_url,
      inStock: raw.stock_status !== 'out_of_stock',
      seller: raw.specs.seller || 'OmniTechRetail (Flipkart Assured)',
      bankOffers: raw.specs.bankOffers || '₹1,500 Instant Discount with Bank Cards',
      exchangeBonus: raw.current_price_inr > 20000 ? 'Up to ₹18,000 off on exchange' : 'Up to ₹12,000 off on exchange',
      assuredBadge: true,
    },
    specs: {
      releaseDate: raw.specs.releaseDate,
      chipset: raw.specs.chipset,
      cpuDetails: raw.specs.cpuDetails,
      antutuScore: raw.specs.antutuScore,
      ram: raw.specs.ram,
      ramType: raw.specs.ramType,
      storage: raw.specs.storage,
      storageType: raw.specs.storageType,
      expandableStorage: raw.specs.expandableStorage,
      displaySize: raw.specs.displaySize,
      displayType: raw.specs.displayType,
      resolution: raw.specs.resolution,
      refreshRate: raw.specs.refreshRate,
      peakBrightness: raw.specs.peakBrightness,
      rearCamera: raw.specs.rearCamera,
      frontCamera: raw.specs.frontCamera,
      batteryCapacity: raw.specs.batteryCapacity,
      chargingSpeed: raw.specs.chargingSpeed,
      wirelessCharging: raw.specs.wirelessCharging,
      os: raw.specs.os,
      fiveGBands: raw.specs.fiveGBands,
      weightGrams: raw.specs.weightGrams,
      thicknessMm: raw.specs.thicknessMm,
    },
    pros: raw.specs.pros,
    cons: raw.specs.cons,
    isSpecialMention: Boolean(raw.is_special_mention || raw.current_price_inr > 30000),
    specialMentionNote: raw.special_mention_note || (raw.current_price_inr > 30000 ? 'Normally above ₹30,000; high recommendation if seasonal sales drop it below ₹30k.' : undefined),
    specialMentionTier: raw.special_mention_tier,
  };
});

export const DEFAULT_COMPARE_IDS = [
  'oneplus-nord-ce5-8-128',
  'vivo-t4-pro-8-128',
  'realme-p4-pro-8-128',
];
