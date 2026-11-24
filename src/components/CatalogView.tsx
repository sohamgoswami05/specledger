import React from 'react';
import type { Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { usePincode } from '../context/PincodeContext';
import {
  ExternalLink,
  Bell,
  AlertTriangle,
  Scale,
  TrendingDown,
  Cpu,
  Battery,
  Camera,
  Layers,
} from 'lucide-react';

interface CatalogViewProps {
  phones: Phone[];
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onOpenSinglePhoneModal: (phone: Phone) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  phones,
  comparedIds,
  onToggleCompare,
  onOpenSinglePhoneModal,
}) => {
  const { pincode, toggleWatchlist, isWatched } = usePincode();

  if (phones.length === 0) {
    return (
      <div className="bg-app-surface border border-app-border rounded-lg p-12 text-center shadow-xs">
        <h3 className="font-heading font-bold text-base text-app-text mb-1">
          No smartphones match the current filters
        </h3>
        <p className="text-xs text-app-muted max-w-md mx-auto mb-4">
          Try expanding the price ceiling or clearing specific brand / stock filters to see more results under ₹30,000.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Catalog Metric Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-app-muted px-1">
        <div>
          <span>Showing </span>
          <span className="font-bold text-app-text tabular-nums">{phones.length}</span>
          <span> Flipkart models under ₹30,000 (Vivo, OnePlus, Realme, Samsung)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>In Stock ({pincode})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Back in Stock Today</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Out of Stock</span>
          </span>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phones.map((phone) => {
          const isComparing = comparedIds.some(
            (cId) => cId === phone.id || cId.startsWith(phone.id) || phone.id.startsWith(cId)
          );
          const compareSlotIndex = comparedIds.findIndex(
            (cId) => cId === phone.id || cId.startsWith(phone.id) || phone.id.startsWith(cId)
          );
          const inStock = phone.pincodeAvailability.status !== 'out_of_stock';
          const isWatchedItem = isWatched(phone.id);

          // Calculate simple sparkline coordinates for 365-day price
          const minP = phone.oneYearLow;
          const maxP = phone.oneYearHigh;
          const range = maxP - minP || 1;
          const sampledHistory = phone.priceHistory && phone.priceHistory.length > 0
            ? phone.priceHistory.filter((_, idx) => idx % 7 === 0)
            : [];
          const sparklinePoints = sampledHistory.length > 1
            ? sampledHistory
                .map((pt, i) => {
                  const x = (i / (sampledHistory.length - 1)) * 120;
                  const y = 30 - ((pt.price - minP) / range) * 26;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ')
            : `0,16 60,16 120,16`;

          return (
            <div
              key={phone.id}
              className={`bg-app-surface border rounded-lg p-4 flex flex-col justify-between transition-all duration-150 hover:shadow-sm ${
                isComparing
                  ? 'border-app-accent ring-1 ring-app-accent'
                  : 'border-app-border hover:border-app-border-subtle'
              }`}
            >
              <div>
                {/* Header: Brand & Deal Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-app-accent bg-app-accent-subtle px-2 py-0.5 rounded border border-teal-200">
                    {phone.brand}
                  </span>
                  
                  {phone.isAtYearLow ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-[#0F766E] flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>At 1-Year Low</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-app-bg text-app-muted border border-app-border tabular-nums">
                      {phone.percentBelowAvg}% below avg
                    </span>
                  )}
                </div>

                {/* Main Product Info & Thumbnail */}
                <div className="flex gap-3 mb-3">
                  <img
                    src={phone.image}
                    alt={phone.name}
                    className="w-16 h-20 object-cover rounded border border-app-border bg-white flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-sm text-app-text leading-snug line-clamp-2">
                      {phone.name}
                    </h3>

                    {/* Pricing Block */}
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="tabular-nums font-heading font-extrabold text-base text-app-text">
                        {formatINR(phone.currentPrice)}
                      </span>
                      <span className="tabular-nums text-xs text-app-muted line-through">
                        {formatINR(phone.mrp)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {Math.round(((phone.mrp - phone.currentPrice) / phone.mrp) * 100)}% off
                      </span>
                    </div>

                    {/* Stock Status Pill */}
                    <div className="mt-1.5">
                      {phone.pincodeAvailability.status === 'in_stock' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>In Stock ({pincode})</span>
                        </span>
                      )}
                      {phone.pincodeAvailability.status === 'back_in_stock' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
                          <span>Back in Stock Today</span>
                        </span>
                      )}
                      {phone.pincodeAvailability.status === 'out_of_stock' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 365-Day Mini Price Sparkline Preview */}
                <div
                  onClick={() => onOpenSinglePhoneModal(phone)}
                  className="bg-app-bg p-2 rounded border border-app-border-subtle mb-3 cursor-pointer hover:border-app-border transition-colors group"
                  title="Click to view full 365-day price chart"
                >
                  <div className="flex items-center justify-between text-[10px] text-app-muted mb-1">
                    <span>1-Year Flipkart Range:</span>
                    <span className="tabular-nums font-medium text-app-text group-hover:text-app-accent">
                      {formatINR(phone.oneYearLow)} – {formatINR(phone.oneYearHigh)} ↗
                    </span>
                  </div>
                  <div className="h-8 w-full flex items-center justify-center">
                    <svg viewBox="0 0 120 32" className="w-full h-8 overflow-visible">
                      <polyline
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={sparklinePoints}
                      />
                    </svg>
                  </div>
                </div>

                {/* Key Spec Chips */}
                {(() => {
                  const chipsetShort = phone.specs?.chipset ? phone.specs.chipset.split('(')[0].trim() : 'Octa-core';
                  const chargingShort = phone.specs?.chargingSpeed ? phone.specs.chargingSpeed.split(' ')[0] : 'Fast';
                  const displayType = phone.specs?.displayType ? phone.specs.displayType.split(',')[0].slice(0, 12) : 'AMOLED';
                  const rearCamText = typeof phone.specs?.rearCamera === 'string'
                    ? phone.specs.rearCamera
                    : phone.specs?.rearCamera?.primary || '50 MP';
                  const rearCamShort = (rearCamText.split(' ')[0] || '50') + ' MP OIS';

                  return (
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-app-text mb-3">
                      <div className="flex items-center gap-1 truncate text-app-muted">
                        <Cpu className="w-3 h-3 text-app-accent flex-shrink-0" />
                        <span className="truncate" title={phone.specs?.chipset}>{chipsetShort}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-app-muted">
                        <Battery className="w-3 h-3 text-app-accent flex-shrink-0" />
                        <span>{phone.specs?.batteryCapacity || '5000 mAh'} · {chargingShort}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-app-muted">
                        <Layers className="w-3 h-3 text-app-accent flex-shrink-0" />
                        <span>{phone.specs?.refreshRate || '120 Hz'} {displayType}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-app-muted">
                        <Camera className="w-3 h-3 text-app-accent flex-shrink-0" />
                        <span className="truncate">{rearCamShort}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Actions: Compare & Flipkart/Watchlist */}
              <div className="pt-2 border-t border-app-border-subtle flex items-center gap-2">
                <button
                  onClick={() => onToggleCompare(phone.id)}
                  className={`flex-1 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                    isComparing
                      ? 'bg-teal-50 border-teal-300 text-[#0F766E]'
                      : 'bg-app-bg border-app-border text-app-text hover:border-app-accent hover:text-app-accent'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isComparing ? `Slot ${compareSlotIndex + 1}` : 'Compare'}</span>
                </button>

                {inStock ? (
                  <a
                    href={phone.store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-app-accent hover:bg-app-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                    title="View directly on Flipkart"
                  >
                    <span>Flipkart</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => toggleWatchlist(phone.id, phone.name)}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors border ${
                      isWatchedItem
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-app-accent text-white hover:bg-app-accent-hover border-app-accent'
                    }`}
                    title="Track stock return for your pincode"
                  >
                    <Bell className="w-3 h-3" />
                    <span>{isWatchedItem ? 'Tracking' : 'Track'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
