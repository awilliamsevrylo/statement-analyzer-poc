'use client';

import { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cls, Btn } from '@/components/UI';
import { dashboardFiles, STATUS_META } from '@/data/dashboard';
import { useAppContext } from '@/app/_components/AppContext';

const FILTERS = ['All', 'Processing', 'Needs review', 'Completed', 'Failed'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_MAP: Record<Filter, string | null> = {
  'All': null,
  'Processing': 'processing',
  'Needs review': 'needs-action',
  'Completed': 'completed',
  'Failed': 'failed',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-slate-50" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') ?? '';
  const { openNewAnalysis } = useAppContext();

  const filtered = useMemo(() => {
    const target = FILTER_MAP[activeFilter];
    let list = target ? dashboardFiles.filter((f) => f.status === target) : dashboardFiles;
    if (q) {
      list = list.filter((f) => f.borrower.toLowerCase().includes(q.toLowerCase()));
    }
    return list;
  }, [activeFilter, q]);

  const stats = useMemo(() => [
    { label: 'Total borrowers', value: filtered.length },
    { label: 'Processing', value: filtered.filter((f) => f.status === 'processing').length },
    { label: 'Completed', value: filtered.filter((f) => f.status === 'completed').length },
    { label: 'Failed', value: filtered.filter((f) => f.status === 'failed').length },
  ], [filtered]);

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-7 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Evrylo</div>
            <h1 className="mt-0.5 text-xl font-semibold text-slate-900">All borrowers</h1>
          </div>
          <Btn variant="primary" onClick={openNewAnalysis}>New analysis</Btn>
        </div>
      </div>

      <div className="px-7 py-5">
        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex flex-wrap gap-1">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={cls(
                  'h-8 rounded-lg px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* File table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Loan type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    {q ? (
                      <>No borrowers match &ldquo;<span className="font-medium">{q}</span>&rdquo;.</>
                    ) : (
                      'No borrowers.'
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((file) => {
                const meta = STATUS_META[file.status];
                return (
                  <tr
                    key={file.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/40"
                    onClick={() => router.push(`/jobs/${file.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {file.borrower.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{file.borrower}</div>
                          <div className="text-xs text-slate-500">{file.loan_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{file.loan_type}</div>
                      <div className="text-xs text-slate-500">{file.workflow}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: meta.dot }}
                        />
                        <span className={cls('text-sm font-medium', meta.text)}>
                          {meta.label}
                        </span>
                      </div>
                      {file.flags && (
                        <div className="mt-1 flex gap-1">
                          {file.flags.critical > 0 && (
                            <span className="text-xs text-rose-600">{file.flags.critical} critical</span>
                          )}
                          {file.flags.warning > 0 && (
                            <span className="text-xs text-amber-600">{file.flags.warning} warning</span>
                          )}
                          {file.flags.info > 0 && (
                            <span className="text-xs text-sky-600">{file.flags.info} info</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">
                        {new Date(file.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500">{file.note}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#eb7230] hover:text-[#d96526]"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (file.primary_target === 'file') {
                            router.push(`/jobs/${file.id}`);
                          } else if (file.primary_target === 'report') {
                            router.push(`/report/${file.id}`);
                          } else if (file.primary_target === 'processing') {
                            router.push(`/processing/${file.id}`);
                          } else if (file.primary_target === 'failed') {
                            openNewAnalysis();
                          }
                        }}
                      >
                        {file.primary_action}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
