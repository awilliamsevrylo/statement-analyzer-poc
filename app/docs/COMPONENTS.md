# Components

The full primitive set lives in **`src/components/UI.tsx`**. Use these everywhere — don't re-roll buttons, badges, or icons.

## Primitives

### `cls(...args)` — className joiner

```ts
import { cls } from '@/components/UI';

cls('base', conditional && 'extra', className);
// 'base extra ...' — falsy values are stripped
```

Lighter than `clsx`; we don't need merging logic since we don't combine arbitrary class strings.

### `fmtUSD(n, opts?)` — currency formatter

```ts
fmtUSD(18500);                          // "$18,500.00"
fmtUSD(18500, { decimals: 0 });         // "$18,500"
fmtUSD(6306, { decimals: 0, sign: true });  // "+$6,306"
fmtUSD(-2150, { decimals: 0 });         // "$2,150"  (negative sign is the caller's responsibility for non-credit cases)
```

### `fmtDate(iso)` / `fmtLongDate(iso)`

```ts
fmtDate('2026-04-15');       // "04/15"
fmtLongDate('2026-04-15');   // "April 15, 2026"
```

### `Badge` — small pill

```tsx
<Badge tone="critical">Unsourced</Badge>
<Badge tone="warning">Letter needed</Badge>
<Badge tone="success">Auto-sourced</Badge>
```

Tones: `neutral`, `primary`, `critical`, `warning`, `info`, `success`, `rent`.

The mapping lives in `BADGE_TONES` inside UI.tsx. To add a tone, edit that map and add the type to `BadgeTone`.

### `SeverityBadge` — labeled severity pill

```tsx
<SeverityBadge severity="critical" />   // "● Critical" (rose)
<SeverityBadge severity="warning" />    // "● Warning" (amber)
<SeverityBadge severity="info" />       // "● Info" (sky)
<SeverityBadge severity="pass" />       // "● Pass" (emerald)
```

### `Card` — basic container

```tsx
<Card className="p-5">…</Card>
<Card className="border-amber-200 bg-amber-50 px-5 py-4">…</Card>
```

Always: `rounded-xl border border-slate-200 bg-white shadow-sm`. Override via `className`.

### `Btn` — button (or anchor when given `href`)

```tsx
<Btn variant="primary" onClick={…}>New analysis</Btn>
<Btn variant="secondary" className="text-sm">Export packet</Btn>
<Btn variant="ghost" className="h-7 px-2 text-xs">Waive</Btn>
<Btn variant="primary" disabled={!ready}>Run analysis</Btn>
```

Variants: `primary` (orange), `secondary` (white + slate border), `ghost` (transparent), `danger` (white + rose border), `success` (emerald fill).

`disabled` is baked in: gets `cursor-not-allowed opacity-50 pointer-events-none` automatically. Don't add those by hand at the call site.

### `ConfidenceBar` — horizontal progress

```tsx
<ConfidenceBar value={92} />   // emerald (>= 80)
<ConfidenceBar value={72} />   // amber (60–79)
<ConfidenceBar value={50} />   // slate (< 60)
```

### `I` — icon set

Inline lucide-style SVGs. Used as React nodes:

```tsx
import { I } from '@/components/UI';

<button>{I.search} Search</button>
<span className="text-amber-600">{I.alert}</span>
```

Available icons (as of writing): `search`, `plus`, `chevronDown`, `chevronRight`, `chevronLeft`, `alert`, `check`, `mail`, `flag`, `x`, `download`, `filter`, `link`, `bank`, `user`, `file`, `arrowRight`, `arrowDown`, `branch`, `shield`, `dollar`, `sparkle`, `send`, `list`, `home`, `paperclip`, `inbox`.

Adding a new icon: edit `I` in UI.tsx with a fresh `<Icon>...</Icon>` JSX. Don't import lucide-react.

---

## Inbox components (`src/components/inbox/`)

Three "agent email" patterns — see [INBOX.md](./INBOX.md) for the full design context.

### `AgentEmailCard`

Wrapper that renders the email-style frame. Header (From/To/Cc/Re/Subject), body slot, optional footer slot.

```tsx
<AgentEmailCard
  from="Evrylo <file+LO-2026-04823@evrylo.com>"
  to="Stephanie Silverman"
  re="Fwd: April statement"
  footer={<div className="flex gap-2"><Btn>...</Btn></div>}
>
  <AgentDecisionBlock ... />
</AgentEmailCard>
```

### `AgentDecisionBlock` (Pattern E)

Renders an `AgentDecision`. Sparkle eyebrow, amber "Needs decision" callout, three tone-mapped reply-row buttons.

Props: `{ decision, loanNumber, onResolve(id) }`

### `AgentReportBlock` (Pattern F)

Renders an `AgentReport`. Three-tile delta grid (Sourced / New flags / Still missing) + bullet list.

Props: `{ report }`

### `AgentOutboundCard` (Pattern G)

Self-contained — wraps its own header. Renders an `AgentOutbound`: full body prose, optional snapshot card mid-body, "Drafted by Evrylo" footer strip.

Props: `{ outbound }`

### `ThreadView`

Dispatches each `ThreadEvent` to the right card type and renders them top-to-bottom.

Props: `{ events, loanNumber, onResolveDecision, onViewReport, onEmailBorrower, onEmailRealtor }`

---

## Layout components

### `Layout`

Two-column shell used by Workbench: 260px sticky left + main column. Pure presentational.

```tsx
<Layout sidebar={<SideNav activeTab="audit" />} main={<>...</>} />
```

### `Navbar`

Top chrome, `'use client'`. Reads `usePathname()` to highlight the active tab and `useAppContext()` for the unread badge count + `openNewAnalysis()`. Hidden on `/mobile` by `ClientShell`.

### `SideNav`

Left rail in the Workbench. Reads `useParams()` to get `jobId` for tab links. Tabs: Summary, Source-of-funds, Large Deposits, Undisclosed, Audit Trail, Coverage.

---

## Modals

### `EmailModal` (`src/components/modals/EmailModal.tsx`)

Drafts a borrower-facing email. Templates selectable via chips: `missing-statement`, `sourcing`, `gift-letter`, `request-statements`, `forward-realtor`. To/Cc/Subject/body editable. Cc field only renders when the active template defines a default.

Props: `{ template?, depositContext?, onClose }`

To add a template:

1. Add the literal to the `EmailTemplate` union.
2. Add an entry to `buildTemplates()` with `{ subject, body, attachments, to?, cc? }`.

### `NewAnalysisModal`

Workflow chooser (BSL vs General audit), borrower name input, fake drag-and-drop, fake 30-second progress. Triggered from `Navbar` and `Dashboard`'s "New analysis" button via `AppContext.openNewAnalysis()`.

---

## Adding a new component

Keep it presentational unless it really needs state. If it does need state, add `'use client';` at the top.

If it's a primitive that ≥3 places will use, put it in `src/components/UI.tsx` next to `Btn`/`Badge`/`Card` and document it here.

Avoid creating one-off wrappers around `Btn` like `EmailButton` or `TraceButton`. Prefer call-site composition.
