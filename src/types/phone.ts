export type Brand = 'OnePlus' | 'Samsung' | 'Realme' | 'Vivo';

export type StockStatus = 'in_stock' | 'back_in_stock' | 'out_of_stock';

export interface PincodeAvailability {
  regionPrefix: string; // e.g. '7' for West Bengal / Eastern region
  status: StockStatus;
  lastCheckedAt: string; // e.g. '2026-11-24 09:00 AM IST'
  lastInStockDate: string; // e.g. '2026-11-18'
  estimatedDeliveryDays?: number;
}

export interface PricePoint {
  date: string; // 'YYYY-MM-DD'
  price: number; // INR
  event?: string; // 'Big Billion Days', 'Republic Day Sale', 'Summer Festive', etc.
}

export interface PhoneSpecs {
  releaseDate: string;
  chipset: string;
  cpuDetails: string;
  antutuScore?: string;
  ram: string;
  ramType: string;
  storage: string;
  storageType: string;
  expandableStorage: string;
  displaySize: string;
  displayType: string;
  resolution: string;
  refreshRate: string;
  peakBrightness: string;
  rearCamera: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    features: string;
  };
  frontCamera: {
    resolution: string;
    features: string;
  };
  batteryCapacity: string;
  chargingSpeed: string;
  wirelessCharging: string;
  os: string;
  fiveGBands: string;
  weightGrams: number;
  thicknessMm: number;
}

export interface StoreListing {
  storeName: 'Flipkart'; // Extensible for 'Amazon' in v2
  url: string;
  inStock: boolean;
  seller: string;
  bankOffers: string;
  exchangeBonus?: string;
  assuredBadge: boolean;
}

export interface Phone {
  id: string;
  name: string;
  brand: Brand;
  model: string;
  image: string;
  currentPrice: number;
  mrp: number;
  oneYearLow: number;
  oneYearHigh: number;
  oneYearAvg: number;
  isAtYearLow: boolean;
  percentBelowAvg: number;
  priceHistory: PricePoint[];
  forecastStatus: 'Likely Drop' | 'Stable' | 'At Floor' | 'Volatile';
  forecastNote: string;
  pincodeAvailability: PincodeAvailability;
  store: StoreListing;
  specs: PhoneSpecs;
  pros: string[];
  cons: string[];
}
