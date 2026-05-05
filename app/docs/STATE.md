# State management

Three layers, in order of scope:

## 1. Module-scope mock data — `src/data/*.ts`

Read-only at runtime. Imported as `const`s. Treat as immutable.

```ts
import { borrower, accounts, transactions } from '@/data/borrower';
import { threads } from '@/data/inbox';
```

Mutating these would skip React's render cycle and create cross-page bugs. Don't.

## 2. AppContext — cross-page client state

Lives in `src/app/_components/AppContext.tsx`. Provided by `ClientShell` at the App Router root, so every page is a consumer.

```ts
export interface AppContextValue {
  openNewAnalysis: () => void;
  resolvedDecisions: Record<string, DecisionChoice>;
  setResolvedDecision: (eventId: string, choice: DecisionChoice) => void;
}

export type DecisionChoice = 'yes' | 'no' | 'chat';
```

### Why context, not a module-mutable store

A mutable `let` in `data/inbox.ts` would update without triggering React's render cycle, so the Navbar's badge would stay stale. Context guarantees that any consumer re-renders when the value changes.

### Who reads / writes what

| Concern                     | Provider           | Writers           | Readers                            |
| --------------------------- | ------------------ | ----------------- | ---------------------------------- |
| New-analysis modal trigger  | `ClientShell`      | `Navbar`, `Dashboard` | `ClientShell` (renders modal)  |
| Resolved Inbox decisions    | `ClientShell`      | `InboxPage`       | `Navbar` (badge), `InboxPage` (filter, per-thread badge, displayEvents merge) |

### Adding a new piece of cross-page state

1. Add the field + setter to `AppContextValue` in `AppContext.tsx`.
2. Add the `useState` and the setter in `ClientShell.tsx`. Pass into the provider's `value`.
3. Consume from any `'use client'` component via `useAppContext()`.

Don't put per-page ephemeral state here (e.g. "is this row expanded"). That belongs in local `useState`.

## 3. Local component state

Standard React `useState` / `useReducer`. Lives only as long as the component is mounted.

Examples currently in use:

| Page / component   | Local state                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `Dashboard`        | `activeFilter` (filter chip), search query is read from URL via `?q=`     |
| `Workbench`        | `dismissedBanner`, `showEmail`, `emailTemplate`, `emailDepositContext`    |
| `SourcingTab`      | `activeChainId` (initialized from `?chain=` URL param), `expandedNodes`    |
| `LargeDepositsTab` | `waivedIds` (the transient "Waive" pill set)                              |
| `AuditTab`         | `search`, `activeChip`, `expanded`                                         |
| `SummaryTab`       | `expandedMonth`                                                            |
| `InboxPage`        | `activeId`, `filter`, `appendedEvents`, `showEmail`, `emailTemplate`      |
| `EmailModal`       | `to`, `cc`, `subject`, `body`, `attachments`, `sent`, `sentAt`             |
| `NewAnalysisModal` | workflow, borrowerName, files, step (config/uploading/done), progress     |

All of these reset on navigation. That's intentional for a POC.

## 4. URL state

Reading the URL is the source of truth for routing-level state. Don't mirror URL into local state — read it directly.

| URL pattern                                              | What's there                              |
| -------------------------------------------------------- | ----------------------------------------- |
| `/?q=<query>`                                            | Dashboard borrower-name filter            |
| `/jobs/<id>`                                             | Workbench job id                          |
| `/jobs/<id>/<tab>`                                       | Active tab via optional catch-all         |
| `/jobs/<id>/sourcing?chain=<chainId>`                    | Pre-selected chain in Sourcing tab        |

```tsx
'use client';
import { useParams, useSearchParams } from 'next/navigation';

const params = useParams<{ jobId: string; tab?: string[] }>();
const searchParams = useSearchParams();
const q = searchParams?.get('q') ?? '';
```

`useSearchParams()` triggers Next.js's CSR bailout, so any page that uses it must be wrapped in `<Suspense>` at the page export level. See `src/app/page.tsx` for the pattern.

---

## What we explicitly don't have

- No Redux, Zustand, Jotai, Recoil, MobX, or Valtio.
- No SWR or TanStack Query — no API to fetch from.
- No localStorage / sessionStorage persistence. Everything wipes on reload.
- No React Server Component data fetching — every page is `'use client'`.
- No suspense boundaries other than the one wrapping pages that read `useSearchParams`.

If a future feature actually needs persistent state, the right move is server actions + a Cloudflare D1 binding + Suspense boundaries on the consumers — not bolting on a client-side store.
