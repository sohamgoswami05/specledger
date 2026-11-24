import React, { useState } from 'react';
import { usePincode } from '../context/PincodeContext';
import {
  MapPin,
  Clock,
  Bell,
  Scale,
  Smartphone,
  ChevronDown,
  AlertCircle,
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'compare' | 'browse';
  setActiveTab: (tab: 'compare' | 'browse') => void;
  comparedCount: number;
  totalCatalogCount: number;
  isLiveSupabase?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  comparedCount,
  totalCatalogCount,
  isLiveSupabase = false,
}) => {
  const {
    pincode,
    setPincode,
    zone,
    isWestBengalOrEast,
    watchlist,
    setIsWatchlistOpen,
  } = usePincode();

  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [tempPincode, setTempPincode] = useState(pincode);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSavePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(tempPincode.trim())) {
      setErrorMsg('Enter valid 6-digit PIN');
      return;
    }
    setPincode(tempPincode.trim());
    setErrorMsg('');
    setIsEditingPincode(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-app-surface border-b border-app-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Product Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center shadow-xs flex-shrink-0">
                <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                  <rect x="5.5" y="4.5" width="13" height="23" rx="2.5" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                  <circle cx="12" cy="7" r="0.75" fill="#FFFFFF"/>
                  <line x1="10" y1="24.5" x2="14" y2="24.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/>
                  <path d="M 8.5 12.5 H 12.5 V 16.5 H 18 V 21 H 26.5" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="26.5" cy="21" r="1.75" fill="#FFFFFF"/>
                  <line x1="21" y1="8" x2="26.5" y2="8" stroke="#99F6E4" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8"/>
                  <line x1="21" y1="12" x2="25" y2="12" stroke="#99F6E4" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8"/>
                </svg>
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-app-text tracking-tight leading-tight">
                  SpecLedger
                </h1>
                <p className="text-[11px] text-app-muted hidden sm:block">
                  Sub-₹30,000 Flipkart price ledger & spec matrix
                </p>
              </div>
            </div>

            {/* Mobile Watchlist Trigger */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-app-border text-xs text-app-text hover:bg-app-bg"
            >
              <Bell className="w-3.5 h-3.5 text-app-accent" />
              <span className="font-medium tabular-nums">{watchlist.length}</span>
            </button>
          </div>

          {/* Navigation Tab Switcher */}
          <nav className="flex items-center bg-app-bg p-1 rounded-lg border border-app-border self-start md:self-auto">
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'compare'
                  ? 'bg-app-surface text-app-text shadow-xs border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-app-accent" />
              <span>Spec & Price Comparison</span>
              <span className="tabular-nums px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-app-accent-light text-app-accent-hover">
                {comparedCount}/3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'browse'
                  ? 'bg-app-surface text-app-text shadow-xs border border-app-border'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-app-accent" />
              <span>Browse All Under ₹30k</span>
              <span className="tabular-nums px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-app-border text-app-muted">
                {totalCatalogCount}
              </span>
            </button>
          </nav>

          {/* Delivery Pincode & Daily Refresh Meta */}
          <div className="flex items-center gap-2.5">
            {/* Pincode Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setTempPincode(pincode);
                  setIsEditingPincode(!isEditingPincode);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                  isWestBengalOrEast
                    ? 'border-teal-200 bg-teal-50/70 text-app-text hover:bg-teal-100/50'
                    : 'border-app-border bg-app-bg text-app-text hover:bg-app-border-subtle'
                }`}
                title="Change Flipkart delivery pincode"
              >
                <MapPin className="w-3.5 h-3.5 text-app-accent" />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold tabular-nums">{pincode}</span>
                    <ChevronDown className="w-3 h-3 text-app-muted" />
                  </div>
                  <span className="text-[10px] text-app-muted block leading-none">
                    {isWestBengalOrEast ? 'West Bengal (7xxxxx)' : zone.slice(0, 18)}
                  </span>
                </div>
              </button>

              {/* Pincode Edit Popover */}
              {isEditingPincode && (
                <div className="absolute right-0 mt-2 w-72 bg-app-surface border border-app-border rounded-lg shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-app-border-subtle">
                    <span className="text-xs font-semibold text-app-text">
                      Check Flipkart Delivery PIN
                    </span>
                    <button
                      onClick={() => setIsEditingPincode(false)}
                      className="text-app-muted hover:text-app-text p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleSavePincode} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        value={tempPincode}
                        onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 700034"
                        className="w-full px-2.5 py-1.5 text-xs border border-app-border rounded focus:outline-none focus:border-app-accent tabular-nums font-medium"
                      />
                      {errorMsg && (
                        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errorMsg}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setTempPincode('700034')}
                          className="px-1.5 py-0.5 bg-app-bg border border-app-border rounded hover:bg-app-border"
                        >
                          700034 (Kolkata)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempPincode('712201')}
                          className="px-1.5 py-0.5 bg-app-bg border border-app-border rounded hover:bg-app-border"
                        >
                          712201 (WB)
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-app-accent text-white text-xs font-semibold rounded hover:bg-app-accent-hover"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Daily Scrape Indicator Tooltip Pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 text-[11px] text-app-muted px-2.5 py-1 bg-app-bg border border-app-border rounded-md"
              title="Daily stock check timestamp"
            >
              <Clock className="w-3 h-3 text-app-accent" />
              <span>Stock refreshed daily · 9:00 AM IST</span>
            </div>

            {/* Watchlist Trigger Button */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-border bg-app-surface text-xs font-medium text-app-text hover:bg-app-bg transition-colors cursor-pointer"
              title="View restock watchlist"
              data-testid="watchlist-trigger"
            >
              <Bell className="w-3.5 h-3.5 text-app-accent" />
              <span className="hidden sm:inline">Watchlist</span>
              {watchlist.length > 0 ? (
                <span className="tabular-nums font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                  {watchlist.length}
                </span>
              ) : (
                <span className="tabular-nums font-medium px-1.5 py-0.2 rounded-full text-[10px] bg-app-bg border border-app-border text-app-muted">
                  0
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
