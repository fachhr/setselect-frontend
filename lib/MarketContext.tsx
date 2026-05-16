'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Market, MARKETS } from './markets';

interface MarketContextValue {
  market: Market;
  setMarket: (market: Market) => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

const STORAGE_KEY = 'talentPoolMarket';

function readStoredMarket(): Market {
  if (typeof window === 'undefined') return MARKETS[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && MARKETS.includes(stored as Market)) return stored as Market;
  return MARKETS[0];
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarketState] = useState<Market>(readStoredMarket);

  const setMarket = (m: Market) => {
    setMarketState(m);
    localStorage.setItem(STORAGE_KEY, m);
  };

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
