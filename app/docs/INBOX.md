# Inbox — Email-driven agent patterns

The `/inbox` route demonstrates a per-loan email loop: the loan officer (Steph) forwards emails / docs to a per-loan address, an AI agent processes them and replies with structured cards she can act on with one tap.

## The address

```
file+<loan_number>@evrylo.com
```

For Marcus Chen's loan: `file+LO-2026-04823@evrylo.com`. Defined as `loanEmailAddress` in `src/data/inbox.ts`. Used as the From of every agent reply and the Cc of every ghost-written outbound — so replies stay tracked to the file.

---

## Three patterns

### Pattern E — Boolean decision

**Trigger:** Steph forwards a statement → agent finds an ambiguous deposit while parsing.
**Reply:** A short report + 1-tap reply rows.

```
┌─ Evrylo ─────────────────────────────────────┐
│ ✦  Processed in 14s · 1 question for you    │
│                                              │
│ Hey Steph — pulled WF ****7842 · April from  │
│ your forward. One thing needs your call:     │
│                                              │
│ ┌─ NEEDS DECISION ──────────────────────────┐│
│ │ $16,000 Zelle from Ryan Chen · Mar 15    ││
│ │ Same surname as borrower — likely family.││
│ │ Is this a gift?                          ││
│ └──────────────────────────────────────────┘│
│                                              │
│ REPLY WITH ONE TAP                           │
│ ┌──────────────────────────────────────────┐│
│ │ ✓  Yes — it's a gift                     ││
│ │    I'll email Ryan a gift-letter template││
│ ├──────────────────────────────────────────┤│
│ │ ✕  No — needs sourcing                   ││
│ │    I'll request statements from Ryan's…  ││
│ ├──────────────────────────────────────────┤│
│ │ ⌕  Chat with me                          ││
│ │    Open the file in Evrylo               ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Replies tracked to LO-2026-04823 · expires…  │
└──────────────────────────────────────────────┘
```

**Component:** `src/components/inbox/AgentDecisionBlock.tsx`
**Data shape:** `AgentDecision` in `src/data/inbox.ts`

**Resolution side-effects** (in `src/app/inbox/page.tsx`):
- `yes` → calls `setResolvedDecision(eventId, 'yes')`, appends a follow-up `agent-outbound` to the thread (gift letter to Ryan).
- `no` → resolves + appends a different follow-up (source statements to Marcus).
- `chat` → resolves + `router.push('/jobs/<loan_number>')`.

The unread badge in the Navbar updates **immediately** because it reads from the same `AppContext.resolvedDecisions` map.

### Pattern F — Forward → analysis report

**Trigger:** Steph forwards 1+ statements to `file+<loan>@evrylo.com`.
**Reply:** Findings card with three colored tiles + bullets + footer CTAs.

```
┌─ Evrylo ─────────────────────────────────────┐
│ ANALYSIS · 3 statements parsed               │
│ Done. Coverage now 5/6 months.               │
│ Here's what changed:                         │
│                                              │
│ ┌──────┬──────┬──────────┐                   │
│ │SOURCED│NEW FLAGS│STILL MISSING│            │
│ │+$72k │  2   │  Sep '25 │                   │
│ └──────┴──────┴──────────┘                   │
│                                              │
│ ● $18,500 wire from Chase — auto-sourced.    │
│ ● $2,150 Pine Property Mgmt · 5 occurrences  │
│   — possible undisclosed rent.               │
│ ● $14,000 transfer from ****1234 — source    │
│   account still not in set.                  │
│                                              │
├─ footer ────────────────────────────────────┤
│ [View full report ↗] [Email borrower] [Email realtor] │
└─────────────────────────────────────────────┘
```

**Component:** `src/components/inbox/AgentReportBlock.tsx`
**Data shape:** `AgentReport` in `src/data/inbox.ts`

**Footer wiring** (passed in by the Inbox page):
- `View full report ↗` → `router.push('/report/<loan_number>')`.
- `Email borrower` → opens `EmailModal` with template `'sourcing'`.
- `Email realtor` → opens `EmailModal` with template `'forward-realtor'` (Pattern G entry point).

### Pattern G — Forward to a third party

**Trigger:** Steph clicks "Email realtor" on the report card (or otherwise sends to a 3rd party). Agent ghost-writes on her behalf, CCs the borrower and the loan address, sends it.

```
┌─ Email ──────────────────────────────────────┐
│ From    Evrylo on behalf of Stephanie        │
│ To      jordan@bayrealtygroup.com (realtor)  │
│ Cc      marcus.chen@gmail.com · file+LO-…@…  │
│ Subject Marcus Chen — 1 item left before…    │
├──────────────────────────────────────────────┤
│ Hi Jordan,                                   │
│                                              │
│ Looping you in. Marcus's file is in good     │
│ shape — payroll's clean, earnest money trail │
│ closes itself, and we're 5 days ahead of …   │
│                                              │
│ One last item before we send to underwriting:│
│ statements for the source of a $14,000…      │
│                                              │
│ ┌─ Snapshot · LO-2026-04823 ──────────────┐  │
│ │ Loan      $612k Conv Refi               │  │
│ │ Closes    May 22 (17 days)              │  │
│ │ Status    1 item open  (amber)          │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ Replies to this thread are tracked back to   │
│ the file automatically — no need to forward  │
│ separately.                                  │
│                                              │
│ Thanks, Steph                                │
├─ footer ────────────────────────────────────┤
│ 🛡 Drafted by Evrylo · Steph approved · 9:42AM│
└──────────────────────────────────────────────┘
```

**Component:** `src/components/inbox/AgentOutboundCard.tsx`
**Data shape:** `AgentOutbound` in `src/data/inbox.ts`

The `EmailModal` is the editing surface: Steph can adjust To/Cc/Subject/body before clicking **Send & log**. On send, the seed thread *would* get a new `agent-outbound` event appended (currently the modal's send is a UI-only state flip — wiring the side-effect is left as future work).

---

## Component map

```
src/app/inbox/page.tsx
  ├── two-pane layout
  ├── owns appendedEvents (the new follow-up cards from Pattern E resolutions)
  ├── reads + writes AppContext.resolvedDecisions
  └── ThreadView
        └── per-event dispatch:
              inbound-forward   → small slate card with attachment chips
              agent-decision    → AgentEmailCard wrapping AgentDecisionBlock
              agent-report      → AgentEmailCard wrapping AgentReportBlock
                                  + footer (View report / Email borrower / Email realtor)
              agent-outbound    → AgentOutboundCard
              note              → muted slate card

src/components/inbox/
  ├── AgentEmailCard.tsx          shared email-style frame
  ├── AgentDecisionBlock.tsx      Pattern E body
  ├── AgentReportBlock.tsx        Pattern F body
  ├── AgentOutboundCard.tsx       Pattern G self-contained card
  └── ThreadView.tsx              dispatches per kind
```

---

## State flow during a Pattern E resolution

```
User clicks "Yes — it's a gift"
   │
   ▼
ThreadView.onResolveDecision(eventId, 'yes')
   │
   ▼
InboxPage.handleResolveDecision(threadId, eventId, 'yes')
   │
   ├─► AppContext.setResolvedDecision(eventId, 'yes')
   │     │
   │     ├─► Navbar re-renders → unread count drops by 1
   │     └─► Inbox left list re-renders → "1 decision" badge clears
   │
   └─► InboxPage.setAppendedEvents — adds a new agent-outbound event
         │
         └─► ThreadView re-renders with the new event appended
```

All client-side. Refresh wipes everything except whatever's in the seed.

---

## What's NOT wired (future work)

- `EmailModal.handleSend()` only flips local UI to "sent". Doesn't append an `agent-outbound` event to the inbox thread.
- The "Awaiting borrower" filter chip exists but no thread is in that state, so it shows an empty stub.
- The two ghost threads (Sloan Whittaker, Talia Reyes) on the left rail are static placeholders. Clicking them doesn't load anything.
- No real email backend, no real send.
- Decision-event followups are hardcoded (Ryan for "yes", Marcus for "no"). Not parameterized by deposit/borrower.

These are deferred per the implementation prompt's §10 stop-for-review.
