# CLAUDE.md — agent context for the Evrylo statement-analyzer-poc

> Read this on first touch. The user expects you to know what's in here.

## Working with Andrew

- **He uses voice-to-text** because of finger injuries. Transcripts have artifacts. If something doesn't make sense, ask — don't silently interpret.
- **Don't glaze him.** He asks for honest feedback. Push back when he's wrong. He explicitly said: "I want to improve."
- **He's fast and interrupts.** New directions land mid-task. If you're 30 seconds from proving something, say so. Don't silently pivot.
- **Never suggest stopping or wrapping up.** He'll tell you when he's done. If you're waiting on a background job, ask what to work on next, not whether to stop.
- **Cuts the preamble.** Keep responses tight. State results and decisions directly.

## Project shape (one-paragraph)

Evrylo statement-analyzer-poc. **React 19 + TypeScript (strict) + Tailwind v3 + Next.js 16 App Router running on vinext (Vite 8) deployed to Cloudflare Workers.** No backend. No auth. Single seeded borrower (Marcus Chen, `LO-2026-04823`). Data lives in `src/data/*.ts`. Brand orange is `#eb7230`. The full doc tree is at `docs/`.

## Hard constraints

- **No new color tokens.** Only the slate / orange / emerald / amber / rose / sky palette already in `BADGE_TONES`.
- **No new font.** Geist + Geist Mono only.
- **No new icon library.** If you need an icon that isn't on `I.*` in `src/components/UI.tsx`, add it there. Don't import lucide-react ad hoc.
- **No new component library.** Use the primitives in `src/components/UI.tsx` (`Btn`, `Badge`, `Card`, `SeverityBadge`, `ConfidenceBar`).
- **Don't add `'use client'` to presentational files** (UI.tsx, anything in `src/data/`, `src/lib/utils.ts`). Only files that actually use hooks/state/event handlers need it.
- **Don't reintroduce `react-router-dom`.** The whole project migrated to `next/navigation` + `next/link`. Mixing them breaks SSR.
- **Don't reintroduce `src/components/ui/`** (shadcn boilerplate). It used Tailwind v4 syntax that doesn't compile on v3 and the app never imported any of it.
- **Don't add new top-level dependencies casually.** Each one risks the vinext / Vite 8 / Cloudflare Workers compatibility chain. Check the docs first.

## Development workflow

```bash
npm run dev      # vinext dev — http://localhost:3000
npm run build    # vinext build (RSC + SSR + client + worker)
npm run deploy   # build + ship to Cloudflare Workers
```

Fallback if vinext breaks: `npm run dev:next` runs Next.js directly (Turbopack).

After every group of edits: `npx tsc --noEmit` (build is also fine). The known `worker/index.ts` `Fetcher` type error is a vinext-generated cosmetic issue — `npm run build` succeeds despite it.

## Where things live

- **Routes** → `src/app/*/page.tsx`. See [docs/ROUTES.md](./docs/ROUTES.md).
- **UI primitives** → `src/components/UI.tsx`. See [docs/COMPONENTS.md](./docs/COMPONENTS.md).
- **Mock data** → `src/data/*.ts`. See [docs/DATA_MODEL.md](./docs/DATA_MODEL.md).
- **Cross-page state** (NewAnalysis modal trigger, Inbox decision resolutions) → `src/app/_components/AppContext.tsx`, owned by `ClientShell.tsx`. See [docs/STATE.md](./docs/STATE.md).
- **Inbox patterns E/F/G** → `src/components/inbox/` and `src/data/inbox.ts`. See [docs/INBOX.md](./docs/INBOX.md).
- **Email templates** → `src/components/modals/EmailModal.tsx`'s `buildTemplates()`.

## Things that are intentionally fake / not bugs

- `/jobs/<anything>` always shows Marcus. There's no real lookup.
- "Send & log" in EmailModal flips a UI pill — no real send.
- "Run analysis" is a 30-second fake progress bar.
- "Trace", "Mark sourced", "Waive" mutate local state only.
- The "SS" avatar is a decorative `<div>`. Not a profile menu.
- Dashboard column headers don't sort. They're plain `<th>`s, no onClick.

If a QA agent flags any of these as bugs, they're false positives.

## Memory + handoff

- `.memory/HANDOFF.md` is the crash-recovery prompt. Update it when you finish meaningful work. The user has a global hook system that pings you to keep it current.
- `.memory/` is committed to git. Don't put secrets there.

## Deploy gotchas

- The Worker is named `my-app` (default from `package.json`'s `"name"`). Renaming requires both `package.json#name` and `wrangler.jsonc#name`.
- `npx vinext deploy` regenerates `worker/index.ts` and `wrangler.jsonc` if missing. Don't delete those by accident.
- `vite.config.ts` MUST include the `cloudflare()` plugin with `viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }`. vinext refuses to deploy without it.
- The Cloudflare account is `andrew@evrylo.com`. `wrangler whoami` confirms.

## Last known good state

See `.memory/HANDOFF.md` for what was last shipped and what's pending.
