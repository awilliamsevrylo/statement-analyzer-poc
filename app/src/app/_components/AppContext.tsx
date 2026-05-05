'use client';

import { createContext, useContext } from 'react';

export type DecisionChoice = 'yes' | 'no' | 'chat';

export interface AppContextValue {
  openNewAnalysis: () => void;
  resolvedDecisions: Record<string, DecisionChoice>;
  setResolvedDecision: (eventId: string, choice: DecisionChoice) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within ClientShell');
  return ctx;
}
