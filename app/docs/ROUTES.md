# Routes

App Router file-system routing. Folder = URL segment, `page.tsx` = the rendered page.

## Route table

| URL pattern                               | File                                                       | Type      | Notes                                                          |
| ----------------------------------------- | ---------------------------------------------------------- | --------- | -------------------------------------------------------------- |
| `/`                                       | `src/app/page.tsx`                                         | Static    | Dashboard. Reads `?q=` for borrower-name filter.               |
| `/?q=<query>`                             | `src/app/page.tsx`                                         | Static    | Same page, filtered by borrower name (case-insensitive).      |
| `/inbox`                                  | `src/app/inbox/page.tsx`                                   | Static    | Two-pane inbox. Reads context for resolved decisions.         |
| `/jobs/<id>`                              | `src/app/jobs/[jobId]/[[...tab]]/page.tsx`                 | Dynamic   | Workbench, defaults to Summary tab.                           |
| `/jobs/<id>/summary`                      | same                                                       | Dynamic   | Summary tab.                                                  |
| `/jobs/<id>/sourcing`                     | same                                                       | Dynamic   | Source-of-funds tab.                                          |
| `/jobs/<id>/sourcing?chain=<chainId>`     | same                                                       | Dynamic   | Pre-selects a chain in the sourcing tab.                      |
| `/jobs/<id>/large-deposits` or `/deposits`| same                                                       | Dynamic   | Large deposits table.                                         |
| `/jobs/<id>/undisclosed`                  | same                                                       | Dynamic   | Undisclosed debts.                                            |
| `/jobs/<id>/audit`                        | same                                                       | Dynamic   | Audit trail with chip filters.                                |
| `/jobs/<id>/coverage`                     | same                                                       | Dynamic   | Coverage / missing months.                                    |
| `/processing/<id>`                        | `src/app/processing/[jobId]/page.tsx`                      | Dynamic   | Fake progress UI for newly-created jobs.                      |
| `/report/<id>`                            | `src/app/report/[jobId]/page.tsx`                          | Dynamic   | 5-page rendered report. Falls back to "not found" if id misses. |
| `/mobile`                                 | `src/app/mobile/page.tsx`                                  | Static    | Phone-frame design preview. Navbar is hidden here.             |

Anything else 404s.

## Dynamic params

The `[[...tab]]` segment under `/jobs/[jobId]` is an **optional catch-all**:

```ts
const params = useParams<{ jobId: string; tab?: string[] }>();
const rawTab = params?.tab?.[0] ?? 'summary';
```

- `/jobs/X` → `params.tab === undefined` → defaults to `'summary'`
- `/jobs/X/audit` → `params.tab === ['audit']`
- `/jobs/X/large-deposits` → `params.tab === ['large-deposits']` (also accept `/deposits`, normalized via tabMap)
- Extra segments (`/jobs/X/sourcing/extra/segments`) match too — extra segments are ignored.

## Reading search params

App Router returns `URLSearchParams` directly from `useSearchParams()` — **not** a `[searchParams, setter]` tuple like react-router did. Always:

```ts
const searchParams = useSearchParams();
const q = searchParams?.get('q') ?? '';
```

`useSearchParams()` triggers Next's CSR bailout. Pages that call it must be wrapped in `<Suspense>` at the page export level. Both `/` (Dashboard) and `/jobs/.../[[...tab]]` (Workbench) do this.

## Navigation

Use `next/link` for declarative nav, `useRouter().push()` for imperative.

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

<Link href="/jobs/LO-2026-04823/audit">Open audit</Link>;

const router = useRouter();
router.push('/inbox');
```

## Hidden nav rules

- The desktop **Navbar** is rendered for every route except `/mobile`. The `ClientShell` checks `usePathname()` and conditionally hides it.
- The workbench **SideNav** is only rendered inside the Workbench (`Layout` shell). It uses `useParams()` to grab the current `jobId` for tab links.

## Adding a new route

1. Create `src/app/<segment>/page.tsx`.
2. If it uses hooks, prefix with `'use client';`.
3. If it reads `useSearchParams()`, wrap the body in a child component and `<Suspense>` it from the default export — see `src/app/page.tsx` for the pattern.
4. If it should hide the Navbar (like `/mobile`), update `ClientShell.tsx`'s `isMobileRoute` check.
5. Add it to this table.
6. Smoke-test: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/<segment>`.
