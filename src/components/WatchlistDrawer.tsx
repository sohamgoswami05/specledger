import React from 'react';
import type { Phone } from '../types/phone';
import { formatINR } from '../utils/formatters';
import { usePincode } from '../context/PincodeContext';
import {
  X,
  Bell,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface WatchlistDrawerProps {
  allPhones: Phone[];
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({ allPhones }) => {
  const {
    pincode,
    watchlist,
    toggleWatchlist,
    isWatchlistOpen,
    setIsWatchlistOpen,
  } = usePincode();

  if (!isWatchlistOpen) return null;

  const watchedPhones = watchlist
    .map((id) =>
      allPhones.find((p) => p.id === id || p.id.startsWith(id) || id.startsWith(p.id))
    )
    .filter(Boolean) as Phone[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Restock Watchlist"
      data-testid="watchlist-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
    >
      <div className="w-full max-w-md bg-app-surface h-full shadow-2xl flex flex-col justify-between border-l border-app-border">
        {/* Drawer Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-app-text">
                Restock Watchlist ({watchedPhones.length})
              </h3>
              <p className="text-[11px] text-app-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-app-accent" />
                <span>Delivery Pin: {pincode} (Daily 9 AM IST check)</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWatchlistOpen(false)}
            className="p-1.5 text-app-muted hover:text-app-text rounded hover:bg-app-bg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Watchlist Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {watchedPhones.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-app-muted">
              <Bell className="w-8 h-8 text-app-border mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-app-text">No phones on your restock radar</p>
              <p className="text-[11px] text-app-muted mt-1 max-w-xs">
                When a smartphone is out of stock in {pincode}, click "Track Restock" to monitor daily Flipkart replenishment.
              </p>
            </div>
          ) : (
            watchedPhones.map((phone) => {
              const inStock = phone.pincodeAvailability.status !== 'out_of_stock';
              return (
                <div
                  key={phone.id}
                  className="bg-app-bg border border-app-border rounded-lg p-3 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={phone.image}
                      alt={phone.name}
                      className="w-12 h-14 object-cover rounded border border-app-border bg-white flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-app-accent uppercase tracking-wider">
                          {phone.brand}
                        </span>
                        <button
                          onClick={() => toggleWatchlist(phone.id, phone.name)}
                          className="text-app-muted hover:text-red-600 p-0.5"
                          title="Untrack phone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-app-text truncate">
                        {phone.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="tabular-nums font-bold text-xs text-app-text">
                          {formatINR(phone.currentPrice)}
                        </span>
                        <span className="text-[10px] text-app-muted">
                          (1-Yr Low: {formatINR(phone.oneYearLow)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock History Status for 7xxxxx */}
                  <div className="pt-2 border-t border-app-border-subtle flex items-center justify-between text-[11px]">
                    <div>
                      {inStock ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Currently Available</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Last in stock: {phone.pincodeAvailability.lastInStockDate}</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={phone.store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-app-accent font-semibold text-xs flex items-center gap-1 hover:underline"
                    >
                      <span>Flipkart</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-app-border bg-app-bg/50 space-y-2">
          <div className="text-[11px] text-app-muted leading-relaxed">
            <span className="font-semibold text-app-text">SpecLedger Daily Restock Engine:</span> Scrapes Flipkart stock status daily at 9:00 AM IST for PIN {pincode}.
          </div>
          <button
            onClick={() => setIsWatchlistOpen(false)}
            className="w-full py-2 bg-app-surface border border-app-border rounded text-xs font-semibold text-app-text hover:bg-app-bg transition-colors"
          >
            Close Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};
