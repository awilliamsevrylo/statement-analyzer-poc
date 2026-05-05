'use client';

import { cls, Card, I } from '@/components/UI';
import type { AgentOutbound } from '@/data/inbox';

interface AgentOutboundCardProps {
  outbound: AgentOutbound;
}

const STATUS_TONE: Record<NonNullable<AgentOutbound['snapshot']>['statusTone'], string> = {
  success:  'text-emerald-700',
  warning:  'text-amber-700',
  critical: 'text-rose-700',
};

function fmtSentTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AgentOutboundCard({ outbound }: AgentOutboundCardProps) {
  const paragraphs = outbound.body.split(/\n\n+/);

  return (
    <Card className="overflow-hidden">
      <div className="space-y-0.5 border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-[11px] text-slate-600">
        <div><span className="inline-block w-12 text-slate-400">From</span>Evrylo on behalf of Stephanie</div>
        <div><span className="inline-block w-12 text-slate-400">To</span>{outbound.to} ({outbound.toLabel})</div>
        <div><span className="inline-block w-12 text-slate-400">Cc</span>{outbound.cc.join(' · ')}</div>
        <div><span className="inline-block w-12 text-slate-400">Subject</span><span className="font-medium text-slate-900">{outbound.subject}</span></div>
      </div>

      <div className="space-y-3 px-6 py-5 text-[14px] leading-relaxed text-slate-800">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}

        {outbound.snapshot && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px]">
            <div className="mb-1.5 font-semibold text-slate-900">Snapshot</div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <div className="text-slate-500">Loan</div>
                <div className="font-semibold tabular-nums text-slate-900">{outbound.snapshot.loan}</div>
              </div>
              <div>
                <div className="text-slate-500">Closes</div>
                <div className="font-semibold text-slate-900">{outbound.snapshot.closes}</div>
              </div>
              <div>
                <div className="text-slate-500">Status</div>
                <div className={cls('font-semibold', STATUS_TONE[outbound.snapshot.statusTone])}>
                  {outbound.snapshot.status}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3 text-[11px] text-slate-500">
        <span className="text-slate-500">{I.shield}</span>
        Drafted by Evrylo · {outbound.approvedBySteph ? 'Steph approved' : 'Awaiting approval'} · Sent at {fmtSentTime(outbound.sentAt)}
      </div>
    </Card>
  );
}
