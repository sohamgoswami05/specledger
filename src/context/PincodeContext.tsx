import React, { createContext, useContext, useState, useEffect } from 'react';
import { isValidIndianPincode, getPincodeRegionDescription } from '../utils/formatters';

interface PincodeContextType {
  pincode: string;
  setPincode: (pin: string) => void;
  isValid: boolean;
  zone: string;
  isWestBengalOrEast: boolean;
  watchlist: string[];
  setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
  toggleWatchlist: (phoneId: string, phoneName?: string) => void;
  isWatched: (phoneId: string) => boolean;
  filterWatchlistAgainstPhones: (validPhoneIds: string[]) => void;
  toast: string | null;
  clearToast: () => void;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
}

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export const PincodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincode, setPincodeState] = useState<string>(() => {
    return (
      localStorage.getItem('specledger_pincode') ||
      localStorage.getItem('smartpickr_pincode') ||
      '700034'
    );
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved =
        localStorage.getItem('specledger_restock_watchlist') ||
        localStorage.getItem('smartpickr_restock_watchlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<string | null>(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);

  const isValid = isValidIndianPincode(pincode);
  const { zone, isWestBengalOrEast } = getPincodeRegionDescription(pincode);

  const setPincode = (pin: string) => {
    setPincodeState(pin);
    localStorage.setItem('specledger_pincode', pin);
  };

  const filterWatchlistAgainstPhones = (validPhoneIds: string[]) => {
    if (!validPhoneIds || validPhoneIds.length === 0) return;
    setWatchlist((prev) => {
      const validSet = new Set(validPhoneIds);
      // Also match if an ID has or lacks variant suffixes
      const filtered = prev.filter((id) =>
        validSet.has(id) || validPhoneIds.some((vid) => vid.startsWith(id) || id.startsWith(vid))
      );
      if (filtered.length !== prev.length) {
        localStorage.setItem('specledger_restock_watchlist', JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  };

  const toggleWatchlist = (phoneId: string, phoneName?: string) => {
    setWatchlist((prev) => {
      let next: string[];
      // Match exact or prefix
      const isAlready = prev.some((id) => id === phoneId || id.startsWith(phoneId) || phoneId.startsWith(id));
      if (isAlready) {
        next = prev.filter((id) => id !== phoneId && !id.startsWith(phoneId) && !phoneId.startsWith(id));
        setToast(`Removed ${phoneName || 'phone'} from Restock Watchlist`);
      } else {
        next = [...prev, phoneId];
        setToast(`Tracking restock for ${phoneName || 'phone'} in Pincode ${pincode}`);
      }
      localStorage.setItem('specledger_restock_watchlist', JSON.stringify(next));
      return next;
    });
  };

  const isWatched = (phoneId: string) =>
    watchlist.some((id) => id === phoneId || id.startsWith(phoneId) || phoneId.startsWith(id));

  const clearToast = () => setToast(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <PincodeContext.Provider
      value={{
        pincode,
        setPincode,
        isValid,
        zone,
        isWestBengalOrEast,
        watchlist,
        setWatchlist,
        toggleWatchlist,
        isWatched,
        filterWatchlistAgainstPhones,
        toast,
        clearToast,
        isWatchlistOpen,
        setIsWatchlistOpen,
      }}
    >
      {children}
    </PincodeContext.Provider>
  );
};

export const usePincode = () => {
  const context = useContext(PincodeContext);
  if (!context) {
    throw new Error('usePincode must be used within a PincodeProvider');
  }
  return context;
};
