// src/components/mobile/HomeScreen.tsx
import { mcls, MCard, MBtn, MBadge, MDot, MAppBar, MSectionLabel, MI, mFmtUSD } from './MobileUI';
import { mBorrower, mFileStats, mActions, mCoverage } from '@/data/mobile';

export default function HomeScreen({ onNav }: { onNav: (screen: string) => void }) {
  const openActions = mActions.filter((a) => !a.resolved);
  const resolvedActions = mActions.filter((a) => a.resolved);

  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      {/* App bar */}
      <MAppBar
        title={
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--accent)] text-[10px] font-bold text-white">E</div>
            <span className="text-sm font-semibold text-[var(--text)]">Evrylo</span>
          </div>
        }
        right={
          <div className="flex items-center gap-3">
            <button type="button" className="text-[var(--text)] opacity-60">{MI.search}</button>
            <button type="button" className="relative text-[var(--text)] opacity-60">
              {MI.bell}
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
            </button>
          </div>
        }
      />

      {/* Borrower hero card */}
      <div className="mx-4">
        <MCard className="relative overflow-hidden border-0 p-0 text-white" onClick={() => onNav('home')}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#334155]" />
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/60">{mBorrower.loan_number}</div>
                <div className="mt-0.5 text-lg font-bold">{mBorrower.name}</div>
                <div className="text-xs text-white/70">{mBorrower.property}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">{mBorrower.initials}</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="text-[10px] text-white/60">Loan amount</div>
                <div className="text-sm font-semibold">{mFmtUSD(mBorrower.loan_amount)}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/60">Income/mo</div>
                <div className="text-sm font-semibold">{mFmtUSD(mBorrower.monthly_gross_income)}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/60">Closes</div>
                <div className="text-sm font-semibold">{mBorrower.est_close}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px]">
              <span className="font-semibold">{openActions.length} items blocking</span>
              <span className="text-white/50">·</span>
              <span className="text-white/70">{mBorrower.days_to_close} days to close</span>
            </div>
          </div>
        </MCard>
      </div>

      {/* What's blocking card */}
      <div className="mx-4 mt-3">
        <MCard onClick={() => onNav('sourcing')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text)]">What's blocking</span>
            <span className="text-xs text-[#94a3b8]">{MI.chevronRight}</span>
          </div>
          <div className="mt-2 text-[44px] font-bold leading-none text-[var(--text)]">
            {mFmtUSD(mFileStats.unsourced_funds)}
          </div>
          <div className="mt-1 text-xs text-[#94a3b8]">unsourced funds</div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div className="bg-[#059669]" style={{ width: '72%' }} />
              <div className="bg-[#f59e0b]" style={{ width: '17%' }} />
              <div className="bg-[#e11d48]" style={{ width: '11%' }} />
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#94a3b8]">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />Sourced 72%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />Pending 17%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" />Unsourced 11%</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <MBtn variant="secondary" size="sm" className="flex-1">{MI.mail} Email borrower</MBtn>
            <MBtn variant="primary" size="sm" className="flex-1" onClick={() => onNav('sourcing')}>{MI.branch} Trail</MBtn>
          </div>
        </MCard>
      </div>

      {/* Stat row */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onNav('debts')}
          className="flex flex-col items-center rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card)] p-3 text-center shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="text-lg font-bold text-[var(--text)]">{mFileStats.undisclosed_debts_count}</div>
          <div className="text-[10px] text-[#94a3b8]">Debts</div>
        </button>
        <button
          type="button"
          onClick={() => onNav('deposits')}
          className="flex flex-col items-center rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card)] p-3 text-center shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="text-lg font-bold text-[var(--text)]">{mFileStats.large_deposits_open}</div>
          <div className="text-[10px] text-[#94a3b8]">Deposits open</div>
        </button>
        <button
          type="button"
          onClick={() => onNav('audit')}
          className="flex flex-col items-center rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card)] p-3 text-center shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="text-lg font-bold text-[var(--text)]">{mFileStats.coverage.months_provided}/{mFileStats.coverage.months_required}</div>
          <div className="text-[10px] text-[#94a3b8]">Coverage</div>
        </button>
      </div>

      {/* Coverage strip */}
      <div className="mx-4 mt-3">
        <MCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text)]">Coverage</span>
            <span className="text-[10px] text-[#94a3b8]">{mFileStats.coverage.gap_label}</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {mCoverage.map((m) => (
              <div key={`${m.m}-${m.y}`} className="flex-1">
                <div
                  className={mcls(
                    'aspect-square rounded-md',
                    m.status === 'ok' && 'bg-[#bbf7d0]',
                    m.status === 'flag' && 'bg-[#fde68a]',
                    m.status === 'critical' && 'bg-[#fecdd3]',
                  )}
                />
                <div className="mt-1 text-center text-[9px] font-medium text-[#94a3b8]">{m.m}</div>
              </div>
            ))}
          </div>
        </MCard>
      </div>

      {/* Action queue */}
      <MSectionLabel>Action queue</MSectionLabel>
      <div className="mx-4 space-y-2">
        {openActions.map((action) => (
          <MCard key={action.id} onClick={() => onNav(action.screen)} className="relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <MDot tone={action.priority === 'critical' ? 'critical' : action.priority === 'warning' ? 'warning' : 'info'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">{action.title}</span>
                  <MBadge tone={action.priority === 'critical' ? 'critical' : action.priority === 'warning' ? 'warning' : 'info'}>{action.badge}</MBadge>
                </div>
                <div className="mt-0.5 text-xs text-[#94a3b8]">{action.sub}</div>
                {action.amount !== undefined && (
                  <div className="mt-1 text-sm font-semibold text-[var(--text)]">{mFmtUSD(action.amount)}</div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <MBtn variant="secondary" size="sm">{MI.mail} {action.cta}</MBtn>
                </div>
              </div>
            </div>
          </MCard>
        ))}
      </div>

      {/* Resolved section */}
      {resolvedActions.length > 0 && (
        <>
          <MSectionLabel>Resolved</MSectionLabel>
          <div className="mx-4 space-y-2">
            {resolvedActions.map((action) => (
              <MCard key={action.id} className="opacity-60">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#bbf7d0] text-[#059669]">{MI.check}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--text)]">{action.title}</div>
                    <div className="text-xs text-[#94a3b8]">{action.sub}</div>
                  </div>
                </div>
              </MCard>
            ))}
          </div>
        </>
      )}

      {/* AI summary card */}
      <div className="mx-4 mt-3">
        <MCard>
          <div className="flex items-center gap-2">
            <div className="text-[var(--accent)]">{MI.sparkle}</div>
            <span className="text-xs font-semibold text-[var(--text)]">AI summary</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
            Marcus has {openActions.length} open items blocking close. The $14,000 unsourced transfer is the highest priority — underwriting will need the source account statements. The $16,000 Zelle from Ryan Chen likely requires a gift letter. 5 undisclosed debt patterns were detected with a combined monthly impact of {mFmtUSD(mFileStats.undisclosed_debts_monthly)}.
          </p>
          <div className="mt-3">
            <MBtn variant="secondary" size="sm">{MI.send} Draft email</MBtn>
          </div>
        </MCard>
      </div>
    </div>
  );
}
