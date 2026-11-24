import React from 'react';
import type { Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { usePincode } from '../context/PincodeContext';
import { PriceHistoryChart } from './PriceHistoryChart';
import {
  X,
  ExternalLink,
  Bell,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Battery,
  Camera,
} from 'lucide-react';

interface SinglePhoneModalProps {
  phone: Phone | null;
  onClose: () => void;
  isComparing: boolean;
  onToggleCompare: (id: string) => void;
}

export const SinglePhoneModal: React.FC<SinglePhoneModalProps> = ({
  phone,
  onClose,
  isComparing,
  onToggleCompare,
}) => {
  const { pincode, toggleWatchlist, isWatched } = usePincode();

  if (!phone) return null;

  const inStock = phone.pincodeAvailability.status !== 'out_of_stock';
  const isWatchedItem = isWatched(phone.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-app-surface border border-app-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-app-surface border-b border-app-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-app-accent bg-app-accent-subtle px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
              {phone.brand}
            </span>
            <h2 className="font-heading font-bold text-base text-app-text truncate">
              {phone.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-app-muted hover:text-app-text rounded hover:bg-app-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          {/* Top Info Bar */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <img
              src={phone.image}
              alt={phone.name}
              className="w-24 h-32 object-cover rounded-lg border border-app-border bg-white flex-shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="tabular-nums font-heading font-extrabold text-2xl text-app-text">
                  {formatINR(phone.currentPrice)}
                </span>
                <span className="tabular-nums text-sm text-app-muted line-through">
                  {formatINR(phone.mrp)}
                </span>
                {phone.isAtYearLow ? (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-[#0F766E]">
                    At 1-Year Low
                  </span>
                ) : (
                  <span className="text-xs text-app-muted tabular-nums">
                    {phone.percentBelowAvg}% below 1-Yr Avg ({formatINR(phone.oneYearAvg)})
                  </span>
                )}
              </div>

              {/* Pincode Availability */}
              <div className="flex items-center gap-2 text-xs">
                {inStock ? (
                  <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock for delivery to {pincode} ({phone.pincodeAvailability.estimatedDeliveryDays || 2} days)</span>
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Currently out of stock for {pincode} (Last seen: {phone.pincodeAvailability.lastInStockDate})</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-app-muted leading-relaxed">
                {phone.store.bankOffers} · Assured Seller: {phone.store.seller}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onToggleCompare(phone.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border ${
                    isComparing
                      ? 'bg-teal-50 border-teal-300 text-[#0F766E]'
                      : 'bg-app-bg border-app-border text-app-text hover:border-app-accent hover:text-app-accent'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isComparing ? 'In Comparison' : 'Add to Compare'}</span>
                </button>

                {inStock ? (
                  <a
                    href={phone.store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded bg-app-accent hover:bg-app-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View on Flipkart</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => toggleWatchlist(phone.id, phone.name)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border ${
                      isWatchedItem
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-app-accent text-white hover:bg-app-accent-hover border-app-accent'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isWatchedItem ? 'Restock Tracked' : 'Track Restock'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive 365-Day Price Chart for this Phone */}
          <PriceHistoryChart phones={[phone]} />

          {/* Key Specifications Grid */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-app-text uppercase tracking-wider text-[11px]">
              Key Hardware Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-app-bg p-3 rounded border border-app-border">
                <span className="font-semibold text-app-text flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-app-accent" />
                  <span>Processor & RAM</span>
                </span>
                <p className="text-app-text">{phone.specs.chipset}</p>
                <p className="text-app-muted text-[11px] mt-0.5">{phone.specs.ram} ({phone.specs.ramType}) · AnTuTu {phone.specs.antutuScore || 'N/A'}</p>
              </div>

              <div className="bg-app-bg p-3 rounded border border-app-border">
                <span className="font-semibold text-app-text flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-app-accent" />
                  <span>Display</span>
                </span>
                <p className="text-app-text">{phone.specs.displaySize} {phone.specs.displayType}</p>
                <p className="text-app-muted text-[11px] mt-0.5">{phone.specs.refreshRate} · {phone.specs.peakBrightness} peak brightness</p>
              </div>

              <div className="bg-app-bg p-3 rounded border border-app-border">
                <span className="font-semibold text-app-text flex items-center gap-1.5 mb-1">
                  <Battery className="w-3.5 h-3.5 text-app-accent" />
                  <span>Battery & Charging</span>
                </span>
                <p className="text-app-text">{phone.specs.batteryCapacity} Battery</p>
                <p className="text-app-muted text-[11px] mt-0.5">{phone.specs.chargingSpeed}</p>
              </div>

              <div className="bg-app-bg p-3 rounded border border-app-border">
                <span className="font-semibold text-app-text flex items-center gap-1.5 mb-1">
                  <Camera className="w-3.5 h-3.5 text-app-accent" />
                  <span>Camera Optics</span>
                </span>
                <p className="text-app-text">{phone.specs.rearCamera.primary}</p>
                <p className="text-app-muted text-[11px] mt-0.5">Front: {phone.specs.frontCamera.resolution}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
