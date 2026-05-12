# Technology Stack

**Project:** Networking App
**Researched:** 2026-05-12
**Overall confidence:** HIGH

> Locked by PROJECT.md (not re-evaluated): Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, IndexedDB persistence, static-export friendly, polished minimal aesthetic, mobile-first, ~2.5 week runway, forkable for 5-7 workshop attendees.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|---|---|---|---|
| Next.js | **16.2.x** (current stable, released Oct 2025; docs updated May 2026) | App Router framework, static export | Stable, App Router is the default and recommended path. Turbopack stable by default in 16. React Compiler 1.0 built-in. `output: "export"` is the supported static-export path. |
| React | **19.x** (used by Next 16; 19.2 features live via React Canary in App Router) | UI runtime | Comes with Next 16; no decision needed. All shadcn/ui components updated for React 19. |
| TypeScript | **5.x** (latest, locked by Next 16 templates) | Type safety | Locked by project constraints. |

### Persistence

| Technology | Version | Purpose | Why |
|---|---|---|---|
| Dexie.js | **4.4.2** (published ~Apr 2026) | IndexedDB wrapper, the only persistence layer | Battle-tested, widely-used minimalistic IndexedDB wrapper. Clear API for tables, indexes, transactions, and migrations — exactly what 5-7 workshop forkers need to read without confusion. |
| dexie-react-hooks | **1.x** (paired with Dexie 4) | `useLiveQuery` for reactive components | First-party hook from the Dexie team. Components re-render automatically when the underlying IndexedDB data changes — replaces most "state management" needs for list/detail screens. Fine-grained observation, no false negatives. |
| fake-indexeddb | **6.x** (current) | In-memory IndexedDB for tests | Drop-in via `import "fake-indexeddb/auto"` — no other config needed for Dexie in Vitest/Jest. |

### UI & Styling

| Technology | Version | Purpose | Why |
|---|---|---|---|
| Tailwind CSS | **v4.1** (latest; v4 GA Jan 2025; Next 15.2+ supports v4) | Utility-first styling | Workshop-locked. v4 uses CSS-first config via `@theme` directive — simpler mental model. Drop `postcss-import` and `autoprefixer`; single `@tailwindcss/postcss` plugin. |
| @tailwindcss/postcss | **v4.1** (matches tailwindcss) | PostCSS bridge for Next.js | Required for Tailwind v4 with Next.js. Replaces the v3 three-plugin combo. |
| shadcn/ui | CLI **3.5.x** (latest), components copied (not versioned in deps) | Component library | Workshop-locked. CLI now detects/validates Tailwind v4 automatically, components updated for React 19, `forwardRef` removed, every primitive has `data-slot` for styling. |
| lucide-react | **1.14.0** (~Apr 2026) | Icons (shadcn default) | shadcn default icon library. Tree-shakable, fully-typed React components, ~12k+ projects depend on it. No reason to swap. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| react-hook-form | **7.75.x** (latest; v7.66 was Apr 2026, current 7.75 is May 2026) | Form state & validation | Add-person, add-event, settings — every form. shadcn's `Form` component is a thin wrapper around it. |
| zod | **3.25.x** (pin to v3 — see Pitfalls) | Schema validation | Validate form input, parse seed data, type-safe entity boundaries. **Important: pin to zod v3.25.x.** zod v4 has live type-resolver compatibility issues with @hookform/resolvers (branded type mismatches in zod 4.3.x); not worth fighting in a 2.5-week workshop project. |
| @hookform/resolvers | **5.x** (latest) | Bridge zod ↔ react-hook-form | `zodResolver` from `@hookform/resolvers/zod`. Standard pairing. |
| zustand | **5.0.13** (latest, May 2026) | Tiny app-wide UI state | Use **sparingly** — for cross-screen UI state Dexie can't hold (e.g., command palette open, current filter chip, toast queue). Most data flows via `useLiveQuery` directly. v5 uses `useSyncExternalStore` and supports React 18-19+. |
| date-fns | **4.1.0** (stable, mature) | Date math, "5 days ago", "today's follow-ups" | Tree-shakable, immutable, ~13KB tree-shaken to a handful of functions. **NOT** Temporal (polyfill is ~60KB and overkill for this app) — Temporal is the future but ship date-fns now. |
| motion | **12.x** (formerly framer-motion; rebranded, import from `motion/react`) | Tasteful page/list transitions | Use **`LazyMotion` + `m`** to keep bundle at ~4.6KB rather than the full 34KB. For most "polished" transitions, Tailwind's built-in `transition-*` and `animate-*` utilities are enough — only reach for `motion` when you need spring physics, layout animations, or gestures (e.g., swipe-to-reveal on the People list). |

### Tooling (test, lint, format, package manager)

| Tool | Version | Purpose | Why |
|---|---|---|---|
| pnpm | **9.x** / **10.x** (latest stable) | Package manager | Recommended for project authors. **BUT** the README + scripts must also work with plain `npm install` — many workshop attendees will have only npm installed. Use a `packageManager` field in package.json + a `corepack enable` note in README. |
| npm | bundled with Node 22+ | Fallback for workshop attendees | Zero-install path. Document `npm install && npm run dev` as the canonical fork command. |
| Vitest | **3.2.x** (or **4.0.7**) | Unit + component tests | Vite-native, ~6x faster cold start than Jest, near-identical API to Jest. The de-facto 2026 standard for React unit testing. |
| @vitejs/plugin-react | **4.x** | JSX support in Vitest | Required by the Next.js Vitest guide. |
| @testing-library/react | **16.x** | Component testing primitives | Standard pairing with Vitest. |
| @testing-library/dom + jest-dom | latest | DOM matchers | Needed for `toBeInTheDocument`, etc. |
| jsdom | **25.x** | DOM environment for Vitest | Sufficient for IndexedDB testing via fake-indexeddb (no real browser needed for unit tests). |
| Playwright | **1.50.x** (latest) | E2E tests for critical flows | One or two smoke E2E tests max: "add a person in <30s", "follow-up appears on Home". Don't overinvest given 2.5-week runway. |
| ESLint | **9.x** (flat config) | Linting | Flat config (`eslint.config.mjs`) is now the Next.js default. Use `eslint-config-next` for `next/core-web-vitals` + `next/typescript`. |
| Prettier | **3.x** (latest) | Formatting | Pair with `eslint-config-prettier/flat` to disable ESLint formatting rules that conflict. |

### NOT Using (and why)

| Skipped | Reason |
|---|---|
| RxDB / TinyBase | Overkill for a local-only single-user app. Dexie + useLiveQuery covers reactive queries with a tiny mental model. |
| idb (raw library) | More ergonomic to teach Dexie's table API to workshop attendees. idb makes you write the query plumbing yourself. |
| Jotai / Redux Toolkit | Zustand v5 covers the small slice of cross-screen state we need; bigger libraries are teaching tax. |
| dayjs / Luxon / Temporal | date-fns is the right size/maturity trade-off. Temporal polyfill is too large; Temporal native isn't universal yet (Chrome 144+, FF 139+ only). |
| Moment.js | Legacy, mutable, larger. |
| next-pwa | Hard-tied to webpack; in Next 16 (Turbopack default), this means passing `--webpack` everywhere. Use **Serwist** (`@serwist/next`) if a PWA is in scope — but see PWA recommendation below: defer to v2. |
| Heroicons / Phosphor | shadcn defaults to lucide; switching adds friction for forkers expecting the shadcn out-of-the-box experience. |
| GSAP / React Spring | Heavier than motion; motion's hybrid engine + LazyMotion covers everything we need. |
| Jest | Vitest is faster and the modern default for new Next.js + Vite-adjacent projects. |
| yarn / bun | bun is fastest but riskier on Windows (workshop audience). yarn adds no clear benefit over pnpm. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|---|---|---|---|
| Persistence | Dexie | RxDB | Too heavy, sync features unused, steeper learning curve |
| Persistence | Dexie | TinyBase | Tabular model is nice but smaller community, less workshop recognition |
| Persistence | Dexie | Raw IndexedDB / idb | Forces workshop attendees to grok cursor APIs — distracts from GSD lesson |
| State | Zustand v5 (sparing) | Jotai | Atomic model is elegant but heavier conceptual surface for a workshop |
| State | Zustand v5 (sparing) | useReducer + Context | Fine if zustand isn't pulled in — re-evaluate during planning |
| Date | date-fns 4 | Temporal (native) | Not universal in 2026; polyfill is ~60KB |
| Date | date-fns 4 | dayjs | Smaller (2KB) but mutable model; date-fns tree-shakes well enough |
| Date | date-fns 4 | Luxon | Heavier; timezone features unused in a local-personal app |
| Animation | motion (Lazy/mini) | Pure Tailwind transitions | Tailwind covers 80%; only pull motion in when needed |
| Animation | motion | GSAP | Heavier, license complexity for forkers |
| Forms | react-hook-form + zod | Native HTML + FormData | Works but loses ergonomic Zod schemas and shadcn's `Form` integration |
| Testing | Vitest | Jest | Jest works but slower cold start, ESM friction |
| Package manager | pnpm (with npm fallback) | bun | Windows compatibility risk for workshop forkers |
| Package manager | pnpm (with npm fallback) | npm only | Author DX hit; lockfile noise |
| PWA | **Skip for v1** (Serwist if added later) | next-pwa | Pinned to webpack; needs `--webpack` flag everywhere in Next 16 |

## Static Export & GitHub Pages — Gotchas

1. **`next export` command is removed** — use `output: "export"` in `next.config.ts` only. Then run `next build`.
2. **basePath + assetPrefix MUST both be set for project pages** — for `https://<user>.github.io/<repo>/`, set BOTH (`basePath` alone breaks asset URLs).
   ```ts
   const isProd = process.env.NODE_ENV === "production";
   const repo = "ws"; // GitHub repo name
   const nextConfig: NextConfig = {
     output: "export",
     basePath: isProd ? `/${repo}` : "",
     assetPrefix: isProd ? `/${repo}/` : "",
     images: { unoptimized: true }, // required: Image optimization is server-side
     trailingSlash: true, // safer for GitHub Pages directory routing
   };
   ```
3. **`.nojekyll` file in `public/`** — required, otherwise GitHub Pages strips `_next` directory contents.
4. **Dynamic routes need `generateStaticParams`** — for `app/people/[id]/page.tsx`, you MUST export `generateStaticParams`. **Since data lives in IndexedDB (browser-only), this server-side function has no data.** Solution: have `generateStaticParams` return `[]` and set `export const dynamicParams = true` ... but that doesn't work with static export. **Real solution:** use a **client-rendered detail page** under a single static `app/people/[id]/page.tsx` that returns a placeholder from `generateStaticParams` (e.g., `[{ id: "_" }]`) and renders a `'use client'` child that reads the `id` from `useParams()` and queries Dexie. Or — simpler — use a query-string-based detail route (`/people?id=...`) to bypass dynamic-segment static export entirely. **Decide this in the routing planning phase.**
5. **`useParams()` works in client components under `output: "export"`** in current Next 16 (was historically buggy — confirm with a smoke test in phase 1).
6. **No Image Optimization, no Route Handlers, no Middleware, no Server Actions with runtime data** — static export disables these. Plan UI accordingly.
7. **IndexedDB on first render** — every Dexie call must be in a `'use client'` component OR guarded behind `useEffect` / `typeof window !== "undefined"`. `useLiveQuery` handles this correctly out of the box because it only runs on the client.
8. **RSC payload 404s with basePath + no trailingSlash** — known Next.js issue. `trailingSlash: true` mitigates.
9. **Vercel deployment** — when deploying to Vercel, basePath/assetPrefix must be empty. Use the `NODE_ENV` + a deploy-target env var pattern; or just deploy the same `output: "export"` build to both (Vercel happily serves static).

## Workshop-Friendliness Checklist

| Tool | Zero-config fork-and-run? | Notes |
|---|---|---|
| Next.js 16 + TS | YES | `create-next-app` template covers it; commit our `next.config.ts` and `tsconfig.json` |
| Tailwind v4 + @tailwindcss/postcss | YES | Single PostCSS plugin; no `tailwind.config.js` needed for v4 |
| shadcn/ui | YES | Components are vendored into `components/ui/` — no install at fork time |
| Dexie + dexie-react-hooks | YES | Two npm installs; works in dev and prod |
| react-hook-form + zod (v3) + resolvers | YES | Pin zod to v3.25.x in package.json to avoid v4 type drift |
| zustand v5 | YES | Single dep, no provider boilerplate needed |
| date-fns 4 | YES | Tree-shakes itself; import only what you use |
| lucide-react | YES | Standard shadcn default |
| motion (LazyMotion) | YES | Document the LazyMotion pattern in a comment so forkers don't accidentally import the full bundle |
| Vitest + RTL + fake-indexeddb | YES | Single `vitest.config.ts`; `import "fake-indexeddb/auto"` in setup file |
| Playwright | PARTIAL | First install does `npx playwright install --with-deps` (downloads ~300MB browsers). Document this clearly in README; consider keeping E2E in a separate `pnpm run test:e2e` script so forkers can ignore. |
| ESLint flat config + Prettier | YES | Provide `eslint.config.mjs` and `.prettierrc` in repo |
| pnpm (with npm fallback) | YES | `packageManager` field in package.json; lockfile committed; README documents both |
| GitHub Pages deploy | YES | Provide `.github/workflows/deploy.yml` that runs build + uploads `out/` to Pages |

## PWA Recommendation

**Skip in v1. Revisit only if there's time.**

Rationale:
- next-pwa is incompatible with Next 16's Turbopack default (forces `--webpack` flag everywhere — bad for workshop teaching).
- Serwist works but adds ~1-2 days of config + service-worker debugging.
- A PWA doesn't move the needle on the core value prop ("add a person in <30s"). IndexedDB already gives full offline data.
- Workshop attendees can add Serwist as a v2 phase — it's a clean teaching unit on its own.

If the user insists on PWA: use **Serwist (`@serwist/next`)** — actively maintained, Turbopack-friendly, supports static export.

## Installation

```bash
# 1. Bootstrap (interactive prompts: yes TypeScript, yes Tailwind, yes ESLint, yes App Router, yes Turbopack, no src/, alias @/*)
npx create-next-app@latest ws

# 2. shadcn/ui (will detect Tailwind v4 + Next 16)
npx shadcn@latest init

# 3. Core deps
npm install \
  dexie \
  dexie-react-hooks \
  react-hook-form \
  "zod@^3.25" \
  "@hookform/resolvers@^5" \
  zustand \
  date-fns \
  lucide-react \
  motion

# 4. Dev deps
npm install -D \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/dom \
  @testing-library/jest-dom \
  jsdom \
  fake-indexeddb \
  @playwright/test \
  prettier \
  eslint-config-prettier

# 5. Playwright browsers (one-time)
npx playwright install --with-deps chromium
```

Then add shadcn components incrementally as needed:
```bash
npx shadcn@latest add button input label form card dialog sheet command tabs badge avatar dropdown-menu separator scroll-area sonner skeleton
```

## Confidence Summary

| Recommendation | Confidence | Source |
|---|---|---|
| Next.js 16.2.x + App Router + static export | HIGH | Context7 (`/vercel/next.js/v16.2.2`) + Next.js official docs |
| Dexie 4.4.2 + dexie-react-hooks | HIGH | Context7 (`/websites/dexie`) + npm + Dexie blog (Mar 2026) |
| shadcn/ui CLI 3.5 + Tailwind v4 | HIGH | Context7 (`/websites/ui_shadcn`) + Tailwind v4 docs |
| Tailwind CSS v4.1 + @tailwindcss/postcss | HIGH | Context7 (`/tailwindlabs/tailwindcss.com`) |
| react-hook-form 7.75.x + zod **v3** + resolvers 5 | HIGH | WebSearch verified + react-hook-form GitHub issues #12816/#12829, resolvers #813/#842 |
| Zustand 5.0.13 | HIGH | npm + zustand releases (Jan-May 2026) |
| date-fns 4.1.0 | HIGH | npm registry + 2026 comparison guides |
| motion (LazyMotion pattern) | HIGH | motion.dev docs + LogRocket 2026 review |
| lucide-react 1.14.0 | HIGH | npm |
| Vitest 3.2.x / 4.0.7 + RTL 16 | HIGH | Context7 (`/vitest-dev/vitest`) + Next.js Vitest guide |
| fake-indexeddb (`/auto`) | HIGH | npm + Dexie test docs |
| Playwright 1.50.x for smoke E2E only | MEDIUM | Standard 2026 stack; recommendation is to keep scope small |
| ESLint 9 flat config + Prettier 3 | HIGH | Next.js 16 ESLint docs + multiple 2026 setup guides |
| pnpm primary + npm fallback | MEDIUM | 2026 package manager comparisons; matches workshop reality |
| Skip PWA in v1 | HIGH | Serwist/next-pwa research + workshop-time-cost analysis |
| GitHub Pages: `output: "export"` + basePath + assetPrefix + `.nojekyll` + `images.unoptimized` | HIGH | Next.js official static-exports guide + community 2025/2026 deployment guides |

## Sources

- Next.js — Static Exports guide (Next 16 docs, accessed May 2026): https://nextjs.org/docs/app/guides/static-exports
- Next.js 16 release blog: https://nextjs.org/blog/next-16
- Next.js 16 — Upgrading guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js 16 App Router complete guide (May 2026): https://dev.to/getcraftly/nextjs-16-app-router-the-complete-guide-for-2026-2hi3
- Next.js — Static export basePath issue thread: https://github.com/vercel/next.js/issues/73427
- Next.js — `next export` removal: https://github.com/vercel/next.js/discussions/58790
- Next.js — Static export with client `useParams`: https://github.com/vercel/next.js/discussions/64660
- Next.js — basePath + assetPrefix deployment guide: https://wallis.dev/blog/next-js-basepath-and-assetprefix
- Dexie.js docs — useLiveQuery: https://dexie.org/docs/dexie-react-hooks/useLiveQuery%28%29
- Dexie 4.4 release (Mar 2026): https://medium.com/dexie-js/dexie-4-4-dexie-cloud-server-3-0-the-big-one-d883b98599e8
- Dexie + Next.js SSR notes: https://webkul.com/blog/how-to-use-indexeddb-dexie-in-nextjs/
- shadcn/ui — Tailwind v4 docs: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui — Next.js install: https://ui.shadcn.com/docs/installation/next
- shadcn/ui — Form (RHF) docs: https://ui.shadcn.com/docs/forms/react-hook-form
- Tailwind CSS — Next.js install guide (v4): https://tailwindcss.com/docs/guides/nextjs
- Tailwind CSS v4.1 release post: https://github.com/tailwindlabs/tailwindcss.com/blob/main/src/blog/tailwindcss-v4-1/index.mdx
- React Hook Form releases (7.75.0 latest May 2026): https://github.com/react-hook-form/react-hook-form/releases
- React Hook Form 7.66 release notes: https://github.com/react-hook-form/react-hook-form/releases/tag/v7.66.0
- @hookform/resolvers npm: https://www.npmjs.com/package/@hookform/resolvers
- @hookform/resolvers — zod v4 type drift (issues #813, #842): https://github.com/react-hook-form/resolvers/issues/842
- Zod v4 + RHF resolver compatibility (issue #12829): https://github.com/react-hook-form/react-hook-form/issues/12829
- Zustand v5 announcement: https://pmnd.rs/blog/announcing-zustand-v5/
- Zustand releases (5.0.13 latest): https://github.com/pmndrs/zustand/releases
- date-fns v4 vs Temporal vs Day.js 2026: https://www.pkgpulse.com/guides/date-fns-v4-vs-temporal-api-vs-dayjs-date-handling-2026
- date-fns npm: https://www.npmjs.com/package/date-fns
- Motion (formerly Framer Motion) — reduce bundle size: https://motion.dev/docs/react-reduce-bundle-size
- Motion React quick-start: https://motion.dev/docs/react-quick-start
- LogRocket — best React animation libraries 2026: https://blog.logrocket.com/best-react-animation-libraries/
- lucide-react npm (1.14.0, May 2026): https://www.npmjs.com/package/lucide-react
- Vitest comparisons guide: https://vitest.dev/guide/comparisons
- Next.js — Vitest testing guide: https://nextjs.org/docs/app/guides/testing/vitest
- fake-indexeddb npm: https://www.npmjs.com/package/fake-indexeddb
- Next.js 16 testing 2026 (Vitest + Playwright): https://medium.com/@securestartkit/next-js-testing-in-2026-vitest-playwright-0caf6dd1f829
- Next.js ESLint config (flat config): https://nextjs.org/docs/app/api-reference/config/eslint
- Next 16 + Prettier setup (Apr 2026): https://medium.com/@edmondhashani/set-up-prettier-in-next-16-960d27a7cd4e
- Serwist for Next.js 16 PWA (Apr 2026): https://blog.logrocket.com/nextjs-16-pwa-offline-support/
- Next.js 16 PWA in 10 minutes (Serwist): https://www.buildwithmatija.com/blog/turn-nextjs-16-app-into-pwa
- pnpm vs npm vs Bun 2026 showdown: https://dev.to/pockit_tools/pnpm-vs-npm-vs-yarn-vs-bun-the-2026-package-manager-showdown-51dc
