// src/components/tabs/UndisclosedTab.tsx
// Undisclosed debts tab for the workbench.

import { useState } from 'react';
import { cls, Card, Badge, ConfidenceBar, Btn, I, fmtUSD } from '@/components/UI';
import { undisclosedDebts } from '@/data/borrower';

type ActionState = Record<string, 'flagged' | 'dismissed' | null>;

export default function UndisclosedTab() {
  const [actions, setActions] = useState<ActionState>({});

  const totalMonthly = undisclosedDebts.reduce((sum, d) => sum + d.monthly, 0);
  const highConfidence = undisclosedDebts.filter((d) => d.confidence >= 80).length;
  const mediumConfidence = undisclosedDebts.filter((d) => d.confidence >= 60 && d.confidence < 80).length;
  const lowConfidence = undisclosedDebts.filter((d) => d.confidence < 60).length;
  const rentCount = undisclosedDebts.filter((d) => d.type === 'RENT').length;

  function flag(id: string) {
    setActions((prev) => ({ ...prev, [id]: 'flagged' }));
  }

  function dismiss(id: string) {
    setActions((prev) => ({ ...prev, [id]: 'dismissed' }));
  }

  return (
    <div className="space-y-3">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-semibold text-slate-900">{undisclosedDebts.length}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">Candidates found</div>
          <div className="mt-1 text-xs text-slate-400">
            {highConfidence} high confidence · {mediumConfidence} medium · {lowConfidence} low
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-semibold text-rose-700">{fmtUSD(totalMonthly)}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">Est. monthly undisclosed</div>
          <div className="mt-1 text-xs text-slate-400">Adds to DTI calculation</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-semibold text-blue-700">{rentCount}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">Rent patterns</div>
          <div className="mt-1 text-xs text-slate-400">Contradicts 1003 housing declaration</div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Payee</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">Occur.</th>
                <th className="px-4 py-3">First seen</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {undisclosedDebts.map((debt) => {
                const state = actions[debt.id];
                const isRent = debt.type === 'RENT';
                return (
                  <tr
                    key={debt.id}
                    className={cls(
                      'border-b border-slate-100 transition-colors hover:bg-slate-50/40',
                      isRent && 'bg-blue-50/30',
                      state === 'dismissed' && 'opacity-40',
                    )}
                  >
                    {/* Payee */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-slate-900">{debt.payee}</div>
                      <div className="mt-1 max-w-[260px] text-xs text-slate-500">{debt.note}</div>
                      {debt.trigger_match && (
                        <Badge tone="warning" className="mt-1.5">
                          Trigger: {debt.trigger_match}
                        </Badge>
                      )}
                    </td>
                    {/* Monthly */}
                    <td className="px-4 py-3 align-top tabular-nums font-medium text-slate-900">
                      {fmtUSD(debt.monthly)}
                    </td>
                    {/* Occurrences */}
                    <td className="px-4 py-3 align-top tabular-nums text-slate-700">
                      {debt.occurrences}
                    </td>
                    {/* First seen */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      {debt.first_seen}
                    </td>
                    {/* Confidence */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-xs font-medium text-slate-600">{debt.confidence}%</span>
                        <div className="w-20">
                          <ConfidenceBar value={debt.confidence} />
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3 align-top">
                      {isRent ? (
                        <Badge tone="rent">Rent</Badge>
                      ) : (
                        <Badge tone="neutral">Lender</Badge>
                      )}
                    </td>
                    {/* Action */}
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        {state === 'flagged' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                            {I.flag}
                            Flagged
                          </span>
                        ) : state === 'dismissed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                            {I.check}
                            Dismissed
                          </span>
                        ) : (
                          <>
                            {isRent ? (
                              <Btn variant="secondary" className="h-7 px-2 text-xs" onClick={() => flag(debt.id)}>
                                {I.flag}
                                Flag — contradicts 1003?
                              </Btn>
                            ) : (
                              <Btn variant="secondary" className="h-7 px-2 text-xs" onClick={() => flag(debt.id)}>
                                {I.flag}
                                Flag for UW
                              </Btn>
                            )}
                            <button
                              type="button"
                              onClick={() => dismiss(debt.id)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
