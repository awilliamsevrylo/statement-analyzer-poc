# Testing

There is no automated test suite. The POC has been QA'd via:

1. **TypeScript strict mode** — `npx tsc --noEmit` catches type errors. Build does too.
2. **Smoke tests via curl** — quick HTTP-200 sweep across all routes.
3. **ChatGPT Agent QA rounds** — naive-user browser walkthroughs (`/chatgpt-agent-qa` skill).

If/when this becomes a real product, the path is **Vitest + React Testing Library** for components and **Playwright** for E2E. For now, the smoke + agent QA loop is the bar.

---

## Smoke test sweep

```bash
npm run dev &
sleep 8
for url in "/" "/?q=marcus" "/?q=zzznoresult" \
          "/inbox" \
          "/jobs/LO-2026-04823" \
          "/jobs/LO-2026-04823/sourcing" \
          "/jobs/LO-2026-04823/sourcing?chain=chain-14k" \
          "/jobs/LO-2026-04823/large-deposits" \
          "/jobs/LO-2026-04823/audit" \
          "/jobs/LO-2026-04823/coverage" \
          "/processing/LO-2026-05001" \
          "/report/LO-2026-04823b" \
          "/report/does-not-exist" \
          "/mobile"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$url")
  echo "$CODE  $url"
done
```

All should be 200 (including `/report/does-not-exist` — that page renders the "Report not found" fallback).

To smoke-test prod: replace `localhost:3000` with `my-app.frosty-butterfly-d821.workers.dev`.

---

## ChatGPT Agent QA

We use the `chatgpt-agent-qa` skill to launch naive-user browser walkthroughs. Five rounds we've found useful:

| Round              | Model    | Focus                                                         |
| ------------------ | -------- | ------------------------------------------------------------- |
| Visual nitpick     | pro      | Find duplicate icons, alignment off-by-1, copy inconsistencies |
| Inbox stress test  | pro      | Click every CTA, find unwired buttons                         |
| Bogus features     | thinking | Ask for things that don't exist (dark mode, sort) — see if app silent-lies |
| URL fuzzing        | thinking | Edge URLs, malformed input, XSS check                         |
| Brute walkthrough  | instant  | Click every button at least once                              |

Pro mode in agent mode typically takes 8–15 min per round. Instant in agent mode: 3–8 min. The instant model can occasionally get stuck in verbose narration loops — abandon after ~15 min and rerun.

### Known false-positive patterns

QA agents don't know our POC behavior. These complaints are *not* bugs:

- "`/jobs/<long-string>` leaks borrower data" — we always render Marcus because there's no real data lookup.
- "`/random-page` shows the inbox" — likely the agent navigated back into `/inbox` after a 404 and conflated states. The 404 itself works.
- "Sort headers fake-respond" — `<th>` elements have no `onClick`. Agent mistook browser default cell focus for a sort highlight.
- "SS avatar looks clickable" — it's a `<div>` with no cursor-pointer, no hover, no menu. Agent hallucinated a dropdown.

### Real-bug patterns (worth fixing)

- Dead CTAs (button exists, click does nothing) — these are silent lies. Fix by wiring or removing.
- Missing empty states — pages that show stale data when they should say "nothing yet".
- Stuck loading spinners — anything that animates forever.
- Form fields that say `readOnly` but look editable.
- Unread badges that don't clear when the user has clearly seen the thing.

---

## Manual click-through scenarios

Run these by hand before any deploy that touches the relevant flow.

### Dashboard

- [ ] `/` → 8 borrower rows, 4 stats above.
- [ ] Type `marcus` in Navbar search → enter → URL becomes `/?q=marcus`, table filters to one row, stats recompute.
- [ ] `/?q=zzznoresult` → "No borrowers match `zzznoresult`." empty state.
- [ ] Click each filter chip (All / Processing / Needs review / Completed / Failed) — table updates.
- [ ] Click a `failed` row's primary action → opens NewAnalysisModal (retry).

### Workbench

- [ ] Click into Marcus's row → `/jobs/LO-2026-04823` → Summary tab default.
- [ ] Click each SideNav tab → URL updates → content renders.
- [ ] Summary tab: amber "Statement gap detected" banner shows.
- [ ] Click "I'll handle it" → banner disappears.
- [ ] Refresh → banner reappears.
- [ ] Click "Request from borrower" → EmailModal opens with `request-statements` template.
- [ ] Sourcing tab: 3 chain cards on left. Click each — right pane updates.
- [ ] Sourcing tab: click "View evidence" on any node → text appears, button label flips to "Hide evidence".
- [ ] Sourcing tab: click "Export trail" → JSON file downloads (`chain-XXX-trail.json`).
- [ ] Sourcing tab: navigate directly to `?chain=chain-zelle` → Zelle chain pre-selected on load.
- [ ] Large Deposits tab: "Trace" on the unsourced row → `/jobs/.../sourcing?chain=chain-14k` opens with chain pre-selected.
- [ ] Audit tab: type in search → table filters. Click ✕ → clears.
- [ ] Audit tab: click "Undisclosed debt" chip → only undisclosed-debt rows.
- [ ] Audit tab: expand a row → Source / Disposition / Reason details.

### Inbox (the new bit)

- [ ] `/inbox` → Marcus thread with 5 events; 2 ghosted threads below.
- [ ] Filter chips: All shows everything; "Needs decision" shows only Marcus (until resolved); "Awaiting borrower" shows empty stub.
- [ ] Navbar "Inbox" link has rose `1` badge.
- [ ] Click "Yes — it's a gift" → option gets a "Selected" pill, all options disable, a new outbound email card appears appended to the thread, Navbar `1` badge clears.
- [ ] Refresh → state wipes (POC behavior).
- [ ] After resolving, click "Chat with me" → navigates to `/jobs/LO-2026-04823`.
- [ ] Click "View full report ↗" in the report card → `/report/LO-2026-04823`.
- [ ] Click "Email borrower" → EmailModal opens with `sourcing` template.
- [ ] Click "Email realtor" → EmailModal opens with `forward-realtor` template, To = jordan@bayrealtygroup.com, Cc populated and editable.

### Report

- [ ] `/report/LO-2026-04823b` → 5 page-shaped cards in order: Cover / Income / Deposits / Debts / Coverage.
- [ ] Cover page shows borrower name and loan number.
- [ ] `/report/does-not-exist` → "Report not found." with "Back to dashboard" link.

### Mobile preview

- [ ] `/mobile` → no Navbar, centered phone frame, footer caption.

### Disabled nav

- [ ] Click "Templates" → URL stays put, no console error, cursor `not-allowed`.
- [ ] Same for "Settings".

---

## Type checking

```bash
npx tsc --noEmit
```

The known `worker/index.ts:13:11` `Fetcher` type error is harmless — vinext build/deploy ignore it. Fix when you have time: `npm install -D @cloudflare/workers-types`, then add `"types": ["@cloudflare/workers-types"]` to `tsconfig.json#compilerOptions`.

## Lint

```bash
npm run lint
```

Currently passes clean. Don't ignore lint errors casually — most are real.
