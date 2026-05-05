# HANDOFF — statement-analyzer-poc

> Crash-recovery prompt. If a new agent picks this up cold, this tells them everything.
> Update this file as you finish meaningful work.

**Last updated:** 2026-05-05
**Branch:** `nextjs-vinext-migration`
**Live URL:** https://my-app.frosty-butterfly-d821.workers.dev
**GitHub:** https://github.com/awilliamsevrylo/statement-analyzer-poc (private)

---

## What this app is

Evrylo statement-analyzer-poc — an AI loan-officer assistant for mortgage bank-statement review. **No backend.** Single seeded borrower (Marcus Chen, `LO-2026-04823`). Stack: Next.js 16 App Router on **vinext** (Vite-based) deployed to Cloudflare Workers. Brand orange `#eb7230`.

For the full picture: read [README.md](../README.md), then [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), then [CLAUDE.md](../CLAUDE.md).

---

## What's been shipped (recent → older)

1. **Documentation pass** — README + CLAUDE.md + docs/ tree (architecture, routes, data model, inbox, components, state, style, deploy, testing).
2. **Inbox CTAs wired** (steps 4–6 of designer's implementation prompt) — decision options resolve via `AppContext.resolvedDecisions`, Navbar unread badge updates instantly, "Yes/No" appends follow-up `agent-outbound` events, "Chat" navigates to workbench, "View full report" and "Email borrower/realtor" all wired.
3. **`forward-realtor` email template** — added to `EmailModal`. To/Cc now editable.
4. **Export-trail download bug fixed** — Sourcing tab JSON download. Anchor needed `appendChild` before `.click()`.
5. **Primary noun flip** — "files" → "borrowers" across user-facing copy (dashboard h1, stats, empty state, navbar nav, search placeholder, sidenav eyebrow). Internal `dashboardFiles` variable kept.
6. **Inbox steps 1–3** (data + components + page) — `data/inbox.ts`, `components/inbox/{AgentEmailCard, AgentDecisionBlock, AgentReportBlock, AgentOutboundCard, ThreadView}.tsx`, `app/inbox/page.tsx`. Navbar Inbox link with rose unread badge.
7. **Cloudflare deploy** — `vinext deploy` wired. `wrangler.jsonc` + `worker/index.ts` generated. Live.
8. **Vite + RR → Next.js + vinext migration** — `src/pages/` → `src/app/`, react-router-dom replaced with next/navigation, `'use client'` everywhere, configs updated (single `tsconfig.json`, `tailwind.config.cjs`, `postcss.config.cjs`, `next.config.js`, `vite.config.ts`).

---

## What's pending

### Real bugs left

None known as of this handoff. The QA round (5 antagonistic ChatGPT Agent jobs) surfaced 7 findings, all addressed. Some QA "findings" were false positives (POC limitations, agent confusion).

### Deferred features (designer's implementation prompt §10 explicitly said to stop after step 3)

These were intentionally skipped pending visual review of steps 1–3. The user approved and we wired them in subsequent commits:
- ✅ Decision-resolution side effects
- ✅ Coverage-banner "I'll forward statements" button → no, this was *not* wired. The Summary tab's `onRequestStatement` opens the EmailModal with `request-statements` template (which is correct), but there's no separate "I'll forward statements" button that simulates an inbound forward. This is still pending.
- ✅ EmailModal editable Cc + new `forward-realtor` template

### Known design debt

- **Responsive design** — desktop UI doesn't reflow at narrow widths. The `/mobile` route is a desktop preview, not a real responsive view. The user's Cloud Design agent is producing mockups for 375 / 768 / 1280 viewports; once those land, implementation is a separate sprint.
- **`worker/index.ts` TS error** — `Fetcher` type unknown. Cosmetic — build/deploy succeed. Fix: `npm install -D @cloudflare/workers-types` + add to tsconfig types.
- **Unused dependencies** — `react-day-picker`, `embla-carousel-react`, `recharts`, `cmdk`, `vaul`, `sonner`, several `@radix-ui/*` are still in `package.json` from the shadcn era. Tree-shaken at build, but `npm uninstall` would clean them up.

---

## How to run / deploy

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run deploy       # ship to Cloudflare Workers
```

Auth state on this machine:
- `gh auth status` → `awilliamsevrylo` active.
- `wrangler whoami` → `andrew@evrylo.com`.

---

## Recent commits on this branch

```
bb23172  wire inbox CTAs, fix export-trail download, add forward-realtor template
8a2ebc8  flip primary noun from "files" to "borrowers" in user-facing copy
3b5ae1f  inbox patterns E/F/G: data, blocks, ThreadView, /inbox page
16cac12  add Cloudflare Workers deploy via vinext
2edad6d  migrate Vite + React Router → Next.js App Router on vinext
5290c8d  wire navbar search, banner dismissal, trace navigation, and report content (on main)
```

---

## Quick map for cold pickup

- "What does this app do?" → [README.md](../README.md)
- "How do I run / deploy?" → [docs/DEPLOY.md](../docs/DEPLOY.md)
- "Why this stack?" → [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- "Where do routes live?" → [docs/ROUTES.md](../docs/ROUTES.md)
- "What components are available?" → [docs/COMPONENTS.md](../docs/COMPONENTS.md)
- "What's the data model?" → [docs/DATA_MODEL.md](../docs/DATA_MODEL.md)
- "How does /inbox work?" → [docs/INBOX.md](../docs/INBOX.md)
- "How does state flow?" → [docs/STATE.md](../docs/STATE.md)
- "How do I style something?" → [docs/STYLE.md](../docs/STYLE.md)
- "How do I QA?" → [docs/TESTING.md](../docs/TESTING.md)
- "How do I work with Andrew?" → [CLAUDE.md](../CLAUDE.md)
