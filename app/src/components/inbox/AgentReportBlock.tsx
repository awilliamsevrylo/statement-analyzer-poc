'use client';

import type { AgentReport } from '@/data/inbox';

interface AgentReportBlockProps {
  report: AgentReport;
}

const BULLET_DOT: Record<AgentReport['bullets'][number]['tone'], string> = {
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  critical: 'bg-rose-500',
};

function fmtCurrencyShort(n: number): string {
  if (Math.abs(n) >= 1000) {
    const k = n / 1000;
    const rounded = k.toFixed(k % 1 === 0 ? 0 : 1);
    return `${n >= 0 ? '+' : ''}$${rounded}k`;
  }
  return `${n >= 0 ? '+' : ''}$${n}`;
}

export default function AgentReportBlock({ report }: AgentReportBlockProps) {
  return (
    <>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Analysis · {report.parsedItems} statements parsed
      </div>
      <p className="mb-3 text-[14px] text-slate-800">
        Done. Coverage now <span className="font-semibold">{report.coverageAfter}</span>. Here&rsquo;s what changed:
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5">
          <div className="text-[9px] font-semibold uppercase text-emerald-700">Sourced</div>
          <div className="mt-1 text-[18px] font-bold leading-none tabular-nums text-emerald-700">
            {fmtCurrencyShort(report.sourcedDelta)}
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
          <div className="text-[9px] font-semibold uppercase text-amber-700">New flags</div>
          <div className="mt-1 text-[18px] font-bold leading-none tabular-nums text-amber-700">
            {report.newFlags}
          </div>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-2.5">
          <div className="text-[9px] font-semibold uppercase text-rose-700">Still missing</div>
          <div className="mt-1 text-[18px] font-bold leading-none text-rose-700">
            {report.stillMissing}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {report.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px]">
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${BULLET_DOT[b.tone]}`} />
            <span className="text-slate-700">{b.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
