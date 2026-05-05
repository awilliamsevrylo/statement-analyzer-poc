'use client';

// src/components/tabs/AuditTab.tsx
// Audit trail tab with filtering and expandable rows.

import { useMemo, useState } from 'react';
import { cls, Card, Badge, Btn, I, fmtUSD, fmtDate } from '@/components/UI';
import { transactions, dispositionLabels } from '@/data/borrower';
import type { Disposition } from '@/data/borrower';

const CHIP_FILTERS: { label: string; match: (d: Disposition) => boolean }[] = [
  { label: 'All', match: () => true },
  { label: 'Large deposits', match: (d) => d.startsWith('LARGE_DEPOSIT') },
  { label: 'Undisclosed debt', match: (d) => d === 'UNDISCLOSED_DEBT_MATCH' },
  { label: 'Filtered', match: (d) => d === 'FILTERED_DEBIT' },
  { label: 'Eligible income', match: (d) => d === 'ELIGIBLE_W2' },
];

export default function AuditTab() {
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const chip = CHIP_FILTERS[activeChip];
    return transactions.filter((tx) => {
      const matchesChip = chip.match(tx.disposition);
      const matchesSearch =
        !search ||
        tx.desc.toLowerCase().includes(search.toLowerCase()) ||
        tx.account.toLowerCase().includes(search.toLowerCase()) ||
        tx.date.includes(search);
      return matchesChip && matchesSearch;
    });
  }, [search, activeChip]);

  const credits = filtered.filter((t) => t.type === 'CREDIT').length;
  const debits = filtered.filter((t) => t.type === 'DEBIT').length;
  const flagged = filtered.filter((t) => t.severity).length;
  const excluded = filtered.filter((t) => t.disposition === 'FILTERED_DEBIT').length;

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              {I.search}
            </span>
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {I.x}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CHIP_FILTERS.map((chip, i) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setActiveChip(i)}
                className={cls(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  activeChip === i
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <Btn variant="ghost" className="ml-auto h-8 text-xs">
            {I.download}
            Export CSV
          </Btn>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Disposition</th>
                <th className="px-4 py-3">Reason code</th>
                <th className="px-4 py-3 text-center">Expand</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const isExpanded = !!expanded[tx.id];
                const amountColor = tx.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900';
                const sign = tx.type === 'CREDIT' ? '+' : '';
                return (
                  <>
                    <tr
                      key={tx.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/40 cursor-pointer"
                      onClick={() => toggleExpand(tx.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{fmtDate(tx.date)}</td>
                      <td className="px-4 py-3 text-slate-900">{tx.desc}</td>
                      <td className={cls('px-4 py-3 tabular-nums font-medium whitespace-nowrap', amountColor)}>
                        {sign}{fmtUSD(tx.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={getDispositionTone(tx.disposition)}>
                          {dispositionLabels[tx.disposition]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[280px] truncate">{tx.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          className={cls(
                            'inline-flex items-center justify-center rounded-md p-1 transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                        >
                          {I.chevronDown}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-slate-100 bg-slate-50/40">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</div>
                              <div className="mt-1 text-sm font-medium text-slate-900">{tx.account}</div>
                              <div className="text-xs text-slate-500">{tx.type}</div>
                              {tx.matched_to && (
                                <div className="mt-1 text-xs text-slate-500">Matched to: {tx.matched_to}</div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disposition</div>
                              <div className="mt-1 text-sm font-medium text-slate-900">{dispositionLabels[tx.disposition]}</div>
                              <div className="text-xs text-slate-500">{tx.disposition}</div>
                              {tx.trigger && (
                                <div className="mt-1">
                                  <Badge tone="warning">Trigger: {tx.trigger}</Badge>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</div>
                              <div className="mt-1 text-sm text-slate-700">{tx.reason}</div>
                              <div className="mt-2 flex gap-2">
                                <Btn variant="secondary" className="h-7 px-2 text-xs">
                                  Override classification
                                </Btn>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No transactions match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-500">
          <div>
            Showing {filtered.length} of {transactions.length} transactions · Credits: {credits} · Debits: {debits}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
              Flagged: {flagged}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
              Excluded: {excluded}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getDispositionTone(d: Disposition) {
  switch (d) {
    case 'ELIGIBLE_W2':
      return 'success' as const;
    case 'INTERNAL_TRANSFER':
      return 'info' as const;
    case 'TRANSFER_FROM_UNRECOGNIZED':
      return 'critical' as const;
    case 'LARGE_DEPOSIT_ABOVE_INCOME':
      return 'warning' as const;
    case 'LARGE_DEPOSIT_BELOW_THRESHOLD':
      return 'neutral' as const;
    case 'UNDISCLOSED_DEBT_MATCH':
      return 'critical' as const;
    case 'FILTERED_DEBIT':
      return 'neutral' as const;
    case 'EARNEST_MONEY':
      return 'primary' as const;
    default:
      return 'neutral' as const;
  }
}