---
phase: 1
slug: foundation-static-export-spine
status: ready
mode: auto-chain
created: 2026-05-12
---

# Phase 1 — PLAN

Reference: `01-CONTEXT.md`, `01-UI-SPEC.md`, `.planning/research/{STACK,ARCHITECTURE,PITFALLS}.md`, `CLAUDE.md`, `.planning/REQUIREMENTS.md` §Foundation.

Goal: a deployable, themed, responsive Next.js shell with a fully-indexed Dexie schema v1, dynamic `[id]` route proven, and a green GitHub Pages deploy.

## Plan Index

Plans run sequentially. Each plan is a single atomic commit unless noted.

| # | Plan | Output |
|---|------|--------|
| 1.01 | Scaffold Next.js 16 + TS + Tailwind v4 + ESLint at repo root | `package.json`, `next.config.ts`, `tsconfig.json`, `app/`, scaffold commit |
| 1.02 | Install core runtime deps (Dexie, dexie-react-hooks, next-themes, ulid, motion, date-fns, lucide-react) | `package.json` updates, `pnpm-lock.yaml` |
| 1.03 | Install dev deps (Vitest, RTL, fake-indexeddb, jsdom, Prettier) | dev deps in `package.json` |
| 1.04 | Initialize shadcn/ui (`new-york`) + add minimal primitives (button, dropdown-menu, separator, skeleton) | `components.json`, `components/ui/*`, design tokens in `globals.css` |
| 1.05 | Configure `next.config.ts` for static export + env-driven basePath/assetPrefix | `next.config.ts`, `public/.nojekyll` |
| 1.06 | Wire `next-themes` `ThemeProvider` into `app/layout.tsx` with Geist font, `lang="en"`, `suppressHydrationWarning` | `app/layout.tsx`, `app/globals.css` final tokens |
| 1.07 | Build shell components (`AppShell`, `Sidebar`, `BottomNav`, `TopBar`, `ThemeToggle`) | `components/shell/*.tsx` |
| 1.08 | Stub routes: `/`, `/people`, `/people/[id]`, `/events`, `/events/[id]` with placeholder content + `[id]/layout.tsx` server file for `generateStaticParams() => []` | `app/page.tsx`, `app/people/{page,[id]/page,[id]/layout}.tsx`, `app/events/{page,[id]/page,[id]/layout}.tsx` |
| 1.09 | Dexie schema v1 — types, db singleton, `requestPersistentStorage` helper | `lib/db/{types,db}.ts`, `lib/db/persist.ts` |
| 1.10 | Repository + hook stubs with correct signatures | `lib/db/repositories/{people,events,touches,meta}.ts`, `hooks/use-{people,events,touches}.ts`, `lib/id.ts` (ULID helper) |
| 1.11 | Vitest config + fake-indexeddb setup + Phase 1 smoke test (FND-09) | `vitest.config.ts`, `test/setup.ts`, `test/db/schema.test.ts` |
| 1.12 | ESLint flat config + Prettier config — keep Next 16 defaults | `eslint.config.mjs`, `.prettierrc`, `.prettierignore` |
| 1.13 | GitHub Actions workflow for GH Pages deploy + README | `.github/workflows/deploy.yml`, `README.md` |
| 1.14 | Local verification: `pnpm run build` produces `out/`, dynamic route renders id correctly under `output:"export"`, smoke test passes, no console errors in dev | (no new files) |

Plans 1.01–1.14 produce one commit each. Plans within a plan are sequenced (no parallel waves — first phase, no concurrency benefit).

## Verification (UAT)

Each item maps to a Phase 1 success criterion / requirement:

1. **FND-01, FND-02, POL-04:** Open `pnpm dev` in browser, resize to ≤375px (iPhone) and ≥1440px (desktop). Sidebar visible on desktop, bottom nav visible on mobile, no `100vh` overflow at any viewport.
2. **FND-05:** Visit `/people/abc123` in dev — page renders "Person abc123 — detail view coming in Phase 2." Same for `/events/xyz789`.
3. **FND-07, FND-04:** Run `pnpm run build` — produces `out/` directory with `index.html`, `people/[id]/index.html` template, etc. No build errors.
4. **FND-08:** First page load in dark-mode-preferred browser shows dark theme immediately — no white flash.
5. **FND-09:** `pnpm test` — smoke test inserts + queries each of the 4 Dexie stores under fake-indexeddb, all assertions pass.
6. **FND-03, FND-06:** Inspect built bundle — no `fetch` to remote URLs in shell code. `requestPersistentStorage` helper present in `lib/db/`, not yet fired.
7. **Deploy:** Push to `main` triggers GH Actions workflow — workflow completes green, https://aymanrh.github.io/ws/ (or actual URL) loads the shell.
8. **POL-04:** `grep -r "100vh" app/ components/ lib/` returns no matches.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `create-next-app` refuses non-empty repo root | Run with `--yes` and a fresh subdir; merge result back. Alternative: stash existing files. |
| Tailwind v4 + Next 16 config drift | Follow `research/STACK.md` exact install commands; no custom PostCSS |
| Dynamic `[id]` route build error | Use Pattern A (D-05): server `layout.tsx` with empty `generateStaticParams()` + client `page.tsx` reading `useParams()` |
| GH Pages 404 on hard refresh | `trailingSlash: true` + `.nojekyll` + copy `out/index.html` to `out/404.html` in workflow |
| basePath breaks Vercel | env-driven `GITHUB_PAGES=true` guard |
| Dexie SSR crash | `"use client"` at top of `lib/db/db.ts`; `globalThis` singleton |

## Deferred

- Vercel deploy wiring (Phase 4)
- Custom Linear/Notion polish tokens beyond shadcn defaults (Phase 4)
- Component tests (Phase 2+)
- README "fork and extend" full docs (Phase 4)
- `navigator.storage.persist()` actual firing (Phase 2)
