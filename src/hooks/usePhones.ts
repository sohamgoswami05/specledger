import { useState, useEffect, useCallback, useRef } from 'react';
import type { Phone, PricePoint } from '../types/phone';
import { phones as fallbackPhones } from '../data/phones';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UsePhonesResult {
  phones: Phone[];
  loading: boolean;
  isLiveSupabase: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadHistoryForIds: (ids: string[]) => Promise<void>;
}

export function usePhones(activeComparedIds: string[] = []): UsePhonesResult {
  const [phonesList, setPhonesList] = useState<Phone[]>(fallbackPhones);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // Function to load 365-day history on-demand for specific phone IDs
  const loadHistoryForIds = useCallback(async (ids: string[]) => {
    if (!isSupabaseConfigured || !supabase || ids.length === 0) return;

    // Filter out already fetched IDs
    const toFetch = ids.filter((id) => !fetchedIdsRef.current.has(id));
    if (toFetch.length === 0) return;

    try {
      // Query specifically for these IDs with a safe range limit (e.g. 3 * 365 = 1095)
      const { data: rows, error: histError } = await supabase
        .from('price_history')
        .select('phone_id, price_inr, in_stock, recorded_at')
        .in('phone_id', toFetch)
        .order('recorded_at', { ascending: true })
        .range(0, 1999);

      if (histError) throw histError;

      if (rows && rows.length > 0) {
        toFetch.forEach((id) => fetchedIdsRef.current.add(id));

        const historyByPhone: Record<string, PricePoint[]> = {};
        const getSaleEvent = (dateStr: string) => {
          const m = dateStr.slice(5, 7);
          const d = parseInt(dateStr.slice(8, 10), 10);
          if (m === '01' && d >= 19 && d <= 26) return 'Republic Day Sale';
          if (m === '05' && d >= 2 && d <= 8) return 'Big Saving Days';
          if ((m === '09' && d >= 23) || (m === '10' && d <= 8)) return 'Big Billion Days';
          if (m === '11' && d >= 1 && d <= 6) return 'Diwali Festive Sale';
          return undefined;
        };

        rows.forEach((r) => {
          if (!historyByPhone[r.phone_id]) {
            historyByPhone[r.phone_id] = [];
          }
          historyByPhone[r.phone_id].push({
            date: r.recorded_at,
            price: r.price_inr,
            event: getSaleEvent(r.recorded_at),
          });
        });

        setPhonesList((prevList) =>
          prevList.map((phone) => {
            const dbHistory = historyByPhone[phone.id];
            if (dbHistory && dbHistory.length > 0) {
              return {
                ...phone,
                priceHistory: dbHistory,
              };
            }
            return phone;
          })
        );
      }
    } catch (err: any) {
      console.warn('Failed to load on-demand price history:', err.message || err);
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setPhonesList(fallbackPhones);
      setIsLiveSupabase(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch catalog summary view (capped to 25 items max)
      const { data: summaryRows, error: summaryError } = await supabase
        .from('phone_catalog_summary')
        .select('*');

      if (summaryError) {
        throw summaryError;
      }

      if (!summaryRows || summaryRows.length === 0) {
        setPhonesList(fallbackPhones);
        setIsLiveSupabase(false);
        setLoading(false);
        return;
      }

      const fallbackMap = new Map(fallbackPhones.map((p) => [p.id, p]));
      const findFallback = (id: string) => {
        return (
          fallbackMap.get(id) ||
          fallbackPhones.find((p) => id.startsWith(p.id) || p.id.startsWith(id))
        );
      };

      // 2. Map DB rows to Phone interface
      const mappedPhones: Phone[] = summaryRows.map((row) => {
        const fallback = findFallback(row.id);
        const rawSpecs = row.specs && Object.keys(row.specs).length > 0 ? row.specs : fallback?.specs;

        return {
          id: row.id,
          name: row.model_name,
          brand: row.brand,
          model: `${row.model_name} (${row.ram_storage_variant})`,
          image: row.image_url || fallback?.image || '',
          currentPrice: row.current_price_inr,
          mrp: row.launch_price_inr,
          oneYearLow: row.min_1y_price ?? fallback?.oneYearLow ?? row.current_price_inr,
          oneYearHigh: row.max_1y_price ?? fallback?.oneYearHigh ?? row.launch_price_inr,
          oneYearAvg: row.avg_1y_price ?? fallback?.oneYearAvg ?? row.current_price_inr,
          isAtYearLow: Boolean(row.is_at_year_low),
          percentBelowAvg: Number(row.percent_below_avg || 0),
          // Default to fallback's complete 365-day step curve until on-demand query resolves
          priceHistory: fallback?.priceHistory || [],
          forecastStatus: row.forecast?.signal === 'buy' ? 'At Floor' : fallback?.forecastStatus || 'Stable',
          forecastNote: fallback?.forecastNote || 'Stock and price actively tracked on Flipkart.',
          pincodeAvailability: {
            regionPrefix: row.delivery_zone_prefix || '7',
            status: row.stock_status_wb || 'in_stock',
            lastCheckedAt: row.last_checked_at
              ? new Date(row.last_checked_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
              : 'Today 9:00 AM IST',
            lastInStockDate: row.last_in_stock_date || '2026-11-24',
            estimatedDeliveryDays: 2,
          },
          store: {
            storeName: 'Flipkart',
            url: row.flipkart_url || fallback?.store.url || `https://www.flipkart.com/search?q=${encodeURIComponent(row.model_name)}`,
            inStock: row.stock_status_wb !== 'out_of_stock',
            seller: rawSpecs?.seller || fallback?.store.seller || 'OmniTechRetail (Flipkart Assured)',
            bankOffers: rawSpecs?.bankOffers || fallback?.store.bankOffers || '₹1,500 Instant Discount with Bank Cards',
            exchangeBonus: row.current_price_inr > 20000 ? 'Up to ₹18,000 off on exchange' : 'Up to ₹12,000 off on exchange',
            assuredBadge: true,
          },
          specs: {
            releaseDate: rawSpecs?.releaseDate || row.release_date || fallback?.specs.releaseDate || '2024',
            chipset: rawSpecs?.chipset || fallback?.specs.chipset || 'N/A',
            cpuDetails: rawSpecs?.cpuDetails || fallback?.specs.cpuDetails || 'Octa-core processor',
            antutuScore: rawSpecs?.antutuScore || fallback?.specs.antutuScore || 'N/A',
            ram: rawSpecs?.ram || fallback?.specs.ram || '8 GB',
            ramType: rawSpecs?.ramType || fallback?.specs.ramType || 'LPDDR4X',
            storage: rawSpecs?.storage || fallback?.specs.storage || '128 GB',
            storageType: rawSpecs?.storageType || fallback?.specs.storageType || 'UFS 2.2',
            expandableStorage: rawSpecs?.expandableStorage || fallback?.specs.expandableStorage || 'Yes, up to 1 TB',
            displaySize: rawSpecs?.displaySize || fallback?.specs.displaySize || '6.7 inches',
            displayType: rawSpecs?.displayType || fallback?.specs.displayType || 'AMOLED Display',
            resolution: rawSpecs?.resolution || fallback?.specs.resolution || '2400 x 1080 px (FHD+)',
            refreshRate: rawSpecs?.refreshRate || fallback?.specs.refreshRate || '120 Hz',
            peakBrightness: rawSpecs?.peakBrightness || fallback?.specs.peakBrightness || '1000 nits',
            rearCamera: rawSpecs?.rearCamera || fallback?.specs.rearCamera || {
              primary: '50 MP with OIS',
              secondary: '8 MP Ultra-Wide',
              features: '4K video recording, Night mode',
            },
            frontCamera: rawSpecs?.frontCamera || fallback?.specs.frontCamera || {
              resolution: '16 MP',
              features: 'Portrait mode, Screen Flash',
            },
            batteryCapacity: rawSpecs?.batteryCapacity || fallback?.specs.batteryCapacity || '5000 mAh',
            chargingSpeed: rawSpecs?.chargingSpeed || fallback?.specs.chargingSpeed || '45W Fast Charging',
            wirelessCharging: rawSpecs?.wirelessCharging || fallback?.specs.wirelessCharging || 'No',
            os: rawSpecs?.os || fallback?.specs.os || 'Android 14',
            fiveGBands: rawSpecs?.fiveGBands || fallback?.specs.fiveGBands || 'n1/n3/n5/n8/n28A/n41/n77/n78',
            weightGrams: rawSpecs?.weightGrams || fallback?.specs.weightGrams || 190,
            thicknessMm: rawSpecs?.thicknessMm || fallback?.specs.thicknessMm || 8.0,
          },
          pros: rawSpecs?.pros || fallback?.pros || ['High performance value', 'Vibrant AMOLED panel'],
          cons: rawSpecs?.cons || fallback?.cons || ['Flash sale availability'],
        };
      });

      setPhonesList(mappedPhones);
      setIsLiveSupabase(true);
    } catch (err: any) {
      console.warn('Supabase fetch failed, falling back to mock dataset:', err.message || err);
      setError(err.message || 'Failed to connect to Supabase');
      setPhonesList(fallbackPhones);
      setIsLiveSupabase(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Load history on-demand for active compared IDs whenever they change
  useEffect(() => {
    if (activeComparedIds && activeComparedIds.length > 0) {
      loadHistoryForIds(activeComparedIds);
    }
  }, [activeComparedIds, loadHistoryForIds]);

  return {
    phones: phonesList,
    loading,
    isLiveSupabase,
    error,
    refresh: fetchCatalog,
    loadHistoryForIds,
  };
}
