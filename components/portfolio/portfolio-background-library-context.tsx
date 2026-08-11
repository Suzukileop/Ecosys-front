'use client';

import { createContext, useContext, type ReactNode } from 'react';

type PortfolioBackgroundLibraryContextValue = {
  library: string[];
  onLibraryChange: (urls: string[]) => void;
};

const PortfolioBackgroundLibraryContext =
  createContext<PortfolioBackgroundLibraryContextValue | null>(null);

export function PortfolioBackgroundLibraryProvider({
  library,
  onLibraryChange,
  children,
}: PortfolioBackgroundLibraryContextValue & { children: ReactNode }) {
  return (
    <PortfolioBackgroundLibraryContext.Provider value={{ library, onLibraryChange }}>
      {children}
    </PortfolioBackgroundLibraryContext.Provider>
  );
}

export function usePortfolioBackgroundLibrary(): PortfolioBackgroundLibraryContextValue | null {
  return useContext(PortfolioBackgroundLibraryContext);
}
