'use client';

// src/components/mobile/DepositsScreen.tsx
import { useState } from 'react';
import { mcls, MCard, MBtn, MBadge, MAppBar, MI, mFmtUSD } from './MobileUI';
import { mDeposits } from '@/data/mobile';

const TABS = ['All', 'Need action', 'Cleared'] as const;
type Tab = (typeof TABS)[number];

export default function DepositsScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('All');

  const filtered = mDeposits.filter((d) => {
    if (tab === 'All') return true;
    if (tab === 'Need action') return d.severity === 'critical' || d.severity === 'warning';
    return d.severity === 'success' || d.severity === 'info';
  });

  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <MAppBar
        title="Large deposits"
        left={
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--text)]">
            {MI.chevronLeft}
          </button>
        }
      />

      {/* Threshold card */}
      <div className="mx-4">
        <MCard>
          <div className="text-xs text-[#94a3b8]">Threshold (50% of monthly income)</div>
          <div className="mt-0.5 text-lg font-bold text-[var(--text)]">{mFmtUSD(15208)}</div>
        </MCard>
      </div>

      {/* Filter tabs */}
      <div className="mx-4 mt-3 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={mcls(
              'flex-1 rounded-lg py-2 text-xs font-medium transition-colors',
              tab === t ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] text-[#94a3b8] border border-[rgba(15,23,42,0.08)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Deposit rows */}
      <div className="mx-4 mt-3 space-y-2">
        {filtered.map((deposit) => (
          <MCard key={deposit.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-[#94a3b8]">{deposit.date}</div>
                <div className="text-sm font-semibold text-[var(--text)]">{deposit.desc}</div>
                <div className="text-[11px] text-[#94a3b8]">{deposit.account}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--text)]">{mFmtUSD(deposit.amount)}</div>
                <MBadge
                  tone={
                    deposit.severity === 'critical'
                      ? 'critical'
                      : deposit.severity === 'warning'
                      ? 'warning'
                      : deposit.severity === 'success'
                      ? 'success'
                      : 'info'
                  }
                >
                  {deposit.status}
                </MBadge>
              </div>
            </div>
            <div className="mt-2 text-xs text-[#64748b]">{deposit.note}</div>
            {(deposit.severity === 'critical' || deposit.severity === 'warning') && (
              <div className="mt-2 flex gap-2">
                <MBtn variant="secondary" size="sm" className="flex-1">{MI.mail} Email</MBtn>
                <MBtn variant="ghost" size="sm" className="flex-1">Waive</MBtn>
              </div>
            )}
          </MCard>
        ))}
      </div>
    </div>
  );
}