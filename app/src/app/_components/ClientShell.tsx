'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewAnalysisModal from '@/components/modals/NewAnalysisModal';
import { AppContext, type DecisionChoice } from './AppContext';

export default function ClientShell({ children }: { children: ReactNode }) {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [resolvedDecisions, setResolvedDecisions] = useState<Record<string, DecisionChoice>>({});
  const pathname = usePathname();
  const isMobileRoute = pathname === '/mobile';

  const openNewAnalysis = useCallback(() => setShowNewAnalysis(true), []);
  const setResolvedDecision = useCallback(
    (eventId: string, choice: DecisionChoice) =>
      setResolvedDecisions((prev) => ({ ...prev, [eventId]: choice })),
    [],
  );

  return (
    <AppContext.Provider value={{ openNewAnalysis, resolvedDecisions, setResolvedDecision }}>
      <div className="min-h-[100dvh] bg-slate-50">
        {!isMobileRoute && <Navbar />}
        {children}
        {showNewAnalysis && (
          <NewAnalysisModal onClose={() => setShowNewAnalysis(false)} />
        )}
      </div>
    </AppContext.Provider>
  );
}
