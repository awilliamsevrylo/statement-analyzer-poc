'use client';

import { Card, I } from '@/components/UI';
import type { ThreadEvent, AgentDecisionOption } from '@/data/inbox';
import { loanEmailAddress } from '@/data/inbox';
import AgentEmailCard from './AgentEmailCard';
import AgentDecisionBlock from './AgentDecisionBlock';
import AgentReportBlock from './AgentReportBlock';
import AgentOutboundCard from './AgentOutboundCard';

interface ThreadViewProps {
  events: ThreadEvent[];
  loanNumber: string;
  onResolveDecision?: (eventId: string, choice: AgentDecisionOption['id']) => void;
  onViewReport?: () => void;
  onEmailBorrower?: () => void;
  onEmailRealtor?: (eventId: string) => void;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

export default function ThreadView({
  events, loanNumber,
  onResolveDecision, onViewReport, onEmailBorrower, onEmailRealtor,
}: ThreadViewProps) {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="space-y-4">
      {sorted.map((evt) => {
        if (evt.kind === 'inbound-forward') {
          return (
            <Card key={evt.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-slate-400">{I.mail}</span>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Forwarded by Stephanie · {fmtTime(evt.at)}</div>
                  <div className="mt-0.5 text-[13px] font-medium text-slate-900">{evt.inboundSubject}</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">{evt.inboundFrom}</div>
                  {evt.inboundAttachments && evt.inboundAttachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evt.inboundAttachments.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
                        >
                          <span className="text-slate-400">{I.paperclip}</span>
                          <span className="font-medium text-slate-800">{a.name}</span>
                          <span className="text-slate-400">{a.size}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        }

        if (evt.kind === 'agent-decision' && evt.decision) {
          return (
            <AgentEmailCard
              key={evt.id}
              from={`Evrylo <${loanEmailAddress}>`}
              to="Stephanie Silverman"
              re={evt.inboundSubject ?? `Loan ${loanNumber}`}
            >
              <AgentDecisionBlock
                decision={evt.decision}
                loanNumber={loanNumber}
                onResolve={(id) => onResolveDecision?.(evt.id, id)}
              />
            </AgentEmailCard>
          );
        }

        if (evt.kind === 'agent-report' && evt.report) {
          return (
            <AgentEmailCard
              key={evt.id}
              from={`Evrylo <${loanEmailAddress}>`}
              re={evt.inboundSubject ?? `Loan ${loanNumber}`}
              footer={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onViewReport}
                    className="flex h-9 flex-1 items-center justify-center rounded-lg bg-[#eb7230] text-[12px] font-semibold text-white transition-colors hover:bg-[#d96526]"
                  >
                    View full report ↗
                  </button>
                  <button
                    type="button"
                    onClick={onEmailBorrower}
                    className="flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Email borrower
                  </button>
                  <button
                    type="button"
                    onClick={() => onEmailRealtor?.(evt.id)}
                    className="flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Email realtor
                  </button>
                </div>
              }
            >
              <AgentReportBlock report={evt.report} />
            </AgentEmailCard>
          );
        }

        if (evt.kind === 'agent-outbound' && evt.outbound) {
          return <AgentOutboundCard key={evt.id} outbound={evt.outbound} />;
        }

        if (evt.kind === 'note') {
          return (
            <Card key={evt.id} className="bg-slate-50/60 px-5 py-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">{evt.noteAuthor} · {fmtTime(evt.at)}</div>
              <div className="mt-1 text-[13px] text-slate-700">{evt.noteBody}</div>
            </Card>
          );
        }

        return null;
      })}
    </div>
  );
}
