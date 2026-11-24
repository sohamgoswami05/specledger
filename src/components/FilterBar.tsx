import React, { useState, useRef, useEffect } from 'react';
import type { Brand, Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { Search, X, Check, ArrowUpDown, Scale, Eye } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  selectedBrand: Brand | 'All';
  maxPrice: number;
  onlyYearLow: boolean;
  onlyBelowAvg: boolean;
  onlyDeliverable: boolean;
  onlyBackInStock: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'discount-desc' | 'battery-desc';
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  brandCounts: Record<Brand, number>;
  allPhones: Phone[];
  onAddComparePhone?: (phoneId: string) => void;
  onInspectPhone?: (phone: Phone) => void;
  comparedIds?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  brandCounts,
  allPhones,
  onAddComparePhone,
  onInspectPhone,
  comparedIds = [],
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const brands: (Brand | 'All')[] = ['All', 'Vivo', 'OnePlus', 'Realme', 'Samsung'];

  const handleBrandChange = (brand: Brand | 'All') => {
    setFilters((prev) => ({ ...prev, selectedBrand: brand }));
  };

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      selectedBrand: 'All',
      maxPrice: 30000,
      onlyYearLow: false,
      onlyBelowAvg: false,
      onlyDeliverable: false,
      onlyBackInStock: false,
      sortBy: 'discount-desc',
    });
    setIsDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation: Escape key closes dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const queryTrimmed = filters.searchQuery.trim().toLowerCase();

  // Autocomplete matching phones
  const autocompleteMatches = queryTrimmed.length >= 1
    ? allPhones.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(queryTrimmed);
        const matchesBrand = p.brand.toLowerCase().includes(queryTrimmed);
        const matchesChipset = p.specs.chipset.toLowerCase().includes(queryTrimmed);
        return matchesName || matchesBrand || matchesChipset;
      })
    : [];

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.selectedBrand !== 'All' ||
    filters.maxPrice < 30000 ||
    filters.onlyYearLow ||
    filters.onlyBelowAvg ||
    filters.onlyDeliverable ||
    filters.onlyBackInStock;

  return (
    <div className="bg-app-surface border-b border-app-border py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Search, Brand Chips, and Price Ceiling */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Live Autocomplete Search Box */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted z-10" />
            <input
              type="text"
              value={filters.searchQuery}
              onFocus={() => {
                if (filters.searchQuery.trim().length >= 1) setIsDropdownOpen(true);
              }}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({ ...prev, searchQuery: val }));
                setIsDropdownOpen(val.trim().length >= 1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search phone or chipset (e.g. Nord, Snapdragon, Dimensity)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-app-bg border border-app-border rounded-md text-app-text focus:outline-none focus:border-app-accent focus:bg-white placeholder:text-app-muted"
            />
            {filters.searchQuery && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, searchQuery: '' }));
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-text z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Autocomplete Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-app-surface border border-app-border rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-app-border-subtle max-h-80 overflow-y-auto animate-fadeIn">
                <div className="p-2 bg-app-bg/60 text-[11px] font-semibold text-app-muted flex items-center justify-between">
                  <span>SpecLedger Autocomplete ({autocompleteMatches.length} matches)</span>
                  <span className="text-[10px] text-app-muted font-normal">Press Esc to close</span>
                </div>

                {autocompleteMatches.length === 0 ? (
                  <div className="p-4 text-center text-xs text-app-muted">
                    No phones found matching &ldquo;<span className="font-semibold text-app-text">{filters.searchQuery}</span>&rdquo; under ₹30,000.
                  </div>
                ) : (
                  autocompleteMatches.map((phone) => {
                    const isAlreadyCompared = comparedIds.some(
                      (id) => id === phone.id || id.startsWith(phone.id) || phone.id.startsWith(id)
                    );

                    return (
                      <div
                        key={phone.id}
                        className="p-2.5 hover:bg-app-bg/50 flex items-center justify-between gap-3 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={phone.image}
                            alt={phone.name}
                            className="w-9 h-11 object-cover rounded border border-app-border bg-white flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] font-bold text-app-accent uppercase tracking-wider">
                                {phone.brand}
                              </span>
                              <span className="font-bold text-app-text truncate">
                                {phone.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-app-muted mt-0.5">
                              <span className="truncate">{phone.specs?.chipset ? phone.specs.chipset.split('(')[0].trim() : 'Octa-core'}</span>
                              <span>·</span>
                              <span className="tabular-nums font-bold text-app-text">
                                {formatINR(phone.currentPrice)}
                              </span>
                            </div>
                            <div className="mt-0.5">
                              {phone.pincodeAvailability.status === 'in_stock' && (
                                <span className="text-[9px] text-emerald-700 font-medium bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                  In Stock
                                </span>
                              )}
                              {phone.pincodeAvailability.status === 'back_in_stock' && (
                                <span className="text-[9px] text-[#0F766E] font-bold bg-teal-50 px-1 py-0.2 rounded border border-teal-200">
                                  Back in Stock Today
                                </span>
                              )}
                              {phone.pincodeAvailability.status === 'out_of_stock' && (
                                <span className="text-[9px] text-amber-700 font-medium bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {onInspectPhone && (
                            <button
                              type="button"
                              onClick={() => {
                                onInspectPhone(phone);
                                setIsDropdownOpen(false);
                              }}
                              className="px-2 py-1 rounded bg-app-bg hover:bg-app-surface border border-app-border text-app-text text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title="Inspect full details"
                            >
                              <Eye className="w-3 h-3 text-app-muted" />
                              <span>Inspect</span>
                            </button>
                          )}

                          {onAddComparePhone && (
                            <button
                              type="button"
                              onClick={() => {
                                onAddComparePhone(phone.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors border ${
                                isAlreadyCompared
                                  ? 'bg-teal-50 text-[#0F766E] border-teal-300'
                                  : 'bg-app-accent hover:bg-app-accent-hover text-white border-app-accent'
                              }`}
                            >
                              <Scale className="w-3 h-3" />
                              <span>{isAlreadyCompared ? 'In Compare' : '+ Compare'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Brand Switchers */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-app-muted text-[11px] font-medium mr-1 hidden sm:inline">
              Brand:
            </span>
            {brands.map((brand) => {
              const isSelected = filters.selectedBrand === brand;
              const count = brand === 'All' ? allPhones.length : brandCounts[brand] || 0;
              return (
                <button
                  key={brand}
                  onClick={() => handleBrandChange(brand)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-app-accent text-white border-app-accent'
                      : 'bg-app-bg text-app-text border-app-border hover:bg-app-border-subtle'
                  }`}
                >
                  <span>{brand}</span>
                  <span
                    className={`text-[10px] tabular-nums px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-app-border text-app-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Price Ceiling Control */}
          <div className="flex items-center gap-2 text-xs bg-app-bg px-2.5 py-1.5 rounded-md border border-app-border">
            <span className="text-app-muted font-medium whitespace-nowrap">
              Max Price:
            </span>
            <input
              type="range"
              min={15000}
              max={30000}
              step={1000}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
              }
              className="w-24 accent-[#0F766E] cursor-pointer"
            />
            <span className="tabular-nums font-bold text-app-text min-w-[58px]">
              {formatINR(filters.maxPrice)}
            </span>
          </div>
        </div>

        {/* Row 2: Status Badges, Sort & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-app-border-subtle text-xs">
          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-app-muted text-[11px] font-medium mr-0.5">Filter by:</span>

            {/* At 1-Year Low */}
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, onlyYearLow: !prev.onlyYearLow }))
              }
              className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                filters.onlyYearLow
                  ? 'bg-teal-50 border-teal-300 text-[#0F766E] font-semibold'
                  : 'bg-app-bg border-app-border text-app-muted hover:text-app-text'
              }`}
            >
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${filters.onlyYearLow ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-app-muted'}`}>
                {filters.onlyYearLow && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>At 1-Year Low</span>
            </button>

            {/* % Below Average */}
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, onlyBelowAvg: !prev.onlyBelowAvg }))
              }
              className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                filters.onlyBelowAvg
                  ? 'bg-teal-50 border-teal-300 text-[#0F766E] font-semibold'
                  : 'bg-app-bg border-app-border text-app-muted hover:text-app-text'
              }`}
            >
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${filters.onlyBelowAvg ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-app-muted'}`}>
                {filters.onlyBelowAvg && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>Below 1-Yr Average</span>
            </button>

            {/* Deliverable to 7xxxxx */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  onlyDeliverable: !prev.onlyDeliverable,
                }))
              }
              className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                filters.onlyDeliverable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-app-bg border-app-border text-app-muted hover:text-app-text'
              }`}
            >
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${filters.onlyDeliverable ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-app-muted'}`}>
                {filters.onlyDeliverable && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>Deliverable to 7xxxxx</span>
            </button>

            {/* Back in Stock Recently */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  onlyBackInStock: !prev.onlyBackInStock,
                }))
              }
              className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                filters.onlyBackInStock
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-app-bg border-app-border text-app-muted hover:text-app-text'
              }`}
            >
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${filters.onlyBackInStock ? 'bg-amber-600 border-amber-600 text-white' : 'border-app-muted'}`}>
                {filters.onlyBackInStock && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>Back in Stock Today</span>
            </button>
          </div>

          {/* Sort & Reset Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-app-muted">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as FilterState['sortBy'],
                  }))
                }
                className="bg-transparent text-xs text-app-text font-medium focus:outline-none cursor-pointer"
              >
                <option value="discount-desc">Highest Discount</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="battery-desc">Highest Battery (mAh)</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={handleReset}
                className="text-app-accent hover:underline font-semibold text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-app-muted text-[11px] tabular-nums pl-1 border-l border-app-border">
              {totalMatches} matching phones
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
