# Deploy

Production target: **Cloudflare Workers**. Account: `andrew@evrylo.com`.

```
npm run deploy
```

That's it. The command runs `vinext deploy`, which:

1. Builds the app (`vinext build` — 5 stages: client refs, server refs, RSC env, client env, SSR env).
2. Auto-generates `worker/index.ts` and `wrangler.jsonc` if missing.
3. Calls `wrangler deploy` under the hood with the right asset binding.
4. Prints the live URL.

Live: https://my-app.frosty-butterfly-d821.workers.dev

---

## What's in the deploy

- **Worker bundle** (the SSR/RSC handlers) — currently ~1.5 MB total, ~330 KB gzip.
- **Static assets** (`dist/client/*`) — JS chunks + CSS + manifest, served via the `ASSETS` binding.
- **Image optimization handler** scaffolded in `worker/index.ts` (uses the `IMAGES` binding) — wired but unused; nothing on the site references it yet.

## Required config

### `vite.config.ts`

```ts
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
```

The `cloudflare()` plugin **must** be present, **must** specify `viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }`. vinext refuses to deploy without it.

### `wrangler.jsonc`

```jsonc
{
  "name": "my-app",
  "compatibility_date": "2026-05-05",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./worker/index.ts",
  "assets": {
    "directory": "dist/client",
    "not_found_handling": "none",
    "binding": "ASSETS"
  },
  "images": { "binding": "IMAGES" }
}
```

`compatibility_date` is auto-stamped to today's date on `vinext deploy`. `nodejs_compat` is required because the Next.js runtime uses Node polyfills.

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "vinext dev",
    "build": "vinext build",
    "start": "vinext start",
    "deploy": "vinext deploy",
    "lint": "next lint",
    "dev:next": "next dev",
    "build:next": "next build",
    "start:next": "next start"
  }
}
```

The `:next` variants are kept as a fallback in case vinext breaks. They run native Next.js with Turbopack, but you can't deploy that to Workers without OpenNext.

---

## Deploy checklist

Before deploying:

- [ ] `npm run build` passes locally.
- [ ] `git status` is clean (no half-finished changes).
- [ ] You've smoke-tested at least the route you changed in `npm run dev`.
- [ ] You're on the right branch — production deploys from `nextjs-vinext-migration` (or main once that branch lands).

After deploying:

- [ ] `curl -s -o /dev/null -w "%{http_code}\n" https://my-app.frosty-butterfly-d821.workers.dev/<route>` returns 200 for the routes you touched.
- [ ] Click through the changed flow in a real browser — smoke tests don't catch JS errors.
- [ ] Update `.memory/HANDOFF.md` if anything material shipped.

---

## Common deploy issues

### "Missing @cloudflare/vite-plugin in your Vite config"

Your `vite.config.ts` either doesn't have the `cloudflare()` plugin, or doesn't pass `viteEnvironment`. Copy from this doc.

### Peer-dep ERESOLVE during `vinext init`

vinext's `@vitejs/plugin-react@6.x` requires Vite 8. If your project still has Vite 7, `npm install -D vite@^8` first, then re-run `vinext init`.

### "ASSETS binding not found"

`wrangler.jsonc` is missing the `assets.binding` field. Copy from this doc.

### Build fails on globals.css

You probably let shadcn ui/ regenerate. The boilerplate uses Tailwind v4 syntax (`var(--spacing(N))`) that doesn't compile on v3. Either delete `src/components/ui/` or upgrade Tailwind (which cascades to the rest of the app — don't unless you're committed).

### Worker bundle exceeds limit

Free tier: 1 MB. Paid: 10 MB. We're at ~1.5 MB so we need paid. Check `dist/` to see who's bloating: large JS chunks usually mean an oversized dependency. Run `npm ls` and prune unused things.

### Deploy succeeds but site shows 500

Check the Cloudflare dashboard for the Worker's Real-time logs. Most likely a TypeScript type that compiled but does the wrong thing at runtime, or an environment-variable / binding mismatch.

---

## Rollback

`wrangler rollback` reverts to the previous version. Or:

```bash
npx wrangler deployments list
npx wrangler rollback [VERSION_ID]
```

Cloudflare keeps previous bundle versions automatically.

---

## Renaming the Worker / changing the URL

The Worker is named `my-app` (default from `package.json#name`). To change:

1. Edit both `package.json#name` and `wrangler.jsonc#name`.
2. Commit.
3. `npm run deploy` — Cloudflare creates a new Worker at the new name and the old one is left dangling. Delete the old one via dashboard if you don't want to pay for it.
