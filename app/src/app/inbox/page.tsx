'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cls, Card, Badge } from '@/components/UI';
import ThreadView from '@/components/inbox/ThreadView';
import EmailModal, { type EmailTemplate, type DepositContext } from '@/components/modals/EmailModal';
import { threads, unresolvedDecisionCount, loanEmailAddress } from '@/data/inbox';
import type { ThreadEvent } from '@/data/inbox';
import { useAppContext, type DecisionChoice } from '@/app/_components/AppContext';

const FILTERS = ['All', 'Needs decision', 'Awaiting borrower'] as const;
type Filter = (typeof FILTERS)[number];

const ghostThreads = [
  { id: 'ghost-1', borrowerName: 'Sloan Whittaker', subject: 'Re: VOE follow-up', preview: 'Pending borrower upload · 2 days' },
  { id: 'ghost-2', borrowerName: 'Talia Reyes',     subject: 'Income calc',      preview: 'No action needed' },
];

function buildFollowUpEvent(threadId: string, eventId: string, choice: DecisionChoice): ThreadEvent {
  const at = new Date().toISOString();
  if (choice === 'yes') {
    return {
      id: `${eventId}-follow-yes`,
      kind: 'agent-outbound',
      at,
      outbound: {
        to: 'ryan.chen@gmail.com',
        toLabel: 'Ryan Chen (donor)',
        cc: ['marcus.chen@gmail.com', loanEmailAddress],
        subject: 'Gift letter — $16,000 Zelle on 3/15',
        body: `Hi Ryan,\n\nMarcus is closing on a refi and the $16,000 Zelle you sent on March 15 needs a one-page gift letter for underwriting. The standard Fannie Mae template is attached.\n\nPlease fill in your details, sign, and reply to this email or upload through the borrower portal. Should take 5 minutes.\n\nThanks,\nSteph`,
        approvedBySteph: true,
        sentAt: at,
      },
    };
  }
  if (choice === 'no') {
    return {
      id: `${eventId}-follow-no`,
      kind: 'agent-outbound',
      at,
      outbound: {
        to: 'marcus.chen@gmail.com',
        toLabel: 'Marcus Chen',
        cc: [loanEmailAddress],
        subject: "Source statements needed for $16,000 deposit on 3/15",
        body: `Hi Marcus,\n\nUnderwriting needs to trace the $16,000 Zelle from Ryan Chen on March 15. Please upload the most recent two statements from the source account so we can document seasoning.\n\nThanks,\nSteph`,
        approvedBySteph: true,
        sentAt: at,
      },
    };
  }
  // 'chat' — agent will navigate, no follow-up event
  return {
    id: `${eventId}-follow-chat`,
    kind: 'note',
    at,
    noteAuthor: 'Stephanie',
    noteBody: 'Opened the file in the workbench to chat through it.',
  };
}

export default function InboxPage() {
  const router = useRouter();
  const { resolvedDecisions, setResolvedDecision } = useAppContext();

  const [activeId, setActiveId] = useState<string>(threads[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('All');
  const [appendedEvents, setAppendedEvents] = useState<Record<string, ThreadEvent[]>>({});

  // Email modal state
  const [showEmail, setShowEmail] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>('sourcing');
  const [emailContext, setEmailContext] = useState<DepositContext | undefined>(undefined);

  function openEmail(template: EmailTemplate, ctx?: DepositContext) {
    setEmailTemplate(template);
    setEmailContext(ctx);
    setShowEmail(true);
  }

  function handleResolveDecision(threadId: string, eventId: string, choice: DecisionChoice) {
    setResolvedDecision(eventId, choice);
    if (choice === 'chat') {
      const t = threads.find((x) => x.id === threadId);
      if (t) router.push(`/jobs/${t.loanNumber}`);
      return;
    }
    const followUp = buildFollowUpEvent(threadId, eventId, choice);
    setAppendedEvents((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), followUp],
    }));
  }

  const visibleThreads = useMemo(() => {
    if (filter === 'All') return threads;
    if (filter === 'Needs decision') {
      return threads.filter((t) => unresolvedDecisionCount(t, resolvedDecisions) > 0);
    }
    // 'Awaiting borrower' — none currently in the seed
    return [];
  }, [filter, resolvedDecisions]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [activeId],
  );

  const displayEvents = useMemo<ThreadEvent[]>(() => {
    if (!activeThread) return [];
    const decorated = activeThread.events.map((e) => {
      if (e.kind === 'agent-decision' && e.decision && resolvedDecisions[e.id]) {
        return {
          ...e,
          decision: { ...e.decision, resolvedWith: resolvedDecisions[e.id] },
        };
      }
      return e;
    });
    return [...decorated, ...(appendedEvents[activeThread.id] ?? [])];
  }, [activeThread, resolvedDecisions, appendedEvents]);

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
          {visibleThreads.map((t) => {
            const open = unresolvedDecisionCount(t, resolvedDecisions);
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
          {visibleThreads.length === 0 && (
            <li className="px-5 py-6 text-center text-[12px] text-slate-500">
              No threads in &ldquo;{filter}&rdquo;.
            </li>
          )}
          {filter === 'All' && ghostThreads.map((g) => (
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
            <ThreadView
              events={displayEvents}
              loanNumber={activeThread.loanNumber}
              onResolveDecision={(eventId, choice) =>
                handleResolveDecision(activeThread.id, eventId, choice)
              }
              onViewReport={() => router.push(`/report/${activeThread.loanNumber}`)}
              onEmailBorrower={() => openEmail('sourcing')}
              onEmailRealtor={() => openEmail('forward-realtor')}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Card className="px-6 py-8 text-center">
              <div className="text-sm text-slate-500">No thread selected.</div>
            </Card>
          </div>
        )}
      </main>

      {showEmail && (
        <EmailModal
          template={emailTemplate}
          depositContext={emailContext}
          onClose={() => setShowEmail(false)}
        />
      )}
    </div>
  );
}
