// src/components/mobile/AuditScreen.tsx
import { useState, useMemo } from 'react';
import { mcls, MCard, MBadge, MAppBar, MSectionLabel, MI, mFmtUSD } from './MobileUI';
import { mAudit } from '@/data/mobile';

const CHIPS = ['All', 'Internal', 'Unsourced', 'Undisclosed', 'W-2', 'Earnest'] as const;
type Chip = (typeof CHIPS)[number];

export default function AuditScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<Chip>('All');

  const filtered = useMemo(() => {
    return mAudit.filter((a) => {
      const matchesQuery =
        !query ||
        a.desc.toLowerCase().includes(query.toLowerCase()) ||
        a.chip.toLowerCase().includes(query.toLowerCase());
      const matchesChip = chip === 'All' || a.chip === chip;
      return matchesQuery && matchesChip;
    });
  }, [query, chip]);

  const toneFor = (tone: string): import('./MobileUI').MTone => {
    switch (tone) {
      case 'critical': return 'critical';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success':
      case 'income': return 'success';
      case 'transfer': return 'info';
      case 'debt': return 'critical';
      default: return 'neutral';
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <MAppBar
        title="Audit trail"
        left={
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--text)]">
            {MI.chevronLeft}
          </button>
        }
      />

      {/* Search */}
      <div className="mx-4">
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card)] px-3 py-2.5 shadow-sm">
          <span className="text-[#94a3b8]">{MI.search}</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions…"
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[#94a3b8] outline-none"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="mx-4 mt-2 flex flex-wrap gap-1.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChip(c)}
            className={mcls(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              chip === c ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] text-[#94a3b8] border border-[rgba(15,23,42,0.08)]',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <MSectionLabel>{filtered.length} transactions</MSectionLabel>
      <div className="mx-4 space-y-2">
        {filtered.map((entry) => (
          <MCard key={entry.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94a3b8]">{entry.date}</span>
                  <MBadge tone={toneFor(entry.tone)}>{entry.chip}</MBadge>
                </div>
                <div className="mt-0.5 text-sm font-medium text-[var(--text)] truncate">{entry.desc}</div>
              </div>
              <div className={mcls('text-sm font-semibold tabular-nums', entry.amount < 0 ? 'text-[#e11d48]' : 'text-[var(--text)]')}>
                {mFmtUSD(entry.amount)}
              </div>
            </div>
          </MCard>
        ))}
      </div>
    </div>
  );
}
