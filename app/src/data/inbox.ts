// src/data/inbox.ts
// Per-loan email thread events for the Inbox patterns E/F/G.
// Backend-free POC — all events are seeded.
//
// At runtime we never mutate `threads`. Resolution state lives in
// `AppContext.resolvedDecisions` (a Record<eventId, choice>). Inbox renders
// merge that map over the seed at display time. See docs/INBOX.md.

import { borrower } from './borrower';

/**
 * Per-loan email address. Format: `file+<loan_number>@evrylo.com`.
 * Used as the From of every agent reply and the Cc of every ghost-written
 * outbound — replies routed to this address are auto-tracked to the file.
 */
export const loanEmailAddress = `file+${borrower.loan_number}@evrylo.com`;

/**
 * Event kinds in an inbox thread. Maps to the three documented agent patterns:
 *   - `inbound-forward` — Steph forwarded something to file+...@evrylo.com
 *   - `agent-report`    — Pattern F (forward → analysis report)
 *   - `agent-decision`  — Pattern E (boolean question with one-tap reply)
 *   - `agent-outbound`  — Pattern G (agent ghost-wrote on Steph's behalf)
 *   - `borrower-reply`  — reserved; not seeded yet
 *   - `note`            — plain inline note (used for chat-with-me follow-up)
 */
export type ThreadEventKind =
  | 'inbound-forward'
  | 'agent-report'
  | 'agent-decision'
  | 'agent-outbound'
  | 'borrower-reply'
  | 'note';

export interface AgentDecisionOption {
  id: 'yes' | 'no' | 'chat';
  label: string;
  sublabel: string;
  tone: 'success' | 'critical' | 'neutral';
}

export interface AgentDecision {
  question: string;
  context: string;
  options: AgentDecisionOption[];
  expiresAt: string;
  resolvedWith?: 'yes' | 'no' | 'chat';
  resolvedAt?: string;
}

export interface AgentReportBullet {
  tone: 'success' | 'warning' | 'critical';
  text: string;
}

export interface AgentReport {
  parsedItems: number;
  coverageBefore: string;
  coverageAfter: string;
  sourcedDelta: number;
  newFlags: number;
  stillMissing: string;
  bullets: AgentReportBullet[];
}

export interface AgentOutbound {
  to: string;
  toLabel: string;
  cc: string[];
  subject: string;
  body: string;
  snapshot?: {
    loan: string;
    closes: string;
    status: string;
    statusTone: 'success' | 'warning' | 'critical';
  };
  approvedBySteph: boolean;
  sentAt?: string;
}

export interface InboundAttachment {
  name: string;
  size: string;
}

export interface ThreadEvent {
  id: string;
  kind: ThreadEventKind;
  at: string;
  inboundFrom?: string;
  inboundSubject?: string;
  inboundAttachments?: InboundAttachment[];
  decision?: AgentDecision;
  report?: AgentReport;
  outbound?: AgentOutbound;
  noteAuthor?: string;
  noteBody?: string;
}

export interface InboxThread {
  id: string;
  loanNumber: string;
  borrowerName: string;
  subject: string;
  events: ThreadEvent[];
}

const marcusEvents: ThreadEvent[] = [
  // ── Pattern F: forward → analysis report ──
  {
    id: 'evt-001',
    kind: 'inbound-forward',
    at: '2026-04-29T09:31:00Z',
    inboundFrom: 'Stephanie Silverman <steph@leaderone.com>',
    inboundSubject: 'Fwd: WF statements (3 attached) — Marcus Chen',
    inboundAttachments: [
      { name: 'WF_7842_Jan2026.pdf', size: '412 KB' },
      { name: 'WF_7842_Feb2026.pdf', size: '398 KB' },
      { name: 'WF_7842_Mar2026.pdf', size: '421 KB' },
    ],
  },
  {
    id: 'evt-002',
    kind: 'agent-report',
    at: '2026-04-29T09:31:42Z',
    report: {
      parsedItems: 3,
      coverageBefore: '2/6 months',
      coverageAfter: '5/6 months',
      sourcedDelta: 72000,
      newFlags: 2,
      stillMissing: "Sep '25",
      bullets: [
        { tone: 'success',  text: '$18,500 wire from Chase Savings — auto-sourced (internal transfer).' },
        { tone: 'warning',  text: '$2,150 Pine Property Mgmt · 5 occurrences — possible undisclosed rent.' },
        { tone: 'critical', text: '$14,000 transfer from ****1234 — source account still not in set.' },
      ],
    },
  },

  // ── Pattern G: agent CCs realtor + borrower ──
  {
    id: 'evt-005',
    kind: 'agent-outbound',
    at: '2026-04-29T09:42:00Z',
    outbound: {
      to: 'jordan@bayrealtygroup.com',
      toLabel: 'Jordan Park (realtor)',
      cc: ['marcus.chen@gmail.com', loanEmailAddress],
      subject: 'Marcus Chen — 1 item left before clear-to-close',
      body: `Hi Jordan,

Looping you in. Marcus's file is in good shape — payroll's clean, earnest money trail closes itself, and we're 5 days ahead of schedule.

One last item before we send to underwriting: statements for the source of a $14,000 transfer. I've sent Marcus the request directly (CC'd here). If you talk to him in the next day or two, a nudge helps.

Replies to this thread are tracked back to the file automatically — no need to forward separately.

Thanks,
Steph`,
      snapshot: {
        loan: '$612k Conv Refi',
        closes: 'May 22 (17 days)',
        status: '1 item open',
        statusTone: 'warning',
      },
      approvedBySteph: true,
      sentAt: '2026-04-29T09:42:00Z',
    },
  },

  // ── Pattern E: agent flags ambiguous deposit, asks Steph ──
  {
    id: 'evt-003',
    kind: 'inbound-forward',
    at: '2026-04-29T14:02:00Z',
    inboundFrom: 'Stephanie Silverman <steph@leaderone.com>',
    inboundSubject: 'Fwd: April statement — Marcus Chen',
    inboundAttachments: [
      { name: 'WF_7842_Apr2026.pdf', size: '405 KB' },
    ],
  },
  {
    id: 'evt-004',
    kind: 'agent-decision',
    at: '2026-04-29T14:02:14Z',
    decision: {
      question: '$16,000 Zelle from Ryan Chen · Mar 15',
      context: 'Same surname as borrower — likely family. Is this a gift?',
      expiresAt: '2026-05-06T14:02:14Z',
      options: [
        { id: 'yes',  label: "Yes — it's a gift",   sublabel: "I'll email Ryan a gift-letter template",      tone: 'success'  },
        { id: 'no',   label: 'No — needs sourcing', sublabel: "I'll request statements from Ryan's account", tone: 'critical' },
        { id: 'chat', label: 'Chat with me',        sublabel: 'Open the file in Evrylo',                     tone: 'neutral'  },
      ],
    },
  },
];

export const threads: InboxThread[] = [
  {
    id: 'thread-marcus',
    loanNumber: borrower.loan_number,
    borrowerName: borrower.name,
    subject: 'Fwd: April statement — Marcus Chen',
    events: marcusEvents,
  },
];

/**
 * Counts agent-decision events still awaiting Steph's reply.
 *
 * @param resolvedMap — pass `AppContext.resolvedDecisions` to get the live
 *   count. Omit only if you want the seed-only count (rare).
 */
export function unresolvedDecisionCount(
  thread: InboxThread,
  resolvedMap: Record<string, string> = {},
): number {
  return thread.events.filter(
    (e) =>
      e.kind === 'agent-decision' &&
      e.decision &&
      !e.decision.resolvedWith &&
      !resolvedMap[e.id],
  ).length;
}
