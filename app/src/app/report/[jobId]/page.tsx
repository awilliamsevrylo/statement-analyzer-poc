'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Btn, Badge, SeverityBadge, ConfidenceBar, fmtUSD, fmtDate, fmtLongDate } from '@/components/UI';
import type { Severity } from '@/components/UI';
import { dashboardFiles } from '@/data/dashboard';
import {
  borrower, accounts, months, missingMonths,
  largeDeposits, undisclosedDebts,
} from '@/data/borrower';

function PageShell({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm"
      style={{ aspectRatio: '8.5 / 11' }}
    >
      <div className="flex h-full flex-col p-8">
        <div className="mb-5 flex items-baseline justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <span className="text-xs text-slate-400">Page {num}</span>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function SourceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'UNSOURCED': return <Badge tone="critical">Unsourced</Badge>;
    case 'PENDING_LETTER': return <Badge tone="warning">Letter needed</Badge>;
    case 'AUTO_SOURCED': return <Badge tone="success">Auto-sourced</Badge>;
    case 'BELOW_THRESHOLD': return <Badge tone="neutral">Below threshold</Badge>;
    default: return <Badge tone="neutral">{status}</Badge>;
  }
}

export default function ReportViewerPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId;
  const file = dashboardFiles.find((f) => f.id === jobId);

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // eslint-disable-next-line no-console
    console.log('Download PDF triggered for', jobId);
  };

  if (!file) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-slate-100">
        <div className="text-sm text-slate-500">Report not found.</div>
        <Link href="/" className="text-sm font-medium text-[#eb7230] hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-7 py-3.5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-slate-900">
            Report · Job {jobId ?? '—'}
          </h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            5 pages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={handlePrint}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" rx="2" />
            </svg>
            Print
          </Btn>
          <Btn variant="primary" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download PDF
          </Btn>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto max-w-3xl space-y-4">

          <PageShell num={1} title="Cover Sheet">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Borrower</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{borrower.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {([
                  ['Loan number', borrower.loan_number],
                  ['Loan type', borrower.loan_type],
                  ['Loan amount', fmtUSD(borrower.loan_amount, { decimals: 0 })],
                  ['Est. close date', fmtLongDate(borrower.est_close_date)],
                  ['MLO', borrower.mlo],
                  ['Brokerage', borrower.brokerage],
                  ['AUS result', borrower.aus_result],
                  ['Monthly gross income', fmtUSD(borrower.monthly_gross_income, { decimals: 0 })],
                ] as [string, string][]).map(([key, val]) => (
                  <div key={key}>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</div>
                    <div className="mt-0.5 text-sm font-medium text-slate-900">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </PageShell>

          <PageShell num={2} title="Income Analysis">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Monthly gross income</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{fmtUSD(borrower.monthly_gross_income, { decimals: 0 })}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Qualifying income</div>
                  <div className="mt-1 text-xl font-semibold text-emerald-700">{fmtUSD(borrower.monthly_gross_income, { decimals: 0 })}</div>
                  <div className="text-xs text-slate-500">12-mo avg · stable</div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Monthly breakdown</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="pb-2 pr-4">Month</th>
                      <th className="pb-2 pr-4 text-right">Deposits</th>
                      <th className="pb-2 pr-4 text-right">Withdrawals</th>
                      <th className="pb-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...months].reverse().map((m) => (
                      <tr key={m.key}>
                        <td className="py-1.5 pr-4 text-slate-700">{m.label}</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-emerald-700">{fmtUSD(m.deposits, { decimals: 0 })}</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-rose-700">{fmtUSD(m.withdrawals, { decimals: 0 })}</td>
                        <td className={`py-1.5 text-right font-mono font-medium ${m.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {fmtUSD(m.net, { decimals: 0, sign: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PageShell>

          <PageShell num={3} title="Deposit Findings">
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Threshold: {fmtUSD(borrower.monthly_gross_income * (borrower.large_deposit_threshold_pct / 100), { decimals: 0 })} (50% of monthly gross)
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Description</th>
                    <th className="pb-2 pr-3 text-right">Amount</th>
                    <th className="pb-2 pr-3">Severity</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {largeDeposits.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 pr-3 text-slate-600">{fmtDate(d.date)}</td>
                      <td className="py-2 pr-3 text-slate-800">{d.desc}</td>
                      <td className="py-2 pr-3 text-right font-mono font-medium text-emerald-700">{fmtUSD(d.amount, { decimals: 0 })}</td>
                      <td className="py-2 pr-3"><SeverityBadge severity={d.severity as Severity} /></td>
                      <td className="py-2"><SourceStatusBadge status={d.source_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageShell>

          <PageShell num={4} title="Debt Findings">
            <div className="space-y-3">
              <div className="text-xs text-slate-500">Undisclosed recurring payment patterns detected via trigger-word matching.</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Payee</th>
                    <th className="pb-2 pr-3 text-right">Monthly</th>
                    <th className="pb-2 pr-3 text-right">Occurrences</th>
                    <th className="pb-2 pr-3">Confidence</th>
                    <th className="pb-2">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {undisclosedDebts.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 pr-3 font-medium text-slate-800">{d.payee}</td>
                      <td className="py-2 pr-3 text-right font-mono text-slate-700">{fmtUSD(d.monthly)}</td>
                      <td className="py-2 pr-3 text-right text-slate-600">{d.occurrences}</td>
                      <td className="py-2 pr-3 w-28">
                        <div className="flex items-center gap-2">
                          <ConfidenceBar value={d.confidence} />
                          <span className="text-xs text-slate-500 tabular-nums">{d.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <Badge tone={d.type === 'RENT' ? 'rent' : 'neutral'}>{d.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageShell>

          <PageShell num={5} title="Coverage Audit">
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Accounts</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="pb-2 pr-3">Bank</th>
                      <th className="pb-2 pr-3">Last 4</th>
                      <th className="pb-2 pr-3">Type</th>
                      <th className="pb-2 text-right">Statements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2 pr-3 font-medium text-slate-800">{a.bank}</td>
                        <td className="py-2 pr-3 font-mono text-slate-700">****{a.last4}</td>
                        <td className="py-2 pr-3 text-slate-600">{a.type}</td>
                        <td className="py-2 text-right">
                          {a.missing
                            ? <Badge tone="critical">Missing</Badge>
                            : <Badge tone="success">{a.statements} months</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {missingMonths.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Statement gaps</div>
                  <div className="space-y-2">
                    {missingMonths.map((m, i) => (
                      <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                        <span className="font-medium text-amber-900">{m.month}</span>
                        <span className="mx-1 text-amber-600">·</span>
                        <span className="text-amber-800">{m.account}</span>
                        <div className="mt-0.5 text-xs text-amber-700">{m.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PageShell>

        </div>
      </div>
    </div>
  );
}
