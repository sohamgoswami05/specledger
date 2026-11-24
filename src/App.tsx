import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_COMPARE_IDS } from './data/phones';
import type { Phone, Brand } from './types/phone';
import { usePhones } from './hooks/usePhones';
import { PincodeProvider, usePincode } from './context/PincodeContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import type { FilterState } from './components/FilterBar';
import { ComparisonView } from './components/ComparisonView';
import { CatalogView } from './components/CatalogView';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SinglePhoneModal } from './components/SinglePhoneModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { toast, filterWatchlistAgainstPhones } = usePincode();
  
  // Strict 3-element slot array: [Slot 1, Slot 2, Slot 3]
  const [comparedSlots, setComparedSlots] = useState<(string | null)[]>([
    DEFAULT_COMPARE_IDS[0] || null,
    DEFAULT_COMPARE_IDS[1] || null,
    DEFAULT_COMPARE_IDS[2] || null,
  ]);

  // Pass active compared IDs into usePhones to load 365-day history on demand
  const activeComparedIds = useMemo(
    () => comparedSlots.filter(Boolean) as string[],
    [comparedSlots]
  );
  const { phones, loadHistoryForIds } = usePhones(activeComparedIds);

  const [activeTab, setActiveTab] = useState<'compare' | 'browse'>('compare');
  const [selectedModalPhone, setSelectedModalPhone] = useState<Phone | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedBrand: 'All',
    maxPrice: 30000,
    onlyYearLow: false,
    onlyBelowAvg: false,
    onlyDeliverable: false,
    onlyBackInStock: false,
    sortBy: 'discount-desc',
  });

  // Sanitize slots whenever phones list is loaded / updated from Supabase
  useEffect(() => {
    if (!phones || phones.length === 0) return;

    // Filter ghost IDs out of localStorage watchlist
    filterWatchlistAgainstPhones(phones.map((p) => p.id));

    setComparedSlots((currentSlots) => {
      const sanitized: (string | null)[] = [null, null, null];
      const usedIds = new Set<string>();

      // 1. Verify existing slot selections
      for (let i = 0; i < 3; i++) {
        const id = currentSlots[i];
        if (id) {
          const matchedPhone = phones.find(
            (p) => p.id === id || p.id.startsWith(id) || id.startsWith(p.id)
          );
          if (matchedPhone && !usedIds.has(matchedPhone.id)) {
            sanitized[i] = matchedPhone.id;
            usedIds.add(matchedPhone.id);
          }
        }
      }

      // 2. If slots are empty on initial load, pre-populate with 3 distinct target phones
      const defaultCandidates = [
        phones.find((p) => p.id.includes('nord-ce4'))?.id,
        phones.find((p) => p.id.includes('a36'))?.id,
        phones.find((p) => p.id.includes('p4-power'))?.id,
        phones[0]?.id,
        phones[1]?.id,
        phones[2]?.id,
      ].filter(Boolean) as string[];

      for (let i = 0; i < 3; i++) {
        if (!sanitized[i]) {
          const fill = defaultCandidates.find((cid) => !usedIds.has(cid));
          if (fill) {
            sanitized[i] = fill;
            usedIds.add(fill);
          }
        }
      }

      return sanitized;
    });
  }, [phones, filterWatchlistAgainstPhones]);

  // When modal opens for a single phone, ensure its full 365-day history is loaded
  useEffect(() => {
    if (selectedModalPhone) {
      loadHistoryForIds([selectedModalPhone.id]);
    }
  }, [selectedModalPhone, loadHistoryForIds]);

  // Calculate brand counts
  const brandCounts = useMemo(() => {
    const counts: Record<Brand, number> = {
      Vivo: 0,
      OnePlus: 0,
      Realme: 0,
      Samsung: 0,
    };
    phones.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [phones]);

  // Sort helper function
  const sortPhones = (a: Phone, b: Phone) => {
    if (filters.sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
    if (filters.sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
    if (filters.sortBy === 'battery-desc') {
      return parseInt(b.specs.batteryCapacity) - parseInt(a.specs.batteryCapacity);
    }
    // discount-desc default
    const discountA = (a.mrp - a.currentPrice) / a.mrp;
    const discountB = (b.mrp - b.currentPrice) / b.mrp;
    return discountB - discountA;
  };

  // 1. Standard phones: strictly !p.isSpecialMention && p.currentPrice <= 30000, filtered by active filters
  const standardFilteredPhones = useMemo(() => {
    return phones
      .filter((p) => {
        // Exclude special mentions and phones over ₹30,000 from main grid
        if (p.isSpecialMention || p.currentPrice > 30000) {
          return false;
        }
        // Brand filter
        if (filters.selectedBrand !== 'All' && p.brand !== filters.selectedBrand) {
          return false;
        }
        // Price ceiling
        if (p.currentPrice > filters.maxPrice) {
          return false;
        }
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesChipset = p.specs.chipset.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          if (!matchesName && !matchesChipset && !matchesBrand) return false;
        }
        // At 1-Year Low
        if (filters.onlyYearLow && !p.isAtYearLow) {
          return false;
        }
        // Below Average
        if (filters.onlyBelowAvg && p.percentBelowAvg <= 0) {
          return false;
        }
        // Deliverable to 7xxxxx (in_stock or back_in_stock)
        if (filters.onlyDeliverable && p.pincodeAvailability.status === 'out_of_stock') {
          return false;
        }
        // Back in Stock Recently
        if (filters.onlyBackInStock && p.pincodeAvailability.status !== 'back_in_stock') {
          return false;
        }
        return true;
      })
      .sort(sortPhones);
  }, [phones, filters]);

  // 2. Special Mentions: phones where p.isSpecialMention || p.currentPrice > 30000
  const specialMentionPhones = useMemo(() => {
    return phones
      .filter((p) => {
        // Must be special mention or priced above ₹30k
        if (!p.isSpecialMention && p.currentPrice <= 30000) {
          return false;
        }
        // Brand filter
        if (filters.selectedBrand !== 'All' && p.brand !== filters.selectedBrand) {
          return false;
        }
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesChipset = p.specs.chipset.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          if (!matchesName && !matchesChipset && !matchesBrand) return false;
        }
        // Deliverable / Back in stock if active
        if (filters.onlyDeliverable && p.pincodeAvailability.status === 'out_of_stock') {
          return false;
        }
        if (filters.onlyBackInStock && p.pincodeAvailability.status !== 'back_in_stock') {
          return false;
        }
        return true;
      })
      .sort(sortPhones);
  }, [phones, filters]);

  // Handle toggling compare from catalog or autocomplete
  const handleToggleCompare = (id: string) => {
    setComparedSlots((prev) => {
      const isAlreadyIndex = prev.findIndex(
        (slotId) => slotId === id || (slotId && (slotId.startsWith(id) || id.startsWith(slotId)))
      );

      // If already in a slot, toggle off (clear that slot)
      if (isAlreadyIndex !== -1) {
        const next = [...prev];
        next[isAlreadyIndex] = null;
        return next;
      }

      // If not in a slot, find first empty slot
      const next = [...prev];
      const firstEmpty = next.findIndex((s) => !s);
      if (firstEmpty !== -1) {
        next[firstEmpty] = id;
      } else {
        // All 3 full: replace Slot 3 (index 2)
        next[2] = id;
      }
      return next;
    });
  };

  const activeSlotCount = comparedSlots.filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-text">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        comparedCount={activeSlotCount}
        totalCatalogCount={phones.length}
      />

      {/* Global Quick Filter Strip with Live Autocomplete */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalMatches={standardFilteredPhones.length + specialMentionPhones.length}
        brandCounts={brandCounts}
        allPhones={phones}
        comparedIds={activeComparedIds}
        onAddComparePhone={(id) => {
          handleToggleCompare(id);
          setActiveTab('compare');
        }}
        onInspectPhone={(phone) => setSelectedModalPhone(phone)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'compare' ? (
          <ComparisonView
            allPhones={phones}
            comparedSlots={comparedSlots}
            setComparedSlots={setComparedSlots}
            onBrowseAll={() => setActiveTab('browse')}
          />
        ) : (
          <CatalogView
            phones={standardFilteredPhones}
            specialMentions={specialMentionPhones}
            comparedIds={activeComparedIds}
            onToggleCompare={handleToggleCompare}
            onOpenSinglePhoneModal={setSelectedModalPhone}
          />
        )}
      </main>

      {/* Restock Watchlist Drawer */}
      <WatchlistDrawer allPhones={phones} />

      {/* Single Phone Inspection Modal */}
      {selectedModalPhone && (
        <SinglePhoneModal
          phone={selectedModalPhone}
          onClose={() => setSelectedModalPhone(null)}
          isComparing={activeComparedIds.includes(selectedModalPhone.id)}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-app-surface text-app-text border border-app-border px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-app-accent flex-shrink-0" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Global Application Footer */}
      <footer className="bg-app-surface border-t border-app-border py-6 mt-12 text-xs text-app-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-app-text">SpecLedger</span>
            <span>·</span>
            <span>Sub-₹30,000 Flipkart Price Ledger</span>
            <span>·</span>
            <span>West Bengal (7xxxxx) Restock Monitored</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Prices refreshed daily at 9:00 AM IST</span>
            <span>·</span>
            <span className="text-app-text font-medium">Single-store v1 (Flipkart API)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PincodeProvider>
      <AppContent />
    </PincodeProvider>
  );
};

export default App;
