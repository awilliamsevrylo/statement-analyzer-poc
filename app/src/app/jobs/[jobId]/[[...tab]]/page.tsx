'use client';

import { Suspense, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  cls, fmtUSD, fmtDate, fmtLongDate,
  Badge, SeverityBadge, Card, Btn, I,
} from '@/components/UI';
import Layout from '@/components/Layout';
import SideNav from '@/components/SideNav';
import type { Severity } from '@/components/UI';
import UndisclosedTab from '@/components/tabs/UndisclosedTab';
import AuditTab from '@/components/tabs/AuditTab';
import CoverageTab from '@/components/tabs/CoverageTab';
import EmailModal, { type EmailTemplate, type DepositContext } from '@/components/modals/EmailModal';
import {
  borrower, accounts, months, missingMonths,
  transactions, sourcingChains, largeDeposits,
  dispositionLabels,
} from '@/data/borrower';
import type { Transaction, SourcingChain } from '@/data/borrower';

/* ── BorrowerHeader ─────────────────────────────────────────────────────────── */

function BorrowerHeader({ onEmailBorrower }: { onEmailBorrower?: () => void }) {
  return (
    <div className="border-b border-slate-200 bg-white px-7 py-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">{borrower.name}</h1>
            <Badge tone="success">AUS {borrower.aus_result}</Badge>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-mono text-slate-700">{borrower.loan_number}</span>
            <span>·</span>
            <span>{borrower.loan_type}</span>
            <span>·</span>
            <span className="font-mono">{fmtUSD(borrower.loan_amount, { decimals: 0 })}</span>
            <span>·</span>
            <span>Est. close {fmtLongDate(borrower.est_close_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" className="text-sm">
            {I.download} Export UW packet
          </Btn>
          <Btn variant="primary" className="text-sm" onClick={onEmailBorrower}>
            {I.mail} Email borrower
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── SummaryTab ─────────────────────────────────────────────────────────────── */

export function SummaryTab({
  showBanner = true,
  onRequestStatement,
  onDismissBanner,
  onJumpToAudit,
}: {
  showBanner?: boolean;
  onRequestStatement?: () => void;
  onDismissBanner?: () => void;
  onJumpToAudit?: () => void;
}) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthlyTx = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => b.day - a.day);
    }
    return map;
  }, []);

  const totalFlags = months.reduce(
    (acc, m) => acc + m.flags.critical + m.flags.warning + m.flags.info,
    0,
  );

  const reversedMonths = useMemo(() => [...months].reverse(), []);
  return (
    <div className="space-y-4">
      {showBanner && missingMonths.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-600">{I.alert}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900">
                Statement gap detected
              </div>
              <div className="mt-0.5 text-sm text-amber-800">
                {missingMonths[0].month} — {missingMonths[0].reason} ({missingMonths[0].account})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="secondary" className="text-xs" onClick={onRequestStatement}>Request from borrower</Btn>
              <Btn variant="ghost" className="text-xs" onClick={onDismissBanner}>I&rsquo;ll handle it</Btn>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Qualifying income / mo</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{fmtUSD(borrower.monthly_gross_income, { decimals: 0 })}</div>
          <div className="mt-0.5 text-xs text-emerald-600">12-mo avg · stable</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Large deposit threshold</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{fmtUSD(borrower.monthly_gross_income * (borrower.large_deposit_threshold_pct / 100), { decimals: 0 })}</div>
          <div className="mt-0.5 text-xs text-slate-500">50% of monthly gross</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Items needing action</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{totalFlags}</div>
          <div className="mt-0.5 text-xs text-rose-600">
            {months.reduce((a, m) => a + m.flags.critical, 0)} critical · {months.reduce((a, m) => a + m.flags.warning, 0)} warning · {months.reduce((a, m) => a + m.flags.info, 0)} info
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Statements covered</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{accounts.filter(a => !a.missing).length} of {accounts.length}</div>
          <div className="mt-0.5 text-xs text-amber-600">1 account missing statements</div>
        </Card>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Monthly summary</div>
        <div className="mb-2 text-xs text-slate-500">Click a month to drill into transactions</div>
        <div className="grid grid-cols-2 gap-3">
          {reversedMonths.map((m) => {
          const isExpanded = expandedMonth === m.key;
          const txs = monthlyTx[m.key] || [];
          return (
            <Card
              key={m.key}
              className={cls('cursor-pointer transition-colors hover:border-slate-300', isExpanded && 'border-slate-300')}
            >
              <div className="p-4" onClick={() => setExpandedMonth(isExpanded ? null : m.key)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{m.label}</span>
                    <div className="flex items-center gap-1">
                      {m.flags.critical > 0 && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-100 px-1.5 text-[10px] font-semibold text-rose-700">
                            {m.flags.critical} critical
                          </span>
                      )}
                      {m.flags.warning > 0 && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-700">
                            {m.flags.warning} warning
                          </span>
                      )}
                      {m.flags.info > 0 && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-700">
                            {m.flags.info} info
                          </span>
                      )}
                    </div>
                  </div>
                  <span className={cls('text-slate-400 transition-transform', isExpanded && 'rotate-180')}>
                    {I.chevronDown}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Deposits</div>
                    <div className="font-medium text-emerald-700">{fmtUSD(m.deposits, { decimals: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Withdrawals</div>
                    <div className="font-medium text-rose-700">{fmtUSD(m.withdrawals, { decimals: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Net</div>
                    <div className={cls('font-medium', m.net >= 0 ? 'text-emerald-700' : 'text-rose-700')}>
                      {fmtUSD(m.net, { decimals: 0, sign: true })}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <div className="space-y-2">
                    {txs.map((t) => {
                      const sev = t.severity;
                      const borderColor = sev === 'critical' ? 'border-l-rose-500' : sev === 'warning' ? 'border-l-amber-500' : 'border-l-transparent';
                      return (
                        <div
                          key={t.id}
                          className={cls('flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm border-l-4', borderColor)}
                        >
                          <span className="w-16 shrink-0 text-xs text-slate-500">{fmtDate(t.date)}</span>
                          <span className="flex-1 truncate text-slate-700">{t.desc}</span>
                          <span className="w-24 shrink-0 text-right font-mono font-medium text-emerald-700">
                            {fmtUSD(t.amount, { decimals: 0, sign: t.type === 'CREDIT' })}
                          </span>
                          <Badge tone={dispositionLabels[t.disposition] ? 'neutral' : 'neutral'} className="shrink-0">
                            {dispositionLabels[t.disposition]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#eb7230]">
                    <button type="button" className="hover:underline" onClick={onJumpToAudit}>View in audit trail</button>
                    <span>{I.arrowRight}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
      </div>
  );
}

/* ── SourcingTab ────────────────────────────────────────────────────────────── */

function ChainStatusBadge({ status }: { status: SourcingChain['status'] }) {
  if (status === 'unsourced') return <SeverityBadge severity="critical" />;
  if (status === 'pending-letter') return <SeverityBadge severity="warning" />;
  return <SeverityBadge severity="pass" />;
}

function ChainNodeDot({ sourced }: { sourced: boolean }) {
  return (
    <span
      className={cls(
        'inline-block h-2.5 w-2.5 rounded-full ring-2',
        sourced
          ? 'bg-emerald-500 ring-emerald-200'
          : 'bg-rose-500 ring-rose-200',
      )}
    />
  );
}

export function SourcingTab({
  onEmailBorrower,
  onExportTrail,
}: {
  onEmailBorrower?: (ctx: DepositContext) => void;
  onExportTrail?: (chain: SourcingChain) => void;
}) {
  const searchParams = useSearchParams();
  const chainParam = searchParams?.get('chain') ?? null;
  const [activeChainId, setActiveChainId] = useState<string>(
    (chainParam && sourcingChains.find((c) => c.id === chainParam)) ? chainParam : sourcingChains[0].id,
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const activeChain = sourcingChains.find((c) => c.id === activeChainId)!;

  function toggleEvidence(chainId: string, nodeIdx: number) {
    const key = `${chainId}-${nodeIdx}`;
    setExpandedNodes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-orange-600">{I.branch}</span>
          <div>
            <div className="text-sm font-semibold text-orange-900">Source-of-funds tracer</div>
            <div className="mt-0.5 text-sm text-orange-800">
              Trace each large deposit back to its origin. Sourced nodes are green; unknown nodes need action.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-5">
        <div className="space-y-3">
          {sourcingChains.map((chain) => {
            const isActive = chain.id === activeChainId;
            return (
              <Card
                key={chain.id}
                className={cls(
                  'cursor-pointer p-4 transition-all',
                  isActive && 'ring-1 ring-orange-300',
                )}
                onClick={() => setActiveChainId(chain.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{chain.title}</span>
                  <ChainStatusBadge status={chain.status} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {chain.target_account} · {fmtLongDate(chain.target_date)}
                </div>
                <div className="mt-1 text-xs font-mono text-slate-600">
                  {fmtUSD(chain.target_amount)}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{activeChain.title}</h3>
              <div className="mt-1 text-sm text-slate-500">
                {activeChain.target_account} · {fmtLongDate(activeChain.target_date)} · {fmtUSD(activeChain.target_amount)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="secondary" className="text-xs" onClick={() => onEmailBorrower?.({ amount: activeChain.target_amount, date: fmtDate(activeChain.target_date), desc: activeChain.title, account: activeChain.target_account })}>{I.mail} Email borrower</Btn>
              <Btn variant="ghost" className="text-xs" onClick={() => onExportTrail?.(activeChain)}>{I.download} Export trail</Btn>
            </div>
          </div>

          <div className="relative mt-6 pl-4">
            <div className="absolute left-[21px] top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-6">
              {activeChain.nodes.map((node, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="relative z-10 mt-1">
                    <ChainNodeDot sourced={node.sourced} />
                  </div>
                  <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{node.label}</span>
                      {node.amount !== undefined && (
                        <span className="font-mono text-sm font-medium text-slate-700">{fmtUSD(node.amount)}</span>
                      )}
                    </div>
                    {node.account && (
                      <div className="mt-0.5 text-xs text-slate-500">{node.account} {node.date && `· ${fmtDate(node.date)}`}</div>
                    )}
                    {node.evidence && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => toggleEvidence(activeChain.id, idx)}
                          className="text-xs font-medium text-[#eb7230] hover:underline"
                        >
                          {expandedNodes[`${activeChain.id}-${idx}`] ? 'Hide evidence' : 'View evidence'}
                        </button>
                        {expandedNodes[`${activeChain.id}-${idx}`] && (
                          <div className="mt-1 text-xs text-emerald-700">
                            <span className="font-semibold">Evidence:</span> {node.evidence}
                          </div>
                        )}
                      </div>
                    )}
                    {node.note && (
                      <div className="mt-2 text-xs text-slate-500 italic">{node.note}</div>
                    )}
                    {node.action && (
                      <div className="mt-3 flex items-center gap-2">
                        <Btn variant="primary" className="text-xs">{I.mail} {node.action}</Btn>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── LargeDepositsTab ─────────────────────────────────────────────────────── */

function SourceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'UNSOURCED':
      return <Badge tone="critical">Unsourced</Badge>;
    case 'PENDING_LETTER':
      return <Badge tone="warning">Letter needed</Badge>;
    case 'AUTO_SOURCED':
      return <Badge tone="success">Auto-sourced</Badge>;
    case 'BELOW_THRESHOLD':
      return <Badge tone="neutral">Below threshold</Badge>;
    default:
      return <Badge tone="neutral">{status}</Badge>;
  }
}

export function LargeDepositsTab({ onEmail }: { onEmail?: (template: EmailTemplate, ctx?: DepositContext) => void }) {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId;
  const [waivedIds, setWaivedIds] = useState<Set<string>>(new Set());
  const threshold = borrower.monthly_gross_income * (borrower.large_deposit_threshold_pct / 100);
  const bySeverity = {
    critical: largeDeposits.filter((d) => d.severity === 'critical').length,
    warning: largeDeposits.filter((d) => d.severity === 'warning').length,
    info: largeDeposits.filter((d) => d.severity === 'info').length,
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly gross</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{fmtUSD(borrower.monthly_gross_income, { decimals: 0 })}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Threshold (50%)</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{fmtUSD(threshold, { decimals: 0 })}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total flagged</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{largeDeposits.length}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">By severity</div>
            <div className="mt-1 flex items-center gap-2">
              {bySeverity.critical > 0 && <Badge tone="critical">{bySeverity.critical} Critical</Badge>}
              {bySeverity.warning > 0 && <Badge tone="warning">{bySeverity.warning} Warning</Badge>}
              {bySeverity.info > 0 && <Badge tone="info">{bySeverity.info} Info</Badge>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Source Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {largeDeposits.map((d) => {
              const isWaived = waivedIds.has(d.id);
              return (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 text-slate-600">{fmtDate(d.date)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{d.desc}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{d.note}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">{fmtUSD(d.amount, { decimals: 0 })}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={d.severity as Severity} />
                  </td>
                  <td className="px-4 py-3">
                    <SourceStatusBadge status={d.source_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isWaived ? (
                        <Badge tone="success">Waived</Badge>
                      ) : (
                        <>
                          {d.source_status === 'UNSOURCED' && (
                            <>
                              <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => onEmail?.('sourcing', { amount: d.amount, date: fmtDate(d.date), desc: d.desc, account: d.account })}>{I.mail}</Btn>
                              <Btn variant="primary" className="h-7 px-2 text-xs" onClick={() => router.push(`/jobs/${jobId}/sourcing${d.chain_id ? `?chain=${d.chain_id}` : ''}`)}>{I.branch} Trace</Btn>
                            </>
                          )}
                          {d.source_status === 'PENDING_LETTER' && (
                            <Btn variant="primary" className="h-7 px-2 text-xs" onClick={() => onEmail?.('gift-letter')}>{I.mail} Request letter</Btn>
                          )}
                          {d.source_status === 'AUTO_SOURCED' && (
                            <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => router.push(`/jobs/${jobId}/sourcing${d.chain_id ? `?chain=${d.chain_id}` : ''}`)}>{I.link} View trail</Btn>
                          )}
                          {d.source_status === 'BELOW_THRESHOLD' && (
                            <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setWaivedIds((prev) => new Set(prev).add(d.id))}>{I.x} Waive</Btn>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── Workbench main page ──────────────────────────────────────────────────── */

type TabId = 'summary' | 'sourcing' | 'large-deposits' | 'undisclosed' | 'audit' | 'coverage';

export default function WorkbenchPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-slate-50" />}>
      <WorkbenchContent />
    </Suspense>
  );
}

function WorkbenchContent() {
  const params = useParams<{ jobId: string; tab?: string[] }>();
  const router = useRouter();
  const jobId = params?.jobId;
  const rawTab = params?.tab?.[0] ?? 'summary';

  const tabMap: Record<string, TabId> = {
    summary: 'summary',
    sourcing: 'sourcing',
    'large-deposits': 'large-deposits',
    deposits: 'large-deposits',
    undisclosed: 'undisclosed',
    audit: 'audit',
    coverage: 'coverage',
  };
  const activeTab: TabId = tabMap[rawTab] || 'summary';

  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>('missing-statement');
  const [emailDepositContext, setEmailDepositContext] = useState<DepositContext | undefined>(undefined);

  function openEmail(template: EmailTemplate, ctx?: DepositContext) {
    setEmailTemplate(template);
    setEmailDepositContext(ctx);
    setShowEmail(true);
  }

  return (
    <Layout
      sidebar={<SideNav activeTab={rawTab === 'large-deposits' ? 'deposits' : rawTab || 'summary'} />}
      main={
        <div className="flex flex-col">
          <BorrowerHeader onEmailBorrower={() => openEmail('sourcing')} />
          <div className="px-7 py-5">
            {activeTab === 'summary' && (
              <SummaryTab
                showBanner={!dismissedBanner}
                onRequestStatement={() => openEmail('request-statements')}
                onDismissBanner={() => setDismissedBanner(true)}
                onJumpToAudit={() => router.push(`/jobs/${jobId ?? ''}/audit`)}
              />
            )}
            {activeTab === 'sourcing' && (
              <SourcingTab
                onEmailBorrower={(ctx) => openEmail('sourcing', ctx)}
                onExportTrail={(chain) => {
                  const blob = new Blob([JSON.stringify(chain, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${chain.id}-trail.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            )}
            {activeTab === 'large-deposits' && <LargeDepositsTab onEmail={openEmail} />}
            {activeTab === 'undisclosed' && <UndisclosedTab />}
            {activeTab === 'audit' && <AuditTab />}
            {activeTab === 'coverage' && <CoverageTab />}
          </div>
          {showEmail && (
            <EmailModal template={emailTemplate} depositContext={emailDepositContext} onClose={() => setShowEmail(false)} />
          )}
        </div>
      }
    />
  );
}
