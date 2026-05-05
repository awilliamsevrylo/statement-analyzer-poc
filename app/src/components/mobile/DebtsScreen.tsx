'use client';

// src/components/mobile/DebtsScreen.tsx
import { MCard, MRing, MAppBar, MSectionLabel, MI, mFmtUSD } from './MobileUI';
import { mDebts, mFileStats } from '@/data/mobile';

export default function DebtsScreen({ onBack }: { onBack: () => void }) {
  const totalMonthly = mFileStats.undisclosed_debts_monthly;

  const categories = [
    { label: 'BNPL', amount: mDebts.filter((d) => d.tag === 'BNPL').reduce((s, d) => s + d.monthly, 0) },
    { label: 'Auto', amount: mDebts.filter((d) => d.tag === 'Auto').reduce((s, d) => s + d.monthly, 0) },
    { label: 'Rent', amount: mDebts.filter((d) => d.tag === 'Rent').reduce((s, d) => s + d.monthly, 0) },
  ].filter((c) => c.amount > 0);

  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <MAppBar
        title="Undisclosed debts"
        left={
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--text)]">
            {MI.chevronLeft}
          </button>
        }
      />

      {/* DTI impact card */}
      <div className="mx-4">
        <MCard>
          <div className="text-xs text-[#94a3b8]">Total monthly impact</div>
          <div className="mt-0.5 text-2xl font-bold text-[var(--text)]">{mFmtUSD(totalMonthly)}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.label} className="rounded-lg bg-[#f8fafc] px-2 py-1 text-[11px] font-medium text-[#64748b]">
                {c.label} · {mFmtUSD(c.amount)}
              </span>
            ))}
          </div>
        </MCard>
      </div>

      <MSectionLabel>{mDebts.length} patterns detected</MSectionLabel>
      <div className="mx-4 space-y-2">
        {mDebts.map((debt) => (
          <MCard key={debt.id}>
            <div className="flex items-start gap-3">
              <MRing value={debt.confidence} size={44} stroke={4} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">{debt.payee}</span>
                  <span className="rounded bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-medium text-[#64748b]">{debt.tag}</span>
                </div>
                <div className="mt-0.5 text-xs text-[#94a3b8]">{debt.type} · {debt.occurrences} occurrences</div>
                <div className="mt-1 text-sm font-bold text-[var(--text)]">{mFmtUSD(debt.monthly)}/mo</div>
                <div className="mt-1 text-xs text-[#64748b]">{debt.note}</div>
              </div>
            </div>
          </MCard>
        ))}
      </div>
    </div>
  );
}