# Style guide

## Brand

- **Primary orange:** `#eb7230` (Tailwind class: `bg-[#eb7230]`, `text-[#eb7230]`, `hover:bg-[#d96526]`).
- Used **only** on primary CTAs and the top-left `E` brand block. Don't sprinkle it.

## Color palette

Strictly slate / orange / emerald / amber / rose / sky. No new tokens.

| Tone        | Use                                              | Example tailwind                              |
| ----------- | ------------------------------------------------ | --------------------------------------------- |
| `slate-*`   | Body text, borders, neutral backgrounds          | `text-slate-700`, `border-slate-200`          |
| `[#eb7230]` | Brand orange                                      | `bg-[#eb7230]`, `text-[#eb7230]`              |
| `orange-*`  | Brand-adjacent surfaces (active sidebar, gradients) | `bg-orange-50`, `ring-orange-300`         |
| `emerald-*` | Success / sourced / pass                          | `text-emerald-700`, `bg-emerald-50/40`        |
| `amber-*`   | Warning / needs decision / pending letter         | `bg-amber-50`, `border-amber-200`             |
| `rose-*`    | Critical / unsourced / failed                     | `text-rose-700`, `bg-rose-50/40`              |
| `sky-*`     | Info / below threshold                            | `text-sky-600`, `bg-sky-50`                   |
| `blue-*`    | Reserved for the `rent` badge tone only           | `bg-blue-50 text-blue-700`                    |

The `BADGE_TONES` map in `src/components/UI.tsx` is the single source of truth. To add a tone, edit that map.

## Typography

- **Sans:** Geist (CDN-loaded in `globals.css`).
- **Mono:** Geist Mono — for loan numbers, account last4s, currency tabular-nums.
- **No display font.** Don't pull in Fraunces / Inter / anything else.

| Use case          | Class set                                                   |
| ----------------- | ----------------------------------------------------------- |
| Page H1           | `text-xl font-semibold text-slate-900`                      |
| Section heading   | `text-base font-semibold text-slate-900`                    |
| Eyebrow / kicker  | `text-xs font-medium uppercase tracking-wide text-slate-500` |
| Body              | `text-sm text-slate-700` (or `text-slate-800` for emphasis) |
| Email body        | `text-[14px] leading-relaxed text-slate-800`                |
| Email meta line   | `text-[11px] text-slate-600`                                |
| Microcopy / hint  | `text-[10px]–[11px] text-slate-400/500`                     |
| Tabular numerics  | add `tabular-nums` (or use the `tabular-nums` utility class — defined in `globals.css`) |
| Mono content      | `font-mono`                                                 |

## Spacing

- **Cards:** `rounded-xl border border-slate-200 bg-white shadow-sm`. Always go through `<Card>` from UI.tsx.
- **Standard padding:** `px-7 py-5` for page-level header bars; `px-6 py-4`, `px-5 py-4`, or `p-4`/`p-5` for cards.
- **Grid gaps:** `gap-3` for KPI strips, `gap-4` for tables, `space-y-4` between major sections.
- **Border radius:** `rounded-lg` for inline chips, `rounded-xl` for cards, `rounded-full` for pill badges.

## Tone tiles (Pattern F report grid)

When showing colored summary tiles (e.g. Sourced / New flags / Still missing):

```tsx
<div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5">
  <div className="text-[9px] font-semibold uppercase text-emerald-700">SOURCED</div>
  <div className="mt-1 text-[18px] font-bold leading-none tabular-nums text-emerald-700">+$72k</div>
</div>
```

Always `*-200` border + `*-50/40` (or `/50`) fill. Never solid `*-100` fills — they're too saturated and clash with the slate backgrounds.

## Buttons

Use `<Btn variant="…">` from UI.tsx. Don't roll bespoke buttons.

| Variant       | When                                                      |
| ------------- | --------------------------------------------------------- |
| `primary`     | The single most important CTA on the screen              |
| `secondary`   | Default for most clickable affordances                    |
| `ghost`       | Tertiary; row actions, "I'll handle it"                   |
| `danger`      | Destructive (delete, dismiss); rare in this app           |
| `success`     | Confirm / "Mark sourced"; rare                            |

For row-level dense buttons: `className="h-7 px-2 text-xs"`.

## Icons

Inline SVGs from `I.*` in UI.tsx only. If an icon isn't there, add it to the `I` export. **Don't import lucide-react ad hoc.**

Available: `search · plus · chevron{Down,Right,Left} · alert · check · mail · flag · x · download · filter · link · bank · user · file · arrowRight · arrowDown · branch · shield · dollar · sparkle · send · list · home · paperclip · inbox`.

## Forms

Inputs:
```tsx
<input
  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none"
  ...
/>
```

Read-only inputs: add `bg-slate-50 text-slate-700` and `readOnly`.

Labels: `text-xs font-medium text-slate-500`.

## Tables

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      <th className="px-4 py-3">Column</th>
      ...
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-100">
    <tr className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">...</tr>
  </tbody>
</table>
```

Right-align numeric columns. Use `tabular-nums` and `font-mono` for currency. Severity column gets a `<SeverityBadge>`.

## Don'ts

- **Don't introduce a new font.** Geist + Geist Mono only.
- **Don't introduce a new color.** Use `BADGE_TONES`.
- **Don't use solid `*-100` fills** — too saturated. Prefer `*-50` or `*-50/40`.
- **Don't use `cursor-pointer` on non-interactive elements.** It's a silent lie.
- **Don't put hover states on disabled buttons.** `<Btn disabled>` already strips pointer events.
- **Don't use `lg:`, `md:` breakpoints widely.** The desktop UI is the design target. Responsive work is a separate sprint.
- **Don't add Tailwind v4 syntax.** We're on v3. Things like `--spacing(N)` will fail to compile.

## Dark mode

The CSS variables exist in `globals.css` (`.dark { ... }` block) but nothing toggles `class="dark"` on the `<html>`, so dark mode is effectively off. Don't rely on the `.dark` palette being correct — it's leftover from shadcn.
