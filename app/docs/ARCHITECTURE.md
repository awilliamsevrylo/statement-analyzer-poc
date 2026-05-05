# Architecture

## One-paragraph summary

The app is a Next.js 16 App Router project that's run by **vinext** (a Vite-based Next.js reimplementation) instead of the native Next.js compiler. It deploys to **Cloudflare Workers** via `vinext deploy`, which generates a Worker entry that uses `@cloudflare/vite-plugin` to host the RSC + SSR + client environments inside `workerd`. There is **no backend** — every page is a client component (`'use client'`) that reads from hardcoded data in `src/data/*.ts`. Cross-page state (the NewAnalysis modal trigger, resolved Inbox decisions) lives in a single React Context provided by `ClientShell` at the App Router root.

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ src/app/layout.tsx  (Server Component)                  │     │
│  │   └─ ClientShell  ('use client')                        │     │
│  │       ├─ AppContext.Provider                            │     │
│  │       │   { openNewAnalysis, resolvedDecisions, ... }   │     │
│  │       ├─ Navbar (consumes ctx for unread badge)         │     │
│  │       ├─ {children}  →  src/app/<route>/page.tsx        │     │
│  │       └─ NewAnalysisModal (when triggered)              │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP / Worker fetch handler
                              │
┌──────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker (my-app)                                      │
│                                                                  │
│  worker/index.ts                                                 │
│    ├─ image optimization handler (IMAGES binding, unused)        │
│    └─ vinext/server/app-router-entry  →  RSC + SSR + assets      │
│                                                                  │
│  Bindings: ASSETS (static files), IMAGES (Cloudflare Images)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Why this stack

This was a Vite + React Router 7 SPA before. The user wanted **Cloudflare Workers**
deploy with **Next.js conventions**. The pipeline:

1. Migrated Vite + RR → Next.js 16 App Router (one-time refactor).
2. Layered vinext on top — keeps Vite's dev-server speed but speaks Next.js's API surface (`next/navigation`, `next/link`, app/, layout.tsx, server/client component split).
3. `@cloudflare/vite-plugin` ships the build to Workers natively. `vinext deploy` orchestrates wrangler.

### Why NOT…

- **Next.js native compiler (Turbopack)?** It works (`npm run dev:next` and `npm run build:next` are kept as fallbacks), but you can't deploy it to Cloudflare Workers without OpenNext or a similar adapter. vinext is one less moving piece.
- **OpenNext (`@opennextjs/cloudflare`)?** Documented Cloudflare path. Works fine. We chose vinext because the deploy is one command and the dev server is faster. If vinext maturity bites us, OpenNext is the documented fallback (same App Router source, swap deploy scripts).
- **HashRouter / SPA?** Required for static-only hosting. We have a real Worker now and want clean URLs.
- **Pages Router?** Older Next.js convention. App Router is where Next is going and lines up cleaner with future server actions / streaming if we add a backend.

---

## File-system routing

App Router conventions. Folder = URL segment, `page.tsx` = the rendered page.

| URL                            | File                                              |
| ------------------------------ | ------------------------------------------------- |
| `/`                            | `src/app/page.tsx`                                |
| `/inbox`                       | `src/app/inbox/page.tsx`                          |
| `/jobs/[jobId]/[[...tab]]`     | `src/app/jobs/[jobId]/[[...tab]]/page.tsx`        |
| `/processing/[jobId]`          | `src/app/processing/[jobId]/page.tsx`             |
| `/report/[jobId]`              | `src/app/report/[jobId]/page.tsx`                 |
| `/mobile`                      | `src/app/mobile/page.tsx`                         |

`[[...tab]]` is an **optional catch-all**. `params.tab` is `string[] | undefined`. We default the first segment to `'summary'` if absent. See `src/app/jobs/[jobId]/[[...tab]]/page.tsx`.

The single root layout (`src/app/layout.tsx`) is a **server component** that wraps everything in `ClientShell` (a client component that owns global UI state). Every leaf `page.tsx` declares `'use client'` because none of them do server-side work.

For the full route reference see [ROUTES.md](./ROUTES.md).

---

## State management

Three layers:

1. **Module-scope mock data** — `src/data/*.ts`. Read-only at runtime. Never mutated.
2. **AppContext** (`src/app/_components/AppContext.tsx`) — owned by `ClientShell`, holds:
   - `openNewAnalysis: () => void` — Navbar + Dashboard call this; ClientShell shows the NewAnalysisModal.
   - `resolvedDecisions: Record<string, 'yes' | 'no' | 'chat'>` — keyed by Inbox decision-event id. Inbox writes; Navbar reads (drives the rose unread-count badge).
   - `setResolvedDecision(eventId, choice)` — Inbox calls this when the user taps a decision option.
3. **Local `useState`** in pages and components for ephemeral UI (filter chips, expanded month, search query, modal-open flags). Resets on navigation.

There is **no Redux, no Zustand, no SWR.** Don't add one without a real reason.

For the full state reference see [STATE.md](./STATE.md).

---

## Build / deploy

Local dev (no Cloudflare):
```bash
npm run dev   # vite + vinext, http://localhost:3000
```

Production build:
```bash
npm run build   # 5-stage build:
                #   1. analyze client references
                #   2. analyze server references
                #   3. build rsc environment
                #   4. build client environment
                #   5. build ssr environment
```

Deploy:
```bash
npm run deploy   # vinext deploy → wrangler deploy → live in ~10s
```

Build artifacts go to `dist/` (gitignored). Cloudflare's per-Worker bundle limit is 10 MB on paid; we're at ~1.5 MB / 330 KB gzip.

For the full deploy reference see [DEPLOY.md](./DEPLOY.md).

---

## Key dependencies and what each does

| Package                                | Why                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `next`                                 | Type definitions, runtime shims for `next/navigation`, `next/link`, etc.   |
| `vinext`                               | The Vite-based runtime that interprets the Next.js conventions             |
| `vite`                                 | Vite 8 — vinext is a Vite plugin, so we need a real Vite                   |
| `@vitejs/plugin-react`                 | React fast-refresh in dev                                                  |
| `@vitejs/plugin-rsc`                   | React Server Components support inside Vite                                |
| `react-server-dom-webpack`             | RSC payload encoder/decoder (yes, "webpack" in the name — it's framework-agnostic) |
| `@cloudflare/vite-plugin`              | Runs the RSC + SSR environments inside `workerd` locally and at deploy    |
| `wrangler`                             | The Cloudflare Workers CLI (used by `vinext deploy`)                       |
| `tailwindcss` (v3)                     | Styling                                                                     |
| `react` / `react-dom`                  | React 19                                                                    |
| `@radix-ui/*`                          | Used to be needed for shadcn primitives. Now unused but kept because some are imported by removed code that we haven't pruned yet. |
| `lucide-react`                         | Same — was used by removed shadcn ui/. Our `I` icon set in UI.tsx is hand-rolled SVG. |

---

## What we removed during the migration

- `react-router-dom`, `@vitejs/plugin-react` (replaced by vinext's bundled version), `plugin-inspect-react-code`.
- `src/main.tsx`, `src/App.tsx`, `src/App.css`, `index.html` — App Router replaces all of this.
- `src/pages/` — moved into `src/app/`.
- `src/components/ui/` (shadcn boilerplate) — was unused and used Tailwind v4 syntax incompatible with our v3.
- `tsconfig.app.json` + `tsconfig.node.json` — collapsed into a single `tsconfig.json`.
- `vite.config.ts` was rewritten to use vinext + Cloudflare plugin.

If you find references to any of those, something's stale.

---

## Decision log

### D1 — App Router over Pages Router

App Router is current Next.js practice (16+) and gives us file-based layouts and server components for free. Pages Router would have been closer to the original React Router structure but is the legacy path. **Cost**: every page needs `'use client'` since we're 100% client-side. **Benefit**: no rewrites if we add server actions later.

### D2 — All pages are client components

The app has no backend, no auth, no database calls — there's nothing for a server component to do. Marking every leaf `page.tsx` `'use client'` keeps the model simple. The single server component is `layout.tsx`, which sets `<html>`/`<body>` and renders the `ClientShell`.

**Implication**: `useSearchParams()` triggers Next's CSR bailout for static rendering. We wrap pages that read it (Dashboard, Workbench) in `<Suspense>` per Next.js docs.

### D3 — AppContext over module-scope mutable store

The implementation prompt suggested a "tiny module-level mutable store". We went with React Context instead because the unread-count badge needs to re-render when state changes — a module mutation alone doesn't trigger React's render cycle. Context is the idiomatic path and adds ~10 lines.

### D4 — Tailwind v3, not v4

shadcn/ui's CLI generated v4-style class strings (`var(--spacing(N))` etc.). v3 can't compile those. Rather than upgrade Tailwind (which would cascade to the rest of the app), we deleted the unused shadcn `ui/` directory. The app's actual primitives are in `src/components/UI.tsx` and don't use any v4 syntax.

### D5 — Worker name `my-app`

Default from `package.json#name`. Not changed because the URL `my-app.frosty-butterfly-d821.workers.dev` is fine for a POC. To rename: edit both `package.json#name` and `wrangler.jsonc#name`, then `npm run deploy`.

### D6 — `[[...tab]]` over multiple sibling segments

We could have done `src/app/jobs/[jobId]/summary/page.tsx`, `.../sourcing/page.tsx`, etc. The optional catch-all is a single page with a switch on `params.tab?.[0]`. Trade-off: harder to add tab-specific layouts later, but easier to share state across tabs (which we do — the email modal lives at the page level and is opened by handlers passed into each tab component).

---

## Known issues / pre-existing debt

- `worker/index.ts` has a TS error for `Fetcher` type. Cosmetic — vinext build/deploy succeed. Fix: `npm install -D @cloudflare/workers-types` and reference it in `tsconfig.json#compilerOptions.types`.
- `react-day-picker`, `embla-carousel-react`, `recharts`, `cmdk`, `vaul`, `sonner`, etc. are still in `dependencies` from the shadcn era. Nothing imports them. Safe to `npm uninstall` if anyone wants to trim node_modules. Not a runtime cost (tree-shaken).
- The five mobile screens at `src/components/mobile/*.tsx` are pre-migration code dumped through the `'use client'` script. Some of them have `'use client'` but no actual hooks/state. Harmless, just noise.

---

## Future-work breadcrumbs

- If the app grows a real backend, the right move is server actions (App Router native) — not a separate API route folder. The `'use client'` boundary at `ClientShell` is already the place to swap from "context-driven mock" to "server-action-driven".
- If we want a real PDF parser, run it in a separate Worker with a queue or D1 binding rather than bolting it onto `my-app`.
- Cloudflare Images binding is wired but unused. If you ever serve uploaded statements as images, the worker entry already has the optimization handler.
