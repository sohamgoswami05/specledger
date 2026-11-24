export interface RawPhoneItem {
  id: string;
  brand: 'Vivo' | 'OnePlus' | 'Realme' | 'Samsung';
  model_name: string;
  ram_storage_variant: string;
  release_date: string;
  launch_price_inr: number;
  current_price_inr: number;
  lowest_ever: number;
  highest_ever: number;
  is_newer_model?: boolean;
  flipkart_url: string;
  image_url: string;
  stock_status: 'in_stock' | 'back_in_stock' | 'out_of_stock';
  last_in_stock_date: string;
  delivery_text: string;
  forecast: { signal: 'buy' | 'wait'; confidence: number };
  specs: {
    releaseDate: string;
    chipset: string;
    cpuDetails: string;
    antutuScore: string;
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
    bankOffers: string;
    seller: string;
    pros: string[];
    cons: string[];
  };
}

export const RAW_CATALOG: RawPhoneItem[] = [
  // --- ONEPLUS ---
  {
    id: 'oneplus-nord-ce4-8-128',
    brand: 'OnePlus',
    model_name: 'OnePlus Nord CE4 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-04-01',
    launch_price_inr: 26999,
    current_price_inr: 24999,
    lowest_ever: 22999,
    highest_ever: 26999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=OnePlus+Nord+CE4+5G',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.72 },
    specs: {
      releaseDate: '01 Apr, 2024',
      chipset: 'Qualcomm Snapdragon 7 Gen 3',
      cpuDetails: 'Octa-core (1x2.63 GHz & 3x2.40 GHz & 4x1.80 GHz)',
      antutuScore: '815,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X (Up to 8GB Virtual RAM)',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB via Hybrid Slot',
      displaySize: '6.7 inches (17.02 cm)',
      displayType: 'Fluid AMOLED, 1.07B colors, HDR10+',
      resolution: '2412 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1100 nits',
      rearCamera: {
        primary: '50 MP Sony LYT-600 with OIS (f/1.8)',
        secondary: '8 MP Ultra-Wide (112° FoV)',
        features: '4K video at 30fps, Ultra Steady mode'
      },
      frontCamera: {
        resolution: '16 MP (f/2.4)',
        features: '1080p video at 30fps, Screen Flash'
      },
      batteryCapacity: '5500 mAh',
      chargingSpeed: '100W SuperVOOC (1-100% in 29 mins)',
      wirelessCharging: 'No',
      os: 'OxygenOS 14.0 based on Android 14 (2 OS upgrades promised)',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78 (9 bands)',
      weightGrams: 186,
      thicknessMm: 8.4,
      bankOffers: '₹1,500 Instant Discount on ICICI & HDFC Credit Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Class-leading 100W fast charging', 'Clean OxygenOS experience', 'Reliable Sony LYT-600 OIS primary shooter'],
      cons: ['No dedicated 3.5mm headphone jack', 'Plastic frame feel']
    }
  },
  {
    id: 'oneplus-nord-ce4-lite-8-128',
    brand: 'OnePlus',
    model_name: 'OnePlus Nord CE4 Lite 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-06-24',
    launch_price_inr: 20999,
    current_price_inr: 17999,
    lowest_ever: 16999,
    highest_ever: 20999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=OnePlus+Nord+CE4+Lite+5G',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.88 },
    specs: {
      releaseDate: '24 Jun, 2024',
      chipset: 'Qualcomm Snapdragon 695 5G',
      cpuDetails: 'Octa-core (2x2.2 GHz Kryo 660 Gold & 6x1.7 GHz)',
      antutuScore: '460,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 2 TB',
      displaySize: '6.67 inches (16.94 cm)',
      displayType: 'AMOLED 120Hz',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2100 nits peak',
      rearCamera: {
        primary: '50 MP Sony LYT-600 with OIS',
        secondary: '2 MP Depth Sensor',
        features: 'Dual stereo speakers, 1080p recording'
      },
      frontCamera: {
        resolution: '16 MP Wide',
        features: 'Face Unlock, Portrait retouching'
      },
      batteryCapacity: '5500 mAh',
      chargingSpeed: '80W SuperVOOC',
      wirelessCharging: 'No (5W Reverse Wired supported)',
      os: 'OxygenOS 14 based on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n41/n77/n78',
      weightGrams: 191,
      thicknessMm: 8.1,
      bankOffers: '₹1,000 Off on OneCard & Axis Bank Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Very bright 2100 nits AMOLED panel', '80W charging + 5500mAh endurance', 'Includes 3.5mm jack'],
      cons: ['Older Snapdragon 695 processor', 'Secondary camera is only a 2MP depth sensor']
    }
  },
  {
    id: 'oneplus-nord-3-5g-8-128',
    brand: 'OnePlus',
    model_name: 'OnePlus Nord 3 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2023-07-05',
    launch_price_inr: 33999,
    current_price_inr: 20999,
    lowest_ever: 19999,
    highest_ever: 33999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=OnePlus+Nord+3+5G',
    image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format&fit=crop&q=80',
    stock_status: 'out_of_stock',
    last_in_stock_date: '2026-11-12',
    delivery_text: 'Currently unavailable in 700034',
    forecast: { signal: 'buy', confidence: 0.94 },
    specs: {
      releaseDate: '05 Jul, 2023',
      chipset: 'MediaTek Dimensity 9000 (4nm)',
      cpuDetails: 'Octa-core 4nm flagship-tier architecture',
      antutuScore: '1,020,000',
      ram: '8 GB LPDDR5X',
      ramType: 'LPDDR5X ultra-fast',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'No',
      displaySize: '6.74 inches (17.12 cm)',
      displayType: 'Super Fluid AMOLED 1.5K',
      resolution: '2772 x 1240 px (1.5K)',
      refreshRate: '120 Hz Dynamic',
      peakBrightness: '1450 nits',
      rearCamera: {
        primary: '50 MP Sony IMX890 flagship sensor with OIS',
        secondary: '8 MP Ultra-Wide (112°)',
        tertiary: '2 MP Macro',
        features: '4K at 60fps recording, flagship noise reduction'
      },
      frontCamera: {
        resolution: '16 MP with EIS',
        features: 'Electronic Image Stabilization, Night Mode'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '80W SuperVOOC',
      wirelessCharging: 'No',
      os: 'OxygenOS 14 (Upgraded from Android 13)',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78',
      weightGrams: 193,
      thicknessMm: 8.15,
      bankOffers: 'No bank offers currently active (Out of stock)',
      seller: 'Flashtech Retail (Flipkart Assured)',
      pros: ['Flagship-grade Dimensity 9000 processor', 'Sony IMX890 flagship camera', 'Crisp 1.5K Super Fluid display'],
      cons: ['Runs moderately warm under sustained 3D gaming', 'Battery is 5000mAh vs newer 5500mAh units']
    }
  },
  {
    id: 'oneplus-nord-ce6-lite-8-128',
    brand: 'OnePlus',
    model_name: 'OnePlus Nord CE6 Lite 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2026-09-18',
    launch_price_inr: 31999,
    current_price_inr: 28970,
    lowest_ever: 27999,
    highest_ever: 31999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=OnePlus+Nord+CE6+Lite+5G',
    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 27 Nov, Fri',
    forecast: { signal: 'wait', confidence: 0.65 },
    specs: {
      releaseDate: '18 Sep, 2026',
      chipset: 'MediaTek Dimensity 7400',
      cpuDetails: 'Octa-core 4nm high-efficiency process (2.8 GHz)',
      antutuScore: '780,000',
      ram: '8 GB LPDDR5',
      ramType: 'LPDDR5',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.72 inches (17.07 cm)',
      displayType: 'Pro-grade IPS LCD 120Hz Sunlight Readable',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1200 nits HBM',
      rearCamera: {
        primary: '50 MP Sony OIS Primary Sensor',
        secondary: '2 MP Depth Sensor',
        features: '4K video, Pro Nightscape, AI Eraser 2.0'
      },
      frontCamera: {
        resolution: '16 MP Punch-hole',
        features: 'Portrait Pro with Bokeh Flare'
      },
      batteryCapacity: '7000 mAh',
      chargingSpeed: '67W SuperVOOC',
      wirelessCharging: 'No',
      os: 'OxygenOS 15 based on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28/n40/n41/n77/n78',
      weightGrams: 206,
      thicknessMm: 8.5,
      bankOffers: '₹1,250 Instant Discount on SBI Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Massive 7000mAh endurance battery', 'Dimensity 7400 4nm performance', 'Clean OxygenOS 15 pre-installed'],
      cons: ['LCD panel rather than AMOLED at ₹28k', 'No ultra-wide auxiliary lens']
    }
  },
  {
    id: 'oneplus-nord-ce5-8-128',
    brand: 'OnePlus',
    model_name: 'OnePlus Nord CE5 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2026-05-12',
    launch_price_inr: 24999,
    current_price_inr: 21449,
    lowest_ever: 21449,
    highest_ever: 24999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=OnePlus+Nord+CE5+5G',
    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=80',
    stock_status: 'back_in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.92 },
    specs: {
      releaseDate: '12 May, 2026',
      chipset: 'MediaTek Dimensity 8350 Apex',
      cpuDetails: 'Octa-core 3.35 GHz High-Frequency Architecture',
      antutuScore: '1,140,000',
      ram: '8 GB LPDDR5X',
      ramType: 'LPDDR5X',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'No',
      displaySize: '6.77 inches (17.2 cm)',
      displayType: '120Hz 1.5K AMOLED 10-bit',
      resolution: '2772 x 1240 px (1.5K)',
      refreshRate: '120 Hz',
      peakBrightness: '1800 nits',
      rearCamera: {
        primary: '50 MP Sony LYT-700 OIS (f/1.7)',
        secondary: '8 MP Ultra-Wide (116°)',
        features: 'RAW HDR engine, 4K 60fps'
      },
      frontCamera: {
        resolution: '16 MP Ultra Clear',
        features: '1080p EIS video'
      },
      batteryCapacity: '7100 mAh',
      chargingSpeed: '80W SuperVOOC (50% in 22 min)',
      wirelessCharging: 'No',
      os: 'OxygenOS 15 based on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28A/n41/n77/n78',
      weightGrams: 204,
      thicknessMm: 8.35,
      bankOffers: 'Flat ₹1,000 Flipkart Axis Bank Cashback',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Beastly 7100mAh battery in sub-8.4mm chassis', 'Top-tier Dimensity 8350 Apex chipset', 'At 1-Year Low ₹21,449'],
      cons: ['Slightly heavier in pocket at 204g', 'No micro-SD slot']
    }
  },

  // --- SAMSUNG ---
  {
    id: 'samsung-galaxy-m35-6-128',
    brand: 'Samsung',
    model_name: 'Samsung Galaxy M35 5G',
    ram_storage_variant: '6GB / 128GB',
    release_date: '2024-07-17',
    launch_price_inr: 24499,
    current_price_inr: 16999,
    lowest_ever: 14999,
    highest_ever: 24499,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Samsung+Galaxy+M35+5G',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.60 },
    specs: {
      releaseDate: '17 Jul, 2024',
      chipset: 'Samsung Exynos 1380 (5nm)',
      cpuDetails: 'Octa-core (4x2.4 GHz Cortex-A78 & 4x2.0 GHz Cortex-A55)',
      antutuScore: '595,000',
      ram: '6 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB via Hybrid Slot',
      displaySize: '6.6 inches (16.76 cm)',
      displayType: 'Super AMOLED, 120Hz, Gorilla Glass Victus+',
      resolution: '2340 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1000 nits (HBM)',
      rearCamera: {
        primary: '50 MP with OIS (f/1.8)',
        secondary: '8 MP Ultra-Wide (f/2.2)',
        tertiary: '2 MP Macro',
        features: '4K video recording, VDIS stabilization, Nightography'
      },
      frontCamera: {
        resolution: '13 MP (f/2.2)',
        features: '4K 30fps selfie recording, Auto HDR'
      },
      batteryCapacity: '6000 mAh',
      chargingSpeed: '25W Fast Charging (Charger sold separately)',
      wirelessCharging: 'No',
      os: 'One UI 6.1 on Android 14 (4 OS + 5 Years Security patches)',
      fiveGBands: 'n1/n3/n5/n7/n8/n20/n28/n38/n40/n41/n66/n77/n78 (13 bands)',
      weightGrams: 222,
      thicknessMm: 9.1,
      bankOffers: '₹1,000 Off on All Bank Debit & Credit Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Longest software support (4 OS + 5 yrs security)', 'Unmatched 6000mAh battery life', 'Gorilla Glass Victus+ display protection'],
      cons: ['Heavy at 222 grams', 'No wall charger in the box (25W only)']
    }
  },
  {
    id: 'samsung-galaxy-a36-8-256',
    brand: 'Samsung',
    model_name: 'Samsung Galaxy A36 5G',
    ram_storage_variant: '8GB / 256GB',
    release_date: '2026-03-15',
    launch_price_inr: 31999,
    current_price_inr: 27549,
    lowest_ever: 26999,
    highest_ever: 31999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=Samsung+Galaxy+A36+5G',
    image_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.78 },
    specs: {
      releaseDate: '15 Mar, 2026',
      chipset: 'Qualcomm Snapdragon 6 Gen 3 (4nm)',
      cpuDetails: 'Octa-core (4x2.4 GHz & 4x1.8 GHz)',
      antutuScore: '650,000',
      ram: '8 GB LPDDR5',
      ramType: 'LPDDR5',
      storage: '256 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.7 inches (17.02 cm)',
      displayType: 'Super AMOLED Infinity-O, 120Hz',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1300 nits (Vision Booster)',
      rearCamera: {
        primary: '50 MP OIS Primary (f/1.8)',
        secondary: '8 MP Ultra-Wide (123° FoV)',
        tertiary: '5 MP Macro',
        features: 'IP67 Water & Dust Resistance, 4K UHD video'
      },
      frontCamera: {
        resolution: '13 MP Wide',
        features: 'Custom AR stickers, 4K video'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '25W Fast Charging',
      wirelessCharging: 'No',
      os: 'One UI 7.0 on Android 15 (6 OS Updates)',
      fiveGBands: 'n1/n3/n5/n7/n8/n28/n40/n41/n77/n78 (Full Indian 5G support)',
      weightGrams: 195,
      thicknessMm: 7.9,
      bankOffers: '₹2,000 Instant Discount with HDFC Credit Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['IP67 dust and water rating', 'Industry best 6-year OS update guarantee', 'Premium slim 7.9mm form factor'],
      cons: ['25W charging speed lags behind 80W competitors', 'In-box adapter not included']
    }
  },
  {
    id: 'samsung-galaxy-a15-6-128',
    brand: 'Samsung',
    model_name: 'Samsung Galaxy A15 5G',
    ram_storage_variant: '6GB / 128GB',
    release_date: '2024-01-01',
    launch_price_inr: 19499,
    current_price_inr: 15499,
    lowest_ever: 14499,
    highest_ever: 19499,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Samsung+Galaxy+A15+5G',
    image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 27 Nov, Fri',
    forecast: { signal: 'wait', confidence: 0.70 },
    specs: {
      releaseDate: '01 Jan, 2024',
      chipset: 'MediaTek Dimensity 6100+',
      cpuDetails: 'Octa-core (2x2.2 GHz Cortex-A76 & 6x2.0 GHz Cortex-A55)',
      antutuScore: '410,000',
      ram: '6 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.5 inches (16.51 cm)',
      displayType: 'Super AMOLED, 90Hz',
      resolution: '2340 x 1080 px (FHD+)',
      refreshRate: '90 Hz',
      peakBrightness: '800 nits (HBM)',
      rearCamera: {
        primary: '50 MP (f/1.8, Auto Focus)',
        secondary: '5 MP Ultra-Wide',
        tertiary: '2 MP Macro',
        features: 'FHD video recording at 30fps'
      },
      frontCamera: {
        resolution: '13 MP (f/2.0)',
        features: 'Live Focus, HDR'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '25W Fast Charging',
      wirelessCharging: 'No',
      os: 'One UI 6.0 on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28/n40/n77/n78',
      weightGrams: 200,
      thicknessMm: 8.4,
      bankOffers: '₹750 Off with Flipkart UPI',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['True Super AMOLED panel under ₹16k', '4 years Android upgrades + Knox security', 'Solid build quality'],
      cons: ['90Hz refresh rate rather than 120Hz', 'Waterdrop notch styling']
    }
  },
  {
    id: 'samsung-galaxy-a25-8-128',
    brand: 'Samsung',
    model_name: 'Samsung Galaxy A25 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-01-01',
    launch_price_inr: 26999,
    current_price_inr: 21499,
    lowest_ever: 19999,
    highest_ever: 26999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Samsung+Galaxy+A25+5G',
    image_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&auto=format&fit=crop&q=80',
    stock_status: 'out_of_stock',
    last_in_stock_date: '2026-11-04',
    delivery_text: 'Currently unavailable in 700034',
    forecast: { signal: 'wait', confidence: 0.81 },
    specs: {
      releaseDate: '01 Jan, 2024',
      chipset: 'Samsung Exynos 1280 (5nm)',
      cpuDetails: 'Octa-core (2x2.4 GHz Cortex-A78 & 6x2.0 GHz Cortex-A55)',
      antutuScore: '480,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.5 inches (16.51 cm)',
      displayType: 'Super AMOLED, 120Hz',
      resolution: '2340 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1000 nits (HBM)',
      rearCamera: {
        primary: '50 MP with OIS (f/1.8)',
        secondary: '8 MP Ultra-Wide',
        tertiary: '2 MP Macro',
        features: '4K video recording, VDIS'
      },
      frontCamera: {
        resolution: '13 MP (f/2.2)',
        features: 'HDR, Portrait mode'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '25W Fast Charging',
      wirelessCharging: 'No',
      os: 'One UI 6.0 on Android 14',
      fiveGBands: 'n1/n3/n5/n7/n8/n26/n28/n40/n41/n66/n77/n78',
      weightGrams: 197,
      thicknessMm: 8.3,
      bankOffers: 'No active offers (Out of Stock)',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['120Hz Super AMOLED with OIS camera', 'Stereo speakers with Dolby Atmos', '4 Android OS upgrades'],
      cons: ['Exynos 1280 is somewhat dated for intense gaming', 'Bezels around screen are noticeable']
    }
  },
  {
    id: 'samsung-galaxy-f55-8-128',
    brand: 'Samsung',
    model_name: 'Samsung Galaxy F55 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-05-27',
    launch_price_inr: 29999,
    current_price_inr: 24999,
    lowest_ever: 22999,
    highest_ever: 29999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Samsung+Galaxy+F55+5G',
    image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbf?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.74 },
    specs: {
      releaseDate: '27 May, 2024',
      chipset: 'Qualcomm Snapdragon 7 Gen 1 (4nm)',
      cpuDetails: 'Octa-core (1x2.4 GHz Cortex-A710 & 3x2.36 GHz & 4x1.8 GHz)',
      antutuScore: '665,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.7 inches (17.02 cm)',
      displayType: 'Super AMOLED Plus, 120Hz',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1000 nits',
      rearCamera: {
        primary: '50 MP with OIS (f/1.8)',
        secondary: '8 MP Ultra-Wide (f/2.2)',
        tertiary: '2 MP Macro',
        features: '4K video, Nightography, Dual recording'
      },
      frontCamera: {
        resolution: '50 MP High-Res Selfie (f/2.4)',
        features: '4K 30fps front video, Portrait HDR'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '45W Fast Charging (Samsung first under ₹30k)',
      wirelessCharging: 'No',
      os: 'One UI 6.1 on Android 14 (4 OS Upgrades)',
      fiveGBands: 'n1/n3/n5/n7/n8/n28/n40/n41/n77/n78',
      weightGrams: 180,
      thicknessMm: 7.8,
      bankOffers: '₹1,500 Instant Discount on Flipkart Axis Card',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Distinguished stitched vegan leather back', '50MP front selfie camera with 4K', 'Slim 7.8mm profile and 45W charging support'],
      cons: ['Snapdragon 7 Gen 1 throttles slightly during prolonged stress tests', 'Charger not included in box']
    }
  },

  // --- REALME ---
  {
    id: 'realme-13-pro-8-128',
    brand: 'Realme',
    model_name: 'Realme 13 Pro 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-07-30',
    launch_price_inr: 29999,
    current_price_inr: 23999,
    lowest_ever: 22499,
    highest_ever: 29999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+13+Pro+5G',
    image_url: 'https://images.unsplash.com/photo-1533228896884-6725672990d0?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.75 },
    specs: {
      releaseDate: '30 Jul, 2024',
      chipset: 'Qualcomm Snapdragon 7s Gen 2 (4nm)',
      cpuDetails: 'Octa-core (4x2.40 GHz Cortex-A78 & 4x1.95 GHz Cortex-A55)',
      antutuScore: '675,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X + 8GB Dynamic RAM',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'No',
      displaySize: '6.7 inches (17.02 cm)',
      displayType: 'Curved AMOLED, 1.07B colors, Pro-XDR',
      resolution: '2412 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2000 nits',
      rearCamera: {
        primary: '50 MP Sony LYT-600 with OIS (f/1.88)',
        secondary: '8 MP Ultra-Wide (112°)',
        features: 'HYPERIMAGE+ AI Photography System, 4K video, AI Ultra Clarity'
      },
      frontCamera: {
        resolution: '32 MP Sony Sensor (f/2.45)',
        features: 'AI Beautification, 4K selfie support'
      },
      batteryCapacity: '5200 mAh',
      chargingSpeed: '45W SUPERVOOC (Charger included)',
      wirelessCharging: 'No',
      os: 'realme UI 5.0 on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78',
      weightGrams: 188,
      thicknessMm: 8.2,
      bankOffers: '₹1,500 Coupon applied on checkout',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Gorgeous curved 2000-nit AMOLED screen', 'Sony LYT-600 camera with AI portrait suite', 'Charger included in the box'],
      cons: ['Snapdragon 7s Gen 2 is average for hardcore competitive esports', 'Preloaded promotional notifications require cleanup']
    }
  },
  {
    id: 'realme-12-plus-8-128',
    brand: 'Realme',
    model_name: 'Realme 12+ 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-03-06',
    launch_price_inr: 23999,
    current_price_inr: 18999,
    lowest_ever: 17999,
    highest_ever: 23999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+12%2B+5G',
    image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&auto=format&fit=crop&q=80',
    stock_status: 'back_in_stock',
    last_in_stock_date: '2026-11-23',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.86 },
    specs: {
      releaseDate: '06 Mar, 2024',
      chipset: 'MediaTek Dimensity 7050 (6nm)',
      cpuDetails: 'Octa-core (2x2.6 GHz Cortex-A78 & 6x2.0 GHz Cortex-A55)',
      antutuScore: '580,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 2 TB',
      displaySize: '6.67 inches (16.94 cm)',
      displayType: 'Flat AMOLED, HDR10+, Rainwater Smart Touch',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2000 nits',
      rearCamera: {
        primary: '50 MP Sony LYT-600 OIS (f/1.88)',
        secondary: '8 MP Ultra-Wide (112°)',
        tertiary: '2 MP Macro',
        features: 'Cinematic Portrait Filters (by Claudio Miranda)'
      },
      frontCamera: {
        resolution: '16 MP',
        features: 'Night Scene, Portrait Retouching'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '67W SUPERVOOC (50% in 19 mins)',
      wirelessCharging: 'No',
      os: 'realme UI 5.0 on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78',
      weightGrams: 190,
      thicknessMm: 7.87,
      bankOffers: '₹1,000 Instant Discount on SBI Credit Card',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Luxury watch dial design with vegan leather', 'Rainwater Smart Touch functionality', 'Fast 67W charging with in-box brick'],
      cons: ['Dimensity 7050 is essentially a rebranded Dimensity 1080', 'Contains pre-installed apps']
    }
  },
  {
    id: 'realme-narzo-70-pro-8-128',
    brand: 'Realme',
    model_name: 'Realme Narzo 70 Pro 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-03-19',
    launch_price_inr: 24999,
    current_price_inr: 17499,
    lowest_ever: 15999,
    highest_ever: 24999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+Narzo+70+Pro+5G',
    image_url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=500&auto=format&fit=crop&q=80',
    stock_status: 'out_of_stock',
    last_in_stock_date: '2026-10-29',
    delivery_text: 'Currently unavailable in 700034',
    forecast: { signal: 'buy', confidence: 0.90 },
    specs: {
      releaseDate: '19 Mar, 2024',
      chipset: 'MediaTek Dimensity 7050 5G',
      cpuDetails: 'Octa-core up to 2.6 GHz',
      antutuScore: '575,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'No',
      displaySize: '6.67 inches (16.94 cm)',
      displayType: 'AMOLED 120Hz, Rainwater Smart Touch',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2000 nits',
      rearCamera: {
        primary: '50 MP Sony IMX890 Flagship sensor with OIS',
        secondary: '8 MP Ultra-Wide',
        tertiary: '2 MP Macro',
        features: 'Creative Air Gestures, 4K recording'
      },
      frontCamera: {
        resolution: '16 MP',
        features: 'Portrait Mode, HDR'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '67W SUPERVOOC',
      wirelessCharging: 'No',
      os: 'realme UI 5.0 (65% less pre-installed bloatware)',
      fiveGBands: 'n1/n3/n5/n8/n28A/n41/n77/n78',
      weightGrams: 195,
      thicknessMm: 7.97,
      bankOffers: 'No offers currently available',
      seller: 'FlashRetail (Flipkart Assured)',
      pros: ['Premium Horizon Glass design', 'Sony IMX890 flagship camera in sub-₹18k bracket', 'Air gesture hands-free controls'],
      cons: ['Out of stock in Eastern region fulfillment centers', 'No micro-SD slot']
    }
  },
  {
    id: 'realme-p1-pro-8-128',
    brand: 'Realme',
    model_name: 'Realme P1 Pro 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-04-15',
    launch_price_inr: 22999,
    current_price_inr: 18499,
    lowest_ever: 17499,
    highest_ever: 22999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+P1+Pro+5G',
    image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.76 },
    specs: {
      releaseDate: '15 Apr, 2024',
      chipset: 'Qualcomm Snapdragon 6 Gen 1 (4nm)',
      cpuDetails: 'Octa-core (4x2.2 GHz Cortex-A78 & 4x1.8 GHz Cortex-A55)',
      antutuScore: '575,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'No',
      displaySize: '6.7 inches (17.02 cm)',
      displayType: 'Curved AMOLED, 120Hz, 1.07B colors',
      resolution: '2412 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '950 nits',
      rearCamera: {
        primary: '50 MP Sony LYT-600 with OIS',
        secondary: '8 MP Ultra-Wide',
        features: '4K video, Light-grain texture back cover'
      },
      frontCamera: {
        resolution: '16 MP',
        features: 'HDR, Portrait retouching'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '45W SUPERVOOC',
      wirelessCharging: 'No',
      os: 'realme UI 5.0 based on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78',
      weightGrams: 184,
      thicknessMm: 8.35,
      bankOffers: '₹1,000 Off on HDFC Credit Card',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Curved AMOLED screen looks premium under ₹19k', 'Efficient Snapdragon 6 Gen 1 (4nm)', 'Tactile dual stereo speakers'],
      cons: ['Peak brightness tops at 950 nits in harsh daylight', 'Charging capped at 45W']
    }
  },
  {
    id: 'realme-p4-8-256',
    brand: 'Realme',
    model_name: 'Realme P4 5G',
    ram_storage_variant: '8GB / 256GB',
    release_date: '2026-08-10',
    launch_price_inr: 32999,
    current_price_inr: 28499,
    lowest_ever: 27999,
    highest_ever: 32999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+P4+5G',
    image_url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.68 },
    specs: {
      releaseDate: '10 Aug, 2026',
      chipset: 'MediaTek Dimensity 7400 (4nm)',
      cpuDetails: 'Octa-core 2.8 GHz Performance cluster',
      antutuScore: '790,000',
      ram: '8 GB LPDDR5',
      ramType: 'LPDDR5',
      storage: '256 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.77 inches (17.2 cm)',
      displayType: '120Hz AMOLED, 10-bit color, 2160Hz PWM dimming',
      resolution: '2412 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2400 nits peak',
      rearCamera: {
        primary: '50 MP Sony LYT-700 OIS (f/1.8)',
        secondary: '8 MP Ultra-Wide (116° FoV)',
        features: '4K 60fps recording, AI motion deblur'
      },
      frontCamera: {
        resolution: '16 MP Ultra Clear',
        features: 'Night Portrait, Screen Flash'
      },
      batteryCapacity: '7000 mAh',
      chargingSpeed: '80W SUPERVOOC',
      wirelessCharging: 'No',
      os: 'realme UI 6.0 on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78 (Full support)',
      weightGrams: 202,
      thicknessMm: 8.2,
      bankOffers: '₹1,500 Instant Discount on ICICI Bank Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Huge 7000mAh battery capacity', 'Generous 256GB base storage', 'Ultra bright 2400-nit panel with high PWM dimming'],
      cons: ['Slightly hefty in hand at 202g', 'No telephoto zoom camera']
    }
  },
  {
    id: 'realme-p4-power-8-128',
    brand: 'Realme',
    model_name: 'Realme P4 Power 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2026-10-02',
    launch_price_inr: 30999,
    current_price_inr: 26700,
    lowest_ever: 26700,
    highest_ever: 30999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=Realme+P4+Power+5G',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.95 },
    specs: {
      releaseDate: '02 Oct, 2026',
      chipset: 'MediaTek Dimensity 7400 Ultra',
      cpuDetails: 'Octa-core 4nm high-frequency tuned for multi-day endurance',
      antutuScore: '835,000',
      ram: '8 GB LPDDR5',
      ramType: 'LPDDR5',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.8 inches (17.27 cm)',
      displayType: '1.5K 144Hz AMOLED, HDR10+, Dolby Vision',
      resolution: '2772 x 1240 px (1.5K)',
      refreshRate: '144 Hz',
      peakBrightness: '2600 nits peak',
      rearCamera: {
        primary: '50 MP Sony OIS Primary Sensor',
        secondary: '8 MP Ultra-Wide (116°)',
        features: '4K video, AI Night scene, Extreme slow-motion'
      },
      frontCamera: {
        resolution: '32 MP Ultra-Wide Selfie',
        features: '4K selfie video, AI studio lighting'
      },
      batteryCapacity: '10001 mAh',
      chargingSpeed: '100W SUPERVOOC (Full charge in ~48 mins)',
      wirelessCharging: 'No (Supports 18W Reverse Wired Powerbank mode)',
      os: 'realme UI 6.0 on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n41/n77/n78',
      weightGrams: 238,
      thicknessMm: 9.3,
      bankOffers: 'Flat ₹1,250 Off with Axis Bank Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Record-breaking 10,001 mAh battery with 3-4 day real-world battery life', '100W charging + acts as an 18W power bank', 'Crisp 1.5K 144Hz AMOLED screen'],
      cons: ['Heavy weight at 238 grams', 'Thick 9.3mm chassis']
    }
  },

  // --- VIVO ---
  {
    id: 'vivo-t3-pro-8-128',
    brand: 'Vivo',
    model_name: 'Vivo T3 Pro 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-08-27',
    launch_price_inr: 29999,
    current_price_inr: 24999,
    lowest_ever: 23499,
    highest_ever: 29999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Vivo+T3+Pro+5G',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.74 },
    specs: {
      releaseDate: '27 Aug, 2024',
      chipset: 'Qualcomm Snapdragon 7 Gen 3 (4nm)',
      cpuDetails: 'Octa-core (1x2.63 GHz & 3x2.40 GHz & 4x1.80 GHz)',
      antutuScore: '820,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X + 8GB Extended RAM',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'No',
      displaySize: '6.77 inches (17.2 cm)',
      displayType: '3D Curved AMOLED, 1.07B colors, HDR10+',
      resolution: '2392 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '4500 nits local peak',
      rearCamera: {
        primary: '50 MP Sony IMX882 with OIS (f/1.79)',
        secondary: '8 MP Ultra-Wide (120°)',
        features: 'Aura Light portrait, 4K video recording, AI Erase'
      },
      frontCamera: {
        resolution: '16 MP (f/2.45)',
        features: 'Aura Screen Light, Night mode'
      },
      batteryCapacity: '5500 mAh',
      chargingSpeed: '80W FlashCharge (Included)',
      wirelessCharging: 'No',
      os: 'Funtouch OS 14 on Android 14 (2 OS upgrades)',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n77/n78',
      weightGrams: 190,
      thicknessMm: 7.99,
      bankOffers: '₹1,500 Instant Discount on HDFC & ICICI Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Astonishing 4500 nits local peak brightness', 'Flagship-grade 3D curved ergonomics', 'Fast 80W charging with 5500mAh battery'],
      cons: ['UFS 2.2 storage rather than UFS 3.1', 'No 3.5mm audio jack']
    }
  },
  {
    id: 'vivo-t3-5g-8-128',
    brand: 'Vivo',
    model_name: 'Vivo T3 5G',
    ram_storage_variant: '8GB / 128GB',
    release_date: '2024-03-21',
    launch_price_inr: 22999,
    current_price_inr: 18499,
    lowest_ever: 17499,
    highest_ever: 22999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Vivo+T3+5G',
    image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.89 },
    specs: {
      releaseDate: '21 Mar, 2024',
      chipset: 'MediaTek Dimensity 7200 (4nm)',
      cpuDetails: 'Octa-core (2x2.8 GHz Cortex-A715 & 6x Cortex-A510)',
      antutuScore: '730,000',
      ram: '8 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.67 inches (16.94 cm)',
      displayType: 'AMOLED, 120Hz, HDR10+',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1800 nits',
      rearCamera: {
        primary: '50 MP Sony IMX882 with OIS (f/1.79)',
        secondary: '2 MP Bokeh sensor',
        tertiary: 'Flicker sensor',
        features: '4K video, Super Night mode, Dual-view video'
      },
      frontCamera: {
        resolution: '16 MP (f/2.0)',
        features: 'Portrait mode, Night selfie'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '44W FlashCharge',
      wirelessCharging: 'No',
      os: 'Funtouch OS 14 on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n77/n78',
      weightGrams: 188,
      thicknessMm: 7.83,
      bankOffers: '₹1,000 Off on SBI and Axis Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Very fast Dimensity 7200 at under ₹19k', 'Sharp Sony IMX882 OIS camera', 'Slim 7.83mm design with dual stereo speakers'],
      cons: ['Lacks an ultra-wide secondary camera', 'Charging is 44W compared to 67W/80W peers']
    }
  },
  {
    id: 'vivo-y200e-6-128',
    brand: 'Vivo',
    model_name: 'Vivo Y200e 5G',
    ram_storage_variant: '6GB / 128GB',
    release_date: '2024-02-22',
    launch_price_inr: 23999,
    current_price_inr: 17999,
    lowest_ever: 17999,
    highest_ever: 23999,
    is_newer_model: false,
    flipkart_url: 'https://www.flipkart.com/search?q=Vivo+Y200e+5G',
    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80',
    stock_status: 'back_in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.92 },
    specs: {
      releaseDate: '22 Feb, 2024',
      chipset: 'Qualcomm Snapdragon 4 Gen 2 (4nm)',
      cpuDetails: 'Octa-core (2x2.2 GHz Cortex-A78 & 6x2.0 GHz Cortex-A55)',
      antutuScore: '430,000',
      ram: '6 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.67 inches (16.94 cm)',
      displayType: 'Samsung E4 AMOLED, 120Hz',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1200 nits',
      rearCamera: {
        primary: '50 MP (f/1.8)',
        secondary: '2 MP Bokeh camera',
        tertiary: 'Flicker sensor',
        features: 'Dual Stereo Speakers with 300% Audio Booster'
      },
      frontCamera: {
        resolution: '16 MP',
        features: 'Portrait Night, Face Beauty'
      },
      batteryCapacity: '5000 mAh',
      chargingSpeed: '44W FlashCharge',
      wirelessCharging: 'No',
      os: 'Funtouch OS 14 on Android 14',
      fiveGBands: 'n1/n3/n5/n8/n28A/n77/n78',
      weightGrams: 185,
      thicknessMm: 7.79,
      bankOffers: '₹1,000 Instant Discount with Flipkart Axis Bank',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Stunning Eco-Fiber leather finish in Saffron Delight', '300% Audio Booster dual stereo speakers', 'Back in stock at ₹17,999 1-Year Low'],
      cons: ['Snapdragon 4 Gen 2 is suited for daily tasks, not heavy gaming', 'No camera OIS']
    }
  },
  {
    id: 'vivo-t5x-6-128',
    brand: 'Vivo',
    model_name: 'Vivo T5x 5G',
    ram_storage_variant: '6GB / 128GB',
    release_date: '2026-10-14',
    launch_price_inr: 27999,
    current_price_inr: 23749,
    lowest_ever: 23749,
    highest_ever: 27999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=Vivo+T5x+5G',
    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'buy', confidence: 0.91 },
    specs: {
      releaseDate: '14 Oct, 2026',
      chipset: 'MediaTek Dimensity 7400-Turbo (4nm)',
      cpuDetails: 'Octa-core 2.9 GHz Turbo overclocked gaming core',
      antutuScore: '810,000',
      ram: '6 GB LPDDR5',
      ramType: 'LPDDR5',
      storage: '128 GB',
      storageType: 'UFS 3.1',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.74 inches (17.12 cm)',
      displayType: '120Hz Ultra Vision AMOLED, HDR10+',
      resolution: '2400 x 1080 px (FHD+)',
      refreshRate: '120 Hz',
      peakBrightness: '2000 nits HBM',
      rearCamera: {
        primary: '50 MP Sony OIS Primary (f/1.79)',
        secondary: '2 MP Depth',
        features: '4K video, Aura Light 3.0, Night portraits'
      },
      frontCamera: {
        resolution: '32 MP High-Resolution Front Camera',
        features: 'AI Studio Lighting, 4K Selfie video'
      },
      batteryCapacity: '7200 mAh',
      chargingSpeed: '67W FlashCharge',
      wirelessCharging: 'No',
      os: 'Funtouch OS 15 on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28A/n40/n77/n78',
      weightGrams: 201,
      thicknessMm: 8.2,
      bankOffers: '₹1,500 Instant Discount on SBI Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Massive 7200mAh battery cell', 'Upgraded 32MP front selfie camera', 'Dimensity 7400-Turbo gaming stability'],
      cons: ['Base variant is 6GB RAM rather than 8GB', 'No ultra-wide rear camera']
    }
  },
  {
    id: 'vivo-t5-lite-6-128',
    brand: 'Vivo',
    model_name: 'Vivo T5 Lite 5G',
    ram_storage_variant: '6GB / 128GB',
    release_date: '2026-08-08',
    launch_price_inr: 23999,
    current_price_inr: 20499,
    lowest_ever: 19999,
    highest_ever: 23999,
    is_newer_model: true,
    flipkart_url: 'https://www.flipkart.com/search?q=Vivo+T5+Lite+5G',
    image_url: 'https://images.unsplash.com/photo-1569183091671-696402586b9c?w=500&auto=format&fit=crop&q=80',
    stock_status: 'in_stock',
    last_in_stock_date: '2026-11-24',
    delivery_text: 'Delivery by 26 Nov, Thu',
    forecast: { signal: 'wait', confidence: 0.71 },
    specs: {
      releaseDate: '08 Aug, 2026',
      chipset: 'MediaTek Dimensity 6300 (6nm)',
      cpuDetails: 'Octa-core (2x2.4 GHz Cortex-A76 & 6x2.0 GHz Cortex-A55)',
      antutuScore: '440,000',
      ram: '6 GB LPDDR4X',
      ramType: 'LPDDR4X',
      storage: '128 GB',
      storageType: 'UFS 2.2',
      expandableStorage: 'Yes, up to 1 TB',
      displaySize: '6.68 inches (16.97 cm)',
      displayType: '120Hz Ultra Bright Display',
      resolution: '1612 x 720 px (HD+)',
      refreshRate: '120 Hz',
      peakBrightness: '1000 nits HBM',
      rearCamera: {
        primary: '50 MP AI Camera (f/1.8)',
        secondary: '2 MP Bokeh',
        features: 'Night Mode, Portrait Retouching'
      },
      frontCamera: {
        resolution: '8 MP Selfie Camera',
        features: 'Face Unlock, Portrait'
      },
      batteryCapacity: '6500 mAh',
      chargingSpeed: '44W FlashCharge',
      wirelessCharging: 'No',
      os: 'Funtouch OS 15 on Android 15',
      fiveGBands: 'n1/n3/n5/n8/n28A/n77/n78',
      weightGrams: 196,
      thicknessMm: 8.19,
      bankOffers: '₹1,000 Off with HDFC Bank Cards',
      seller: 'OmniTechRetail (Flipkart Assured)',
      pros: ['Long-lasting 6500mAh battery', 'Smooth 120Hz refresh rate', 'Durable IP64 splash resistance'],
      cons: ['HD+ resolution rather than FHD+', '8MP front camera is modest']
    }
  }
];

export interface StepPoint {
  phone_id: string;
  store: string;
  price_inr: number;
  in_stock: boolean;
  recorded_at: string;
  event?: string;
}

export function generateRealisticStepCurve(
  phoneId: string,
  currentPrice: number,
  _mrp: number,
  lowestPrice: number,
  highestPrice: number,
  isNewerModel = false
): StepPoint[] {
  const records: StepPoint[] = [];
  const baseDate = new Date('2026-11-24T00:00:00Z');

  const plateauSteps = [
    { startDay: 364, endDay: 310, factor: 1.0 },
    { startDay: 309, endDay: 260, factor: 0.96 },
    { startDay: 259, endDay: 200, factor: 0.94 },
    { startDay: 199, endDay: 140, factor: 0.90 },
    { startDay: 139, endDay: 80, factor: 0.88 },
    { startDay: 79, endDay: 30, factor: 0.85 },
    { startDay: 29, endDay: 0, factor: 0.84 },
  ];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getUTCMonth();
    const day = d.getUTCDate();

    let plateauFactor = 0.88;
    for (const step of plateauSteps) {
      if (i <= step.startDay && i >= step.endDay) {
        plateauFactor = step.factor;
        break;
      }
    }

    let regularBaseline: number;
    if (isNewerModel && i > 120) {
      regularBaseline = highestPrice;
    } else {
      regularBaseline =
        Math.round(
          (lowestPrice + (highestPrice - lowestPrice) * plateauFactor) / 100
        ) * 100;
    }

    let dailyPrice = regularBaseline;
    let event: string | undefined = undefined;

    // Flipkart Big Billion Days (Oct 6 to Oct 14)
    if (month === 9 && day >= 6 && day <= 14) {
      dailyPrice = lowestPrice;
      event = 'Flipkart Big Billion Days';
    }
    // Republic Day Sale (Jan 14 to Jan 20)
    else if (month === 0 && day >= 14 && day <= 20) {
      dailyPrice =
        Math.round((lowestPrice + (highestPrice - lowestPrice) * 0.15) / 100) * 100;
      event = 'Republic Day Sale';
    }
    // Independence Day Sale (Aug 5 to Aug 11)
    else if (month === 7 && day >= 5 && day <= 11) {
      dailyPrice =
        Math.round((lowestPrice + (highestPrice - lowestPrice) * 0.20) / 100) * 100;
      event = 'Independence Day Sale';
    }
    // Flipkart Big Bachat Days
    else if (day >= 1 && day <= 3 && (month === 3 || month === 6 || month === 10)) {
      dailyPrice = Math.max(lowestPrice, regularBaseline - 1000);
      event = 'Big Bachat Days';
    }

    if (i === 0) {
      dailyPrice = currentPrice;
      if (currentPrice <= lowestPrice) {
        event = 'Current Price (1-Year Low)';
      }
    }

    dailyPrice = Math.max(lowestPrice, Math.min(highestPrice, dailyPrice));

    records.push({
      phone_id: phoneId,
      store: 'flipkart',
      price_inr: dailyPrice,
      in_stock: true,
      recorded_at: dateStr,
      event,
    });
  }

  return records;
}
