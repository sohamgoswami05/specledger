import type { Phone } from '../types/phone';
import { RAW_CATALOG, generateRealisticStepCurve } from './catalogData';

export const phones: Phone[] = RAW_CATALOG.map((raw) => {
  const history = generateRealisticStepCurve(
    raw.id,
    raw.current_price_inr,
    raw.launch_price_inr,
    raw.lowest_ever,
    raw.highest_ever,
    raw.is_newer_model
  );

  let minP = Infinity;
  let maxP = -Infinity;
  let sumP = 0;
  history.forEach((pt) => {
    if (pt.price_inr < minP) minP = pt.price_inr;
    if (pt.price_inr > maxP) maxP = pt.price_inr;
    sumP += pt.price_inr;
  });
  const avgP = Math.round(sumP / history.length);

  const isAtYearLow = raw.current_price_inr <= minP;
  const percentDiff = ((avgP - raw.current_price_inr) / avgP) * 100;
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
  };
});

export const DEFAULT_COMPARE_IDS = [
  'oneplus-nord-ce4-8-128',
  'samsung-galaxy-a36-8-256',
  'realme-p4-power-8-128',
];
