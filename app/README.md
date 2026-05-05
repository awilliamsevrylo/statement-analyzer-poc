# Evrylo — Statement Analyzer POC

> AI loan officer assistant for mortgage underwriting bank-statement analysis.
> Demo / proof-of-concept. No backend, no real auth, no real data writes.

**Live:** https://my-app.frosty-butterfly-d821.workers.dev

[![Cloudflare Workers](https://img.shields.io/badge/runtime-Cloudflare%20Workers-orange)](https://workers.cloudflare.com/)
[![Next.js on vinext](https://img.shields.io/badge/framework-Next.js%20on%20vinext-black)](https://github.com/cloudflare/vinext)
[![Tailwind v3](https://img.shields.io/badge/styles-Tailwind%20v3-38bdf8)](https://tailwindcss.com/)
[![React 19](https://img.shields.io/badge/react-19-61dafb)](https://react.dev/)

---

## What this is

A scoped UI prototype of a mortgage-LO workflow for analyzing borrower bank
statements: dashboard → workbench (six tabs) → final report → email loop.
The single seeded borrower is **Marcus Chen** on `LO-2026-04823`. All data
lives statically in `src/data/*.ts`.

The app demonstrates three email-driven agent patterns visible at `/inbox`:

- **E — Boolean decision.** Agent flags an ambiguous deposit, replies to
  Steph with one-tap reply buttons.
- **F — Forward → analysis report.** Steph forwards statements to the loan
  email, agent replies with a structured findings card.
- **G — Forward to a third party.** Agent ghost-writes to a realtor and CCs
  the borrower + the loan address so replies stay tracked.

See [docs/INBOX.md](./docs/INBOX.md) for the full pattern reference.

---

## Quickstart

```bash
npm install
npm run dev          # vinext dev server (Vite 8 with Next.js compatibility shims)
```

Open http://localhost:3000.

| Script               | What it does                                     |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | vinext dev server (HMR, RSC + SSR + client)      |
| `npm run build`      | Production build via `vinext build`              |
| `npm run start`      | Local production server                          |
| `npm run deploy`     | Build + deploy to Cloudflare Workers             |
| `npm run lint`       | ESLint via `next lint`                           |
| `npm run dev:next`   | Run Next.js directly (fallback if vinext broken) |
| `npm run build:next` | Same, for builds                                 |

---

## Repo layout

```
app/
├── src/
│   ├── app/                              # Next.js App Router pages
│   │   ├── layout.tsx                    # RootLayout (server) — wraps in ClientShell
│   │   ├── globals.css                   # Tailwind + CSS variables (Geist font)
│   │   ├── page.tsx                      # Dashboard (/)
│   │   ├── _components/
│   │   │   ├── AppContext.tsx            # NewAnalysis modal + resolved-decisions context
│   │   │   └── ClientShell.tsx           # 'use client' wrapper that owns global state
│   │   ├── inbox/page.tsx                # /inbox
│   │   ├── jobs/[jobId]/[[...tab]]/page.tsx   # Workbench (6 tabs via optional catch-all)
│   │   ├── processing/[jobId]/page.tsx
│   │   ├── report/[jobId]/page.tsx
│   │   └── mobile/page.tsx               # Phone-frame preview (desktop page)
│   ├── components/
│   │   ├── UI.tsx                        # Btn, Badge, Card, SeverityBadge, ConfidenceBar, I, cls, fmt*
│   │   ├── Navbar.tsx                    # Top nav (Borrowers · Inbox · Templates · Settings)
│   │   ├── SideNav.tsx                   # 260px workbench sub-nav
│   │   ├── Layout.tsx                    # Two-column shell used by Workbench
│   │   ├── tabs/                         # AuditTab, CoverageTab, UndisclosedTab
│   │   ├── modals/                       # EmailModal, NewAnalysisModal
│   │   ├── inbox/                        # AgentEmailCard + 3 block components + ThreadView
│   │   └── mobile/                       # Mock 390×844 phone-frame screens
│   ├── data/
│   │   ├── borrower.ts                   # Marcus Chen scenario
│   │   ├── dashboard.ts                  # File list + status meta
│   │   ├── inbox.ts                      # ThreadEvent types + Marcus seed
│   │   └── mobile.ts                     # /mobile preview data
│   ├── hooks/
│   └── lib/
├── worker/index.ts                       # Auto-generated Cloudflare Worker entry
├── docs/                                 # See ./docs/
├── vite.config.ts                        # vinext + @cloudflare/vite-plugin
├── wrangler.jsonc                        # Worker config
├── next.config.js                        # Next.js feature flags
├── tailwind.config.cjs                   # Tailwind v3 (.cjs because type=module)
├── postcss.config.cjs                    # Same
├── tsconfig.json                         # Single-file TS config
└── package.json
```

For a deeper architectural overview see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Tech stack

- **React 19** + **TypeScript (strict)**
- **Next.js 16** App Router — file-system routing, server components, `'use client'` directives
- **vinext** — runs Next.js's API surface on Vite 8 instead of Webpack/Turbopack. Lets us deploy directly to Cloudflare Workers with one command (`vinext deploy`).
- **Tailwind v3** — kept on v3 because the shadcn/ui boilerplate (since removed) used Tailwind v4 syntax that wouldn't compile on v3.
- **Cloudflare Workers** — the production target. `@cloudflare/vite-plugin` runs the RSC + SSR environments inside `workerd` locally, so `import { env } from "cloudflare:workers"` works in dev too.
- **react-router-dom** is **NOT** used. We migrated off of HashRouter to App Router conventions.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for why each piece was chosen.

---

## Documentation map

| Doc                                              | Read it when…                                      |
| ------------------------------------------------ | -------------------------------------------------- |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)   | You want the full system picture and why-decisions |
| [docs/ROUTES.md](./docs/ROUTES.md)               | You're adding/changing a route                     |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md)       | You're using or extending a UI primitive           |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md)       | You're adding mock data or a new entity            |
| [docs/INBOX.md](./docs/INBOX.md)                 | You're touching `/inbox` or the agent-email cards  |
| [docs/STATE.md](./docs/STATE.md)                 | You're wiring cross-component state                |
| [docs/STYLE.md](./docs/STYLE.md)                 | You're picking a color, badge tone, or icon        |
| [docs/DEPLOY.md](./docs/DEPLOY.md)               | You're shipping changes to Cloudflare              |
| [docs/TESTING.md](./docs/TESTING.md)             | You're running QA on the live deploy               |
| [.memory/HANDOFF.md](./.memory/HANDOFF.md)       | You're picking the project up cold                 |
| [CLAUDE.md](./CLAUDE.md)                         | You're an AI agent working on this repo            |

---

## What this POC explicitly does NOT do

- **No backend, no API.** All data is hardcoded TypeScript in `src/data/*.ts`. Every "save", "send", "trace", and "request" is local state that resets on page reload.
- **No auth.** The "SS" avatar is decorative. There's no sign-in, no session, no user model.
- **No real PDF parsing.** The "New analysis" upload flow is a fake animated progress bar.
- **No real email delivery.** The EmailModal "Send & log" button just shows a sent-state pill.
- **No real Cloudflare image optimization** even though we have an `IMAGES` binding declared.
- **No real responsive design.** The desktop UI doesn't reflow at narrow widths beyond what Tailwind defaults give for free. The `/mobile` route is a *desktop* page that displays a fake phone-frame preview component, not a real responsive view.

---

## License

Private. Internal Evrylo prototype.
