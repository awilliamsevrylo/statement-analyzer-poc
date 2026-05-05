// src/components/tabs/CoverageTab.tsx
// Statement coverage tab with account cards and closing date check.

import { useState } from 'react';
import { cls, Card, Badge, Btn, I, fmtUSD } from '@/components/UI';
import { accounts, missingMonths, borrower } from '@/data/borrower';

const MONTH_KEYS = [
  '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
];

const MONTH_LABELS: Record<string, string> = {
  '2025-09': 'Sep', '2025-10': 'Oct', '2025-11': 'Nov', '2025-12': 'Dec',
  '2026-01': 'Jan', '2026-02': 'Feb', '2026-03': 'Mar', '2026-04': 'Apr',
};

// Simplified: check if the account is the one with missing months
function isMissingForAccount(accountId: string, month: string): boolean {
  const accountName = accounts.find((a) => a.id === accountId)?.bank ?? '';
  const missing = missingMonths.find(
    (m) =>
      m.account.includes(accountName) &&
      m.month.toLowerCase().includes(MONTH_LABELS[month]?.toLowerCase() ?? month),
  );
  return !!missing;
}

export default function CoverageTab() {
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      {/* Statement coverage */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Statement coverage</h3>
          <Badge tone="warning">1 gap</Badge>
        </div>

        <div className="mt-4 space-y-4">
          {accounts.map((acct) => {
            const isMissing = acct.missing;
            const hasRequested = requested[acct.id];
            return (
              <div
                key={acct.id}
                className={cls(
                  'rounded-xl border p-4 transition-colors',
                  isMissing ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-white',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cls(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isMissing ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600',
                    )}>
                      {I.bank}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {acct.bank} ****{acct.last4}
                      </div>
                      <div className="text-xs text-slate-500">{acct.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {acct.statements} statements
                    </div>
                    <div className="text-xs text-slate-500">
                      {acct.balance !== null ? `Balance ${fmtUSD(acct.balance)}` : 'No balance data'}
                    </div>
                  </div>
                </div>

                {/* Coverage strip */}
                {!isMissing && (
                  <div className="mt-3 flex items-center gap-2">
                    {MONTH_KEYS.map((m) => {
                      const missingHere = isMissingForAccount(acct.id, m);
                      return (
                        <div key={m} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className={cls(
                              'h-6 w-full rounded-md',
                              missingHere ? 'bg-rose-200' : 'bg-emerald-200',
                            )}
                            title={missingHere ? `Missing: ${MONTH_LABELS[m]} 2025` : `${MONTH_LABELS[m]} — OK`}
                          />
                          <span className="text-[10px] text-slate-400">{MONTH_LABELS[m]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isMissing && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm text-rose-700">No statements provided</span>
                    <Btn
                      variant="secondary"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setRequested((prev) => ({ ...prev, [acct.id]: true }))}
                    >
                      {hasRequested ? (
                        <>
                          {I.check}
                          Requested
                        </>
                      ) : (
                        <>
                          {I.mail}
                          Request statements
                        </>
                      )}
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Closing date check */}
      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Closing date check</h3>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-600">
              {I.alert}
            </div>
            <div>
              <div className="text-sm font-medium text-amber-900">
                May statement refresh needed
              </div>
              <div className="mt-0.5 text-xs text-amber-800">
                Estimated close date is {borrower.est_close_date}. The most recent statements cover April 2026. 
                Request May statements after {borrower.est_close_date} to ensure full coverage up to closing.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
