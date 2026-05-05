'use client';

// src/components/mobile/SourcingScreen.tsx
import { mcls, MCard, MBadge, MAppBar, MSectionLabel, MI, mFmtUSD, toneDot } from './MobileUI';
import { mChains } from '@/data/mobile';

export default function SourcingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <MAppBar
        title="Source of funds"
        left={
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--text)]">
            {MI.chevronLeft}
          </button>
        }
      />

      <MSectionLabel>{mChains.length} chains</MSectionLabel>
      <div className="mx-4 space-y-3">
        {mChains.map((chain) => (
          <MCard key={chain.id}>
            <div className="flex items-center justify-between">
              <MBadge
                tone={
                  chain.status === 'sourced'
                    ? 'success'
                    : chain.status === 'unsourced'
                    ? 'critical'
                    : 'warning'
                }
              >
                {chain.status}
              </MBadge>
              <span className="text-xs font-semibold text-[var(--text)]">{mFmtUSD(chain.amount)}</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--text)]">{chain.title}</div>
            <div className="text-xs text-[#94a3b8]">{chain.target} · {chain.date}</div>

            {/* Timeline */}
            <div className="mt-3 border-l-2 border-[#e2e8f0] pl-3 space-y-3">
              {chain.nodes.map((node, i) => {
                const t =
                  node.tone === 'success'
                    ? 'success'
                    : node.tone === 'critical'
                    ? 'critical'
                    : node.tone === 'warning'
                    ? 'warning'
                    : 'neutral';
                return (
                  <div key={i} className="relative">
                    <span className={mcls('absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white', toneDot(t))} />
                    <div className="text-xs font-medium text-[var(--text)]">{node.label}</div>
                    <div className="text-[11px] text-[#94a3b8]">{node.detail}</div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            {chain.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chain.actions.map((action) => (
                  <span key={action} className="rounded-lg bg-[#f8fafc] px-2 py-1 text-[10px] text-[#64748b]">
                    {action}
                  </span>
                ))}
              </div>
            )}
          </MCard>
        ))}
      </div>
    </div>
  );
}