'use client';

import { createContext, useContext } from 'react';

export interface AppContextValue {
  openNewAnalysis: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within ClientShell');
  return ctx;
}
