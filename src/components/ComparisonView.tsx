import React, { useState, useMemo } from 'react';
import type { Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { usePincode } from '../context/PincodeContext';
import { PriceHistoryChart } from './PriceHistoryChart';
import {
  ExternalLink,
  Plus,
  X,
  Bell,
  AlertTriangle,
  Cpu,
  Layers,
  Battery,
  Camera,
  HardDrive,
  Calendar,
} from 'lucide-react';

interface ComparisonViewProps {
  allPhones: Phone[];
  comparedSlots: (string | null)[]; // Strict 3-element array: [Slot 1, Slot 2, Slot 3]
  setComparedSlots: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  onBrowseAll?: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  allPhones,
  comparedSlots,
  setComparedSlots,
  onBrowseAll,
}) => {
  const { pincode, toggleWatchlist, isWatched } = usePincode();
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [activeSlotSearch, setActiveSlotSearch] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState('');

  // Resolve phones strictly for slots 0, 1, 2
  const slotPhones: (Phone | null)[] = [0, 1, 2].map((idx) => {
    const id = comparedSlots[idx];
    if (!id) return null;
    return allPhones.find((p) => p.id === id || p.id.startsWith(id) || id.startsWith(p.id)) || null;
  });

  // Active non-null phones for charts and difference highlights
  const activePhones = slotPhones.filter(Boolean) as Phone[];

  // Quick add suggestions (phones not in ANY of the 3 slots)
  const currentSlotIds = new Set(
    comparedSlots.filter(Boolean).map((id) => id as string)
  );
  const suggestedPhones = allPhones
    .filter((p) => !currentSlotIds.has(p.id) && !slotPhones.some((sp) => sp?.id === p.id))
    .slice(0, 5);

  const handleClearSlot = (slotIdx: number) => {
    setComparedSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    if (activeSlotSearch === slotIdx) {
      setActiveSlotSearch(null);
    }
  };

  const handleSetSlotPhone = (slotIdx: number, newPhoneId: string) => {
    setComparedSlots((prev) => {
      const next = [...prev];
      // Prevent duplicate: remove this phone from other slot if it was there
      for (let i = 0; i < 3; i++) {
        if (i !== slotIdx && next[i] === newPhoneId) {
          next[i] = null;
        }
      }
      next[slotIdx] = newPhoneId;
      return next;
    });
    setActiveSlotSearch(null);
    setSlotSearchQuery('');
  };

  // Helper to determine if values differ across active compared devices
  const areValuesDifferent = (extractor: (p: Phone) => string | number | undefined) => {
    if (activePhones.length < 2) return false;
    const first = extractor(activePhones[0]);
    return activePhones.some((p) => extractor(p) !== first);
  };

  // Best-in-row calculations among active compared phones
  const maxAntutu = useMemo(() => {
    let max = 0;
    activePhones.forEach((p) => {
      const v = parseInt((p.specs.antutuScore || '0').replace(/\D/g, ''));
      if (v > max) max = v;
    });
    return max > 0 ? max : null;
  }, [activePhones]);

  const maxBattery = useMemo(() => {
    let max = 0;
    activePhones.forEach((p) => {
      const v = parseInt((p.specs.batteryCapacity || '0').replace(/\D/g, ''));
      if (v > max) max = v;
    });
    return max > 0 ? max : null;
  }, [activePhones]);

  const maxCharging = useMemo(() => {
    let max = 0;
    activePhones.forEach((p) => {
      const v = parseInt((p.specs.chargingSpeed || '0').replace(/\D/g, ''));
      if (v > max) max = v;
    });
    return max > 0 ? max : null;
  }, [activePhones]);

  const lowestPrice = useMemo(() => {
    if (activePhones.length <= 1) return null;
    let min = Infinity;
    activePhones.forEach((p) => {
      if (p.currentPrice < min) min = p.currentPrice;
    });
    return min < Infinity ? min : null;
  }, [activePhones]);

  return (
    <div className="space-y-6">
      {/* 3-Slot Phone Selector Bar */}
      <div className="bg-app-surface border border-app-border rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-app-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-app-text tracking-tight uppercase">
                Side-by-Side Comparison Slots (Strict 3 Slots)
              </h2>
              <span className="text-[11px] font-semibold text-app-accent bg-teal-50 border border-teal-200 px-2 py-0.2 rounded tabular-nums">
                {activePhones.length}/3 Selected
              </span>
            </div>
            <p className="text-xs text-app-muted mt-0.5">
              Slot 1, Slot 2, and Slot 3 map directly to comparison columns below. No duplicates permitted.
            </p>
          </div>

          {/* Quick Add Suggestions */}
          {activePhones.length < 3 && suggestedPhones.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-app-muted font-medium">Quick fill:</span>
              {suggestedPhones.slice(0, 3).map((phone) => (
                <button
                  key={phone.id}
                  onClick={() => {
                    // Find first empty slot
                    const firstEmpty = comparedSlots.findIndex((s) => !s);
                    const targetIdx = firstEmpty !== -1 ? firstEmpty : 0;
                    handleSetSlotPhone(targetIdx, phone.id);
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-app-bg border border-app-border text-app-text hover:border-app-accent hover:text-app-accent flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{phone.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Interactive Slots (Slot 1, Slot 2, Slot 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const phone = slotPhones[slotIdx];
            const isSearchOpen = activeSlotSearch === slotIdx;

            if (phone) {
              return (
                <div
                  key={`slot-${slotIdx}-${phone.id}`}
                  className="bg-app-bg border border-app-border rounded-md p-3 relative flex items-center justify-between gap-3 group hover:border-app-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={phone.image}
                      alt={phone.name}
                      className="w-12 h-14 object-cover rounded border border-app-border bg-white flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-app-accent tracking-wider block">
                        Slot {slotIdx + 1} · {phone.brand}
                      </span>
                      <h4 className="text-xs font-bold text-app-text truncate">
                        {phone.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="tabular-nums text-xs font-bold text-app-text">
                          {formatINR(phone.currentPrice)}
                        </span>
                        {phone.isAtYearLow ? (
                          <span className="text-[9.5px] px-1 py-0.2 bg-teal-100 text-[#0F766E] rounded font-semibold">
                            1-Yr Low
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-app-muted tabular-nums">
                            {phone.percentBelowAvg}% below avg
                          </span>
                        )}
                        {phone.currentPrice === lowestPrice && activePhones.length > 1 && (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                            Lowest in Comparison
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        setActiveSlotSearch(isSearchOpen ? null : slotIdx)
                      }
                      className="text-[11px] text-app-muted hover:text-app-text px-2 py-1 rounded hover:bg-app-surface border border-transparent hover:border-app-border"
                      title="Swap this phone"
                    >
                      Swap
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(slotIdx);
                      }}
                      className="p-1.5 rounded text-app-muted hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Clear slot"
                      aria-label={`Clear slot ${slotIdx + 1}`}
                      data-testid={`clear-slot-${slotIdx + 1}`}
                    >
                      <X className="w-4 h-4 pointer-events-none" />
                    </button>
                  </div>

                  {/* Dropdown for Swap */}
                  {isSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-app-surface border border-app-border rounded-lg shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        value={slotSearchQuery}
                        onChange={(e) => setSlotSearchQuery(e.target.value)}
                        placeholder="Search replacement..."
                        className="w-full px-2 py-1 text-xs border border-app-border rounded mb-2 focus:outline-none focus:border-app-accent"
                        autoFocus
                      />
                      <div className="space-y-1">
                        {allPhones
                          .filter(
                            (p) =>
                              p.id !== phone.id &&
                              !slotPhones.some((sp, idx) => idx !== slotIdx && sp?.id === p.id) &&
                              p.name.toLowerCase().includes(slotSearchQuery.toLowerCase())
                          )
                          .map((candidate) => (
                            <button
                              key={candidate.id}
                              onClick={() => handleSetSlotPhone(slotIdx, candidate.id)}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-app-bg text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-app-text">
                                {candidate.name}
                              </span>
                              <span className="tabular-nums font-bold text-app-text">
                                {formatINR(candidate.currentPrice)}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Empty Slot (Strictly for slotIdx 0, 1, or 2)
            return (
              <div
                key={`empty-slot-${slotIdx}`}
                className="bg-white border-2 border-dashed border-app-border rounded-md p-4 relative flex flex-col items-center justify-center text-center hover:border-app-accent/80 transition-colors min-h-[82px]"
              >
                {!isSearchOpen ? (
                  <button
                    onClick={() => setActiveSlotSearch(slotIdx)}
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-app-bg flex items-center justify-center text-app-accent mb-1 group-hover:bg-teal-50">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-app-text">
                      Add Phone to Slot {slotIdx + 1}
                    </span>
                    <span className="text-[10px] text-app-muted mt-0.5">
                      Choose from 21 models under ₹30k
                    </span>
                  </button>
                ) : (
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-app-border-subtle">
                      <span className="text-xs font-semibold text-app-text">
                        Select Phone for Slot {slotIdx + 1}
                      </span>
                      <button
                        onClick={() => setActiveSlotSearch(null)}
                        className="text-app-muted hover:text-app-text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slotSearchQuery}
                      onChange={(e) => setSlotSearchQuery(e.target.value)}
                      placeholder="Type name (e.g. Vivo, Realme, Nord)..."
                      className="w-full px-2 py-1 text-xs border border-app-border rounded mb-2 focus:outline-none focus:border-app-accent"
                      autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {allPhones
                        .filter(
                          (p) =>
                            !slotPhones.some((sp) => sp?.id === p.id) &&
                            p.name.toLowerCase().includes(slotSearchQuery.toLowerCase())
                        )
                        .map((candidate) => (
                          <button
                            key={candidate.id}
                            onClick={() => handleSetSlotPhone(slotIdx, candidate.id)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-app-bg text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-app-text block">
                                {candidate.name}
                              </span>
                              <span className="text-[10px] text-app-muted">
                                {candidate.specs.chipset}
                              </span>
                            </div>
                            <span className="tabular-nums font-bold text-app-text">
                              {formatINR(candidate.currentPrice)}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 365-Day Daily Price Chart */}
      <PriceHistoryChart phones={activePhones} />

      {/* Sticky Table Headers & Grouped Spec Matrix */}
      <div className="bg-app-surface border border-app-border rounded-lg shadow-xs overflow-hidden">
        {/* Table Top Utility Bar */}
        <div className="p-3 bg-app-bg/60 border-b border-app-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-app-text uppercase tracking-wider text-[11px]">
              Technical Specifications Ledger
            </span>
            <span className="text-app-muted">·</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-app-text select-none font-medium">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded border-app-border text-app-accent focus:ring-app-accent h-3.5 w-3.5"
              />
              <span>Highlight spec differences</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-app-muted">
            <span>Flipkart single-store benchmark</span>
          </div>
        </div>

        {/* Sticky Header Row (Strict 4-Column Grid: Col 1 = Label, Col 2 = Slot 1, Col 3 = Slot 2, Col 4 = Slot 3) */}
        <div className="sticky top-[57px] z-20 bg-app-surface border-b border-app-border shadow-xs">
          <div className="grid grid-cols-12 divide-x divide-app-border">
            {/* Column 0: Label */}
            <div className="col-span-3 p-3 flex flex-col justify-end bg-app-bg/40">
              <span className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
                Comparing Specs
              </span>
              <span className="text-xs font-semibold text-app-text">
                {activePhones.length} of 3 devices active
              </span>
            </div>

            {/* Columns 1, 2, 3: Slots 0, 1, 2 */}
            {[0, 1, 2].map((slotIdx) => {
              const phone = slotPhones[slotIdx];

              if (!phone) {
                return (
                  <div
                    key={`header-slot-${slotIdx}-empty`}
                    className="col-span-3 p-3 bg-app-bg/10 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <span className="text-[11px] font-semibold text-app-muted">
                      Slot {slotIdx + 1} Empty
                    </span>
                    <button
                      onClick={() => setActiveSlotSearch(slotIdx)}
                      className="mt-1 text-xs text-app-accent font-semibold hover:underline"
                    >
                      + Add Phone
                    </button>
                    {onBrowseAll && (
                      <button
                        onClick={onBrowseAll}
                        className="text-[10px] text-app-muted hover:text-app-text mt-1"
                      >
                        Browse all 21 models
                      </button>
                    )}
                  </div>
                );
              }

              const inStock = phone.pincodeAvailability.status !== 'out_of_stock';
              const isWatchedItem = isWatched(phone.id);

              return (
                <div
                  key={`header-slot-${slotIdx}-${phone.id}`}
                  className="col-span-3 p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-app-accent uppercase tracking-wider">
                        Slot {slotIdx + 1} · {phone.brand}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSlot(slotIdx);
                        }}
                        className="text-app-muted hover:text-red-600 p-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
                        title="Clear slot"
                        aria-label={`Clear sticky slot ${slotIdx + 1}`}
                      >
                        <X className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                    </div>
                    <h3 className="text-xs font-bold text-app-text leading-tight mt-0.5 truncate">
                      {phone.name}
                    </h3>

                    {/* Price and Badges */}
                    <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                      <span className="tabular-nums font-heading font-extrabold text-sm text-app-text">
                        {formatINR(phone.currentPrice)}
                      </span>
                      <span className="tabular-nums text-[10px] text-app-muted line-through">
                        {formatINR(phone.mrp)}
                      </span>
                      {phone.isAtYearLow ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-[#0F766E]">
                          1-Yr Low
                        </span>
                      ) : (
                        <span className="text-[10px] text-app-muted tabular-nums">
                          {phone.percentBelowAvg}% below avg
                        </span>
                      )}
                      {phone.currentPrice === lowestPrice && activePhones.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                          Lowest Price
                        </span>
                      )}
                    </div>

                    {/* Stock Status Pill for Current Pincode */}
                    <div className="mt-1">
                      {phone.pincodeAvailability.status === 'in_stock' && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>In Stock ({pincode})</span>
                        </div>
                      )}
                      {phone.pincodeAvailability.status === 'back_in_stock' && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
                          <span>Back in Stock Today</span>
                        </div>
                      )}
                      {phone.pincodeAvailability.status === 'out_of_stock' && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Out of Stock ({pincode})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: View on Flipkart or Track Restock */}
                  <div className="mt-2 pt-1.5 border-t border-app-border-subtle flex items-center gap-1.5">
                    {inStock ? (
                      <a
                        href={phone.store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-2 py-1.5 rounded bg-app-accent hover:bg-app-accent-hover text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <span>View on Flipkart</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <>
                        <a
                          href={phone.store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 rounded bg-app-bg text-app-muted border border-app-border text-[11px] font-medium flex items-center justify-center gap-1 opacity-70 hover:opacity-100"
                        >
                          <span>Flipkart</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => toggleWatchlist(phone.id, phone.name)}
                          className={`flex-1 px-2 py-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border ${
                            isWatchedItem
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-app-accent text-white hover:bg-app-accent-hover border-app-accent'
                          }`}
                        >
                          <Bell className="w-3 h-3" />
                          <span>{isWatchedItem ? 'Tracking' : 'Track Restock'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grouped Spec Rows */}
        <div className="divide-y divide-app-border text-xs">
          
          {/* SECTION: PERFORMANCE & CHIPSET */}
          <div className="bg-app-bg/50 px-4 py-2 font-bold text-app-text flex items-center gap-1.5 uppercase text-[11px] tracking-wider border-t border-app-border">
            <Cpu className="w-3.5 h-3.5 text-app-accent" />
            <span>Performance, Processor & RAM</span>
          </div>

          {/* Chipset Row */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.chipset)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Chipset</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-chipset-${idx}`} className="col-span-3 p-3 font-semibold text-app-text">
                  {p ? p.specs.chipset : <span className="text-app-muted">—</span>}
                </div>
              );
            })}
          </div>

          {/* AnTuTu Score Row */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.antutuScore)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">
              <span>AnTuTu Benchmark (v10)</span>
            </div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              if (!p) return <div key={`spec-antutu-${idx}`} className="col-span-3 p-3 text-app-muted">—</div>;

              const scoreVal = parseInt((p.specs.antutuScore || '0').replace(/\D/g, ''));
              return (
                <div key={`spec-antutu-${idx}`} className="col-span-3 p-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="tabular-nums font-bold text-app-text text-xs">
                      {p.specs.antutuScore || 'N/A'}
                    </span>
                    {scoreVal === maxAntutu && activePhones.length > 1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                        Top Benchmark
                      </span>
                    )}
                  </div>
                  {scoreVal > 0 && (
                    <div className="w-full bg-app-border h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-app-accent h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (scoreVal / 1200000) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RAM & RAM Type Row */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.ram)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">RAM & Type</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-ram-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <span className="font-semibold">{p.specs.ram}</span>
                      <span className="text-[11px] text-app-muted block">{p.specs.ramType}</span>
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* SECTION: DISPLAY */}
          <div className="bg-app-bg/50 px-4 py-2 font-bold text-app-text flex items-center gap-1.5 uppercase text-[11px] tracking-wider border-t border-app-border">
            <Layers className="w-3.5 h-3.5 text-app-accent" />
            <span>Display & Visual Panel</span>
          </div>

          {/* Display Size & Panel Row */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.displayType)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Screen Type & Size</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-disp-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <span className="font-semibold block">{p.specs.displaySize}</span>
                      <span className="text-[11px] text-app-muted">{p.specs.displayType}</span>
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Refresh Rate & Brightness */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.refreshRate)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Refresh Rate & Brightness</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-refresh-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-app-accent tabular-nums">
                          {p.specs.refreshRate}
                        </span>
                        {p.specs.peakBrightness && (
                          <>
                            <span className="text-app-muted">·</span>
                            <span className="tabular-nums font-medium">{p.specs.peakBrightness}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-app-muted">{p.specs.resolution}</span>
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* SECTION: BATTERY & CHARGING */}
          <div className="bg-app-bg/50 px-4 py-2 font-bold text-app-text flex items-center gap-1.5 uppercase text-[11px] tracking-wider border-t border-app-border">
            <Battery className="w-3.5 h-3.5 text-app-accent" />
            <span>Battery, Endurance & Charging</span>
          </div>

          {/* Battery Capacity */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.batteryCapacity)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Battery Capacity</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              if (!p) return <div key={`spec-bat-${idx}`} className="col-span-3 p-3 text-app-muted">—</div>;

              const capacity = parseInt(p.specs.batteryCapacity || '0');
              return (
                <div key={`spec-bat-${idx}`} className="col-span-3 p-3 text-app-text">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="tabular-nums font-bold text-sm text-app-text">
                      {p.specs.batteryCapacity}
                    </span>
                    {capacity === maxBattery && activePhones.length > 1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                        Largest Battery
                      </span>
                    )}
                    {capacity >= 7000 && capacity !== maxBattery && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-teal-100 text-[#0F766E] rounded font-semibold">
                        Multi-day Endurance
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charging Speed */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.chargingSpeed)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Charging Speed</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              if (!p) return <div key={`spec-charge-${idx}`} className="col-span-3 p-3 text-app-muted">—</div>;
              const chargeVal = parseInt(p.specs.chargingSpeed || '0');
              return (
                <div key={`spec-charge-${idx}`} className="col-span-3 p-3 text-app-text">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold block tabular-nums">{p.specs.chargingSpeed}</span>
                    {chargeVal === maxCharging && activePhones.length > 1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                        Fastest Charge
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-app-muted block mt-0.5">{p.specs.wirelessCharging}</span>
                </div>
              );
            })}
          </div>

          {/* SECTION: CAMERA */}
          <div className="bg-app-bg/50 px-4 py-2 font-bold text-app-text flex items-center gap-1.5 uppercase text-[11px] tracking-wider border-t border-app-border">
            <Camera className="w-3.5 h-3.5 text-app-accent" />
            <span>Rear & Front Cameras</span>
          </div>

          {/* Rear Camera Primary */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.rearCamera?.primary)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Rear Primary Sensor</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-rcam-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <span className="font-semibold block">{p.specs.rearCamera.primary}</span>
                      {p.specs.rearCamera.secondary && (
                        <span className="text-[11px] text-app-muted block mt-0.5">
                          + {p.specs.rearCamera.secondary}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Front Selfie Camera */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.frontCamera?.resolution)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Front Selfie Camera</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-fcam-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <span className="font-semibold block">{p.specs.frontCamera.resolution}</span>
                      <span className="text-[10px] text-app-muted">{p.specs.frontCamera.features}</span>
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* SECTION: STORAGE & BUILD */}
          <div className="bg-app-bg/50 px-4 py-2 font-bold text-app-text flex items-center gap-1.5 uppercase text-[11px] tracking-wider border-t border-app-border">
            <HardDrive className="w-3.5 h-3.5 text-app-accent" />
            <span>Storage, Form Factor & OS</span>
          </div>

          {/* Storage & UFS */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.storage)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Storage & UFS Type</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-storage-${idx}`} className="col-span-3 p-3 text-app-text">
                  {p ? (
                    <>
                      <span className="font-semibold">{p.specs.storage}</span>
                      <span className="text-app-muted ml-1">({p.specs.storageType})</span>
                      <span className="text-[10px] text-app-muted block">{p.specs.expandableStorage}</span>
                    </>
                  ) : (
                    <span className="text-app-muted">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* OS & Update Support */}
          <div
            className={`grid grid-cols-12 divide-x divide-app-border transition-colors ${
              highlightDifferences && areValuesDifferent((p) => p.specs.os)
                ? 'bg-teal-50/40'
                : 'hover:bg-[#F9F9F7]'
            }`}
          >
            <div className="col-span-3 p-3 font-medium text-app-muted">Operating System & Updates</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-os-${idx}`} className="col-span-3 p-3 text-app-text text-[11px]">
                  {p ? p.specs.os : <span className="text-app-muted">—</span>}
                </div>
              );
            })}
          </div>

          {/* Release Date */}
          <div className="grid grid-cols-12 divide-x divide-app-border hover:bg-[#F9F9F7] transition-colors">
            <div className="col-span-3 p-3 font-medium text-app-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-app-accent" />
              <span>Release Date</span>
            </div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              return (
                <div key={`spec-date-${idx}`} className="col-span-3 p-3 text-app-text font-medium">
                  {p ? p.specs.releaseDate : <span className="text-app-muted">—</span>}
                </div>
              );
            })}
          </div>

          {/* PROS & CONS */}
          <div className="grid grid-cols-12 divide-x divide-app-border bg-app-bg/20">
            <div className="col-span-3 p-3 font-medium text-app-muted">Key Advantages & Tradeoffs</div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              if (!p) return <div key={`spec-pros-${idx}`} className="col-span-3 p-3 text-app-muted">—</div>;

              return (
                <div key={`spec-pros-${idx}`} className="col-span-3 p-3 space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-800 block mb-1">Pros:</span>
                    <ul className="space-y-0.5 list-disc list-inside text-app-text">
                      {p.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-1 border-t border-app-border-subtle">
                    <span className="font-bold text-amber-800 block mb-1">Cons:</span>
                    <ul className="space-y-0.5 list-disc list-inside text-app-muted">
                      {p.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FLIPKART OFFERS & BUY */}
          <div className="grid grid-cols-12 divide-x divide-app-border bg-teal-50/20">
            <div className="col-span-3 p-3 font-medium text-app-muted">
              <span>Active Flipkart Offers</span>
            </div>
            {[0, 1, 2].map((idx) => {
              const p = slotPhones[idx];
              if (!p) return <div key={`spec-offers-${idx}`} className="col-span-3 p-3 text-app-muted">—</div>;

              return (
                <div key={`spec-offers-${idx}`} className="col-span-3 p-3 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-teal-900 leading-snug">
                      {p.store.bankOffers}
                    </p>
                    <p className="text-[10px] text-app-muted mt-1">
                      Seller: {p.store.seller}
                    </p>
                  </div>
                  <div className="mt-3">
                    <a
                      href={p.store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-3 py-1.5 rounded bg-app-accent hover:bg-app-accent-hover text-white font-semibold text-xs inline-flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Buy on Flipkart</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
