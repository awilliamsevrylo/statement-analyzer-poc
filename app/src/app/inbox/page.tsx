'use client';

import { useMemo, useState } from 'react';
import { cls, Card, Badge } from '@/components/UI';
import ThreadView from '@/components/inbox/ThreadView';
import { threads, unresolvedDecisionCount, loanEmailAddress } from '@/data/inbox';

const FILTERS = ['All', 'Needs decision', 'Awaiting borrower'] as const;
type Filter = (typeof FILTERS)[number];

const ghostThreads = [
  { id: 'ghost-1', borrowerName: 'Sloan Whittaker', subject: 'Re: VOE follow-up', preview: 'Pending borrower upload · 2 days', tone: 'awaiting' },
  { id: 'ghost-2', borrowerName: 'Talia Reyes',      subject: 'Income calc',     preview: 'No action needed',                tone: 'idle'     },
];

export default function InboxPage() {
  const [activeId, setActiveId] = useState<string>(threads[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('All');

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [activeId],
  );

  return (
    <div className="grid min-h-[100dvh] grid-cols-[320px_1fr] bg-slate-50">
      {/* Left: thread list */}
      <aside className="border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h1 className="text-base font-semibold text-slate-900">Inbox</h1>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500">{loanEmailAddress}</div>
        </div>
        <div className="flex flex-wrap gap-1 px-3 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cls(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="divide-y divide-slate-100">
          {threads.map((t) => {
            const open = unresolvedDecisionCount(t);
            const isActive = t.id === activeId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cls(
                    'flex w-full flex-col items-start gap-1 px-5 py-3 text-left transition-colors hover:bg-slate-50',
                    isActive && 'bg-orange-50/60',
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-900">{t.borrowerName}</span>
                    {open > 0 && <Badge tone="critical" className="ml-auto">{open} decision{open === 1 ? '' : 's'}</Badge>}
                  </div>
                  <div className="text-[12px] text-slate-600 line-clamp-1">{t.subject}</div>
                  <div className="font-mono text-[10px] text-slate-400">{t.loanNumber}</div>
                </button>
              </li>
            );
          })}
          {ghostThreads.map((g) => (
            <li key={g.id}>
              <div className="flex w-full flex-col items-start gap-1 px-5 py-3 text-left opacity-50">
                <div className="text-[13px] font-medium text-slate-700">{g.borrowerName}</div>
                <div className="text-[12px] text-slate-500 line-clamp-1">{g.subject}</div>
                <div className="text-[10px] text-slate-400">{g.preview}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right: thread view */}
      <main className="min-w-0">
        {activeThread ? (
          <div className="mx-auto max-w-3xl px-7 py-6">
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Thread</div>
              <h2 className="text-lg font-semibold text-slate-900">{activeThread.subject}</h2>
              <div className="mt-0.5 text-[12px] text-slate-500">
                {activeThread.borrowerName} · <span className="font-mono">{activeThread.loanNumber}</span>
              </div>
            </div>
            <ThreadView events={activeThread.events} loanNumber={activeThread.loanNumber} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Card className="px-6 py-8 text-center">
              <div className="text-sm text-slate-500">No thread selected.</div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
