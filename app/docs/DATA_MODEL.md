# Data Model

Everything in this app is **mock data**. There's no database, no API, no server. All shapes live in `src/data/*.ts` as exported `const`s. Pages import them directly.

## Files

| File                      | What's in it                                               |
| ------------------------- | ---------------------------------------------------------- |
| `src/data/borrower.ts`    | Marcus Chen scenario — accounts, months, transactions, sourcing chains, large deposits, undisclosed debts |
| `src/data/dashboard.ts`   | Dashboard file list (8 fake jobs) + `STATUS_META` + `PROCESSING_STEPS` |
| `src/data/inbox.ts`       | ThreadEvent types + Marcus thread seed (5 events spanning patterns E/F/G) |
| `src/data/mobile.ts`      | Data for the `/mobile` phone-frame preview                |

---

## `borrower.ts` — the central scenario

The single seeded loan: **Marcus Chen, `LO-2026-04823`**, $612k Conventional Refinance closing May 22.

### Top-level exports

| Export              | Type                       | Purpose                                                |
| ------------------- | -------------------------- | ------------------------------------------------------ |
| `borrower`          | `Borrower`                 | Loan + borrower metadata                               |
| `accounts`          | `Account[]`                | 4 accounts (3 real, 1 missing — the "shadow" `****1234`) |
| `months`            | `MonthData[]`              | 7 months Oct '25 → Apr '26 with deposits/withdrawals/flags |
| `missingMonths`     | `MissingMonth[]`           | Statement gaps the agent flagged                       |
| `transactions`      | `Transaction[]`            | 17 transactions across the 7 months, each tagged with disposition + severity |
| `sourcingChains`    | `SourcingChain[]`          | 3 chains: earnest money (sourced), $14k (unsourced), Zelle gift (pending letter) |
| `largeDeposits`     | `LargeDeposit[]`           | 4 deposits flagged for sourcing review                 |
| `undisclosedDebts`  | `UndisclosedDebt[]`        | 5 recurring patterns matched against trigger words     |
| `dispositionLabels` | `Record<Disposition, string>` | Display strings for the disposition union          |

### Key types

```ts
interface Borrower {
  name: string;
  loan_number: string;            // 'LO-2026-04823'
  loan_type: string;              // 'Conventional · Refinance'
  loan_amount: number;
  monthly_gross_income: number;
  aus_result: string;             // 'Approve / Eligible'
  est_close_date: string;         // ISO date
  mlo: string;                    // 'Stephanie Silverman'
  brokerage: string;
  large_deposit_threshold_pct: number;  // 50 — meaning 50% of monthly gross
  govt_loan_threshold_pct: number;
}

type Disposition =
  | 'ELIGIBLE_W2'
  | 'INTERNAL_TRANSFER'
  | 'TRANSFER_FROM_UNRECOGNIZED'   // critical — source not in statement set
  | 'LARGE_DEPOSIT_ABOVE_INCOME'    // warning — needs gift letter or source statement
  | 'LARGE_DEPOSIT_BELOW_THRESHOLD' // info — logged but not blocking
  | 'UNDISCLOSED_DEBT_MATCH'        // critical — recurring lender payment not on credit report
  | 'FILTERED_DEBIT'                // noise — standard retail
  | 'EARNEST_MONEY';

interface Transaction {
  id: string;
  date: string;          // ISO
  account: string;       // foreign key to Account.id
  desc: string;
  amount: number;        // signed; CREDIT positive, DEBIT negative
  type: 'CREDIT' | 'DEBIT';
  disposition: Disposition;
  reason: string;        // human-readable explanation
  matched_to?: string;   // id of paired internal-transfer counter-leg
  day: number;           // day-of-month for sorting within a month
  severity?: 'critical' | 'warning' | 'info';
  trigger?: string;      // e.g. 'UPLIFT' for trigger-word debt detection
}

interface ChainNode {
  kind: 'origin' | 'step' | 'terminal' | 'unknown';
  label: string;
  amount?: number;
  account?: string;
  date?: string;
  sourced: boolean;
  evidence?: string;     // statement-page reference
  action?: string;       // if not sourced: what's needed ("Request gift letter")
  note?: string;
}

interface SourcingChain {
  id: string;            // 'chain-earnest', 'chain-14k', 'chain-zelle'
  title: string;
  status: 'partial' | 'unsourced' | 'pending-letter';
  target_account: string;
  target_date: string;
  target_amount: number;
  nodes: ChainNode[];    // origin first, terminal last
}
```

### Deposit threshold logic

`borrower.monthly_gross_income * (borrower.large_deposit_threshold_pct / 100)` =
`30,208 * 0.5` = **$15,104**. Anything ≥ this is flagged. The threshold appears in:

- Workbench **Summary** tab (KPI strip)
- Workbench **Large Deposits** tab (header card)
- Workbench **Audit** tab (per-row reason text)
- Report **Page 3** (Deposit Findings)

If you change the percentage, all four reflect immediately.

---

## `dashboard.ts` — the file list

`dashboardFiles: DashboardFile[]` — 8 jobs across all five statuses (`draft`, `processing`, `needs-action`, `completed`, `failed`).

```ts
interface DashboardFile {
  id: string;            // 'LO-2026-04823' etc.
  borrower: string;
  loan_type: string;
  amount: number;
  workflow: 'BSL' | 'General audit' | ...;
  statements: number;
  accounts: number;
  status: 'draft' | 'processing' | 'needs-action' | 'completed' | 'failed';
  flags?: { critical: number; warning: number; info: number };
  primary_action: string;     // 'Open file', 'Open report', 'Retry', ...
  primary_target: 'file' | 'report' | 'processing' | 'failed';
  created: string;
  updated: string;
  note: string;
  progress_pct?: number;      // for processing rows
  fail_reason?: string;
  fail_detail?: string;
}

const STATUS_META: Record<DashboardFile['status'], { label, dot, text }>
const PROCESSING_STEPS: { id, label }[]   // 9-step pipeline shown in /processing/<id>
```

The `dashboardFiles` array is also referenced by `/report/<id>` (to show "Report not found" for unknown ids) and `/processing/<id>` (to derive status/progress).

> **Note**: `/jobs/<id>` does **not** look up the id in this list. It always renders Marcus Chen's data. This is intentional for the POC — there's only one fully-seeded scenario.

---

## `inbox.ts` — the email thread

One real thread (Marcus Chen) with 5 seeded events covering all three agent patterns.

### Top-level exports

| Export                       | Type                              | Purpose                                       |
| ---------------------------- | --------------------------------- | --------------------------------------------- |
| `loanEmailAddress`           | `string`                          | `file+${borrower.loan_number}@evrylo.com`     |
| `threads`                    | `InboxThread[]`                   | One real thread, one element                  |
| `unresolvedDecisionCount(t, resolvedMap?)` | function | Counts pending agent-decision events in a thread, optionally filtered by a resolved-id map (typically the AppContext's `resolvedDecisions`). |

### Key types

```ts
type ThreadEventKind =
  | 'inbound-forward'   // Steph forwarded something to file+...@evrylo.com
  | 'agent-report'      // Agent replied with findings (Pattern F)
  | 'agent-decision'    // Agent asked Steph a yes/no (Pattern E)
  | 'agent-outbound'    // Agent ghost-wrote on Steph's behalf to a 3rd party (Pattern G)
  | 'borrower-reply'    // (reserved — not seeded yet)
  | 'note';             // Plain inline note

interface ThreadEvent {
  id: string;
  kind: ThreadEventKind;
  at: string;            // ISO
  // kind === 'inbound-forward':
  inboundFrom?: string;
  inboundSubject?: string;
  inboundAttachments?: { name: string; size: string }[];
  // kind === 'agent-decision':
  decision?: AgentDecision;
  // kind === 'agent-report':
  report?: AgentReport;
  // kind === 'agent-outbound':
  outbound?: AgentOutbound;
  // kind === 'note':
  noteAuthor?: string;
  noteBody?: string;
}

interface AgentDecision {
  question: string;
  context: string;
  options: { id: 'yes'|'no'|'chat'; label: string; sublabel: string; tone: 'success'|'critical'|'neutral' }[];
  expiresAt: string;
  resolvedWith?: 'yes'|'no'|'chat';   // baked into the seed; the live "resolved" state lives in AppContext.resolvedDecisions
  resolvedAt?: string;
}

interface AgentReport {
  parsedItems: number;
  coverageBefore: string;
  coverageAfter: string;
  sourcedDelta: number;       // dollars; rendered as `+$72k` in the tile
  newFlags: number;
  stillMissing: string;       // e.g. "Sep '25"
  bullets: { tone: 'success'|'warning'|'critical'; text: string }[];
}

interface AgentOutbound {
  to: string;
  toLabel: string;
  cc: string[];               // includes loanEmailAddress for thread tracking
  subject: string;
  body: string;               // \n\n-separated paragraphs
  snapshot?: { loan: string; closes: string; status: string; statusTone: 'success'|'warning'|'critical' };
  approvedBySteph: boolean;
  sentAt?: string;
}
```

### Resolved decisions live in context, not in seed data

The seed `decision.resolvedWith` is set for *pre-resolved* events (none currently). When the user clicks a decision button at runtime, we don't mutate the seed — we write to `AppContext.resolvedDecisions` (a `Record<eventId, choice>`). The Inbox page merges this map into the rendered view.

This is why `Navbar`'s unread badge and Inbox's per-thread counter both read from context, not from `threads`. See [STATE.md](./STATE.md).

---

## `mobile.ts`

Data for the fake phone-frame preview at `/mobile`. Five "screens" (Home, Deposits, Sourcing, Debts, Audit) rendered into a 390×844 frame. Not used by any real route.

---

## Adding a borrower scenario

Today there's only one. To add another:

1. Decide if it's a parallel scenario (separate `Borrower2` in a new file) or a fork (parameterize all the data exports).
2. The current path of least resistance is parameterize: turn `borrower`/`accounts`/`months`/etc. into a function `loadBorrower(id: string)` that returns the bundle.
3. Wire `Workbench` and `Report` pages to call `loadBorrower(jobId)` and render a "not found" if it returns null.
4. Update `dashboardFiles` to point each row at the right scenario id.

This is a real refactor, not a one-line change. Don't undertake it without a reason.
