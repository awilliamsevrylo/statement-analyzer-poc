'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NewAnalysisModal from '@/components/modals/NewAnalysisModal';
import { AppContext } from './AppContext';

export default function ClientShell({ children }: { children: ReactNode }) {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const pathname = usePathname();
  const isMobileRoute = pathname === '/mobile';

  const openNewAnalysis = useCallback(() => setShowNewAnalysis(true), []);

  return (
    <AppContext.Provider value={{ openNewAnalysis }}>
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
