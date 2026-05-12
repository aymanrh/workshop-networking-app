# Phase 1: Foundation & Static-Export Spine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 01-foundation-static-export-spine
**Mode:** `--auto --chain` (all gray areas auto-resolved with recommended defaults; auto-advance to plan+execute; user instructed: "continue and execute all phases without asking any question")
**Areas discussed:** Project Bootstrap, Routing & Static Export, Responsive Shell, Theming, Data Layer (Schema v1), Persistence Hardening, Repository Skeleton, Tests, Deploy, Placeholder Routes

---

## Project Bootstrap

| Option | Description | Selected |
|--------|-------------|----------|
| `create-next-app` template (recommended) | `npx create-next-app@latest` with TS+Tailwind+ESLint+App Router+Turbopack — matches every Next.js 16 tutorial workshop attendees will read | ✓ |
| Hand-rolled scaffold | Full manual setup of `package.json`, `next.config.ts`, `tsconfig.json`, etc. | |
| Custom workshop scaffold script | Author a bespoke generator | |

**Auto-selected (recommended):** `create-next-app` template — least teaching debt; produces a baseline workshop attendees can diff against.

| Option | Description | Selected |
|--------|-------------|----------|
| Install at repo root (recommended) | One app, one repo, forkers expect this | ✓ |
| Install in `app/` or `web/` subdir | Separates planning artifacts from app code | |

**Auto-selected (recommended):** Repo root — minimal cognitive overhead for forkers.

| Option | Description | Selected |
|--------|-------------|----------|
| pnpm primary + npm fallback (recommended) | `packageManager` pinned; README documents both | ✓ |
| npm only | Most universal, no fallback needed | |
| pnpm only | Faster, but excludes some workshop attendees | |

**Auto-selected (recommended):** pnpm primary + npm fallback — matches CLAUDE.md and STACK.md.

---

## Routing & Static Export

| Option | Description | Selected |
|--------|-------------|----------|
| Pattern A: empty `generateStaticParams() => []` + client `useParams()` (recommended) | Officially-blessed Next 16 static-export SPA pattern; survives GH Pages + user-generated IDs | ✓ |
| Pattern B: query-string routing (`/people?id=...`) | Eliminates dynamic segment entirely; uglier URLs | |
| Pattern C: hash-based router (`/#/people/abc`) | Avoids `[id]` entirely; non-idiomatic Next.js | |

**Auto-selected (recommended):** Pattern A — already locked in CLAUDE.md and `research/ARCHITECTURE.md`.

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 1 [id] pages render placeholders (recommended) | Prove the route mechanism without depending on Phase 2 data | ✓ |
| Phase 1 [id] pages defer entirely | Push the proof to Phase 2 alongside real content | |

**Auto-selected (recommended):** Placeholders — front-loads route risk per Phase 1 success criteria.

| Option | Description | Selected |
|--------|-------------|----------|
| Env-driven basePath (`GITHUB_PAGES=true`) (recommended) | One build, two deploy targets, zero hardcoding | ✓ |
| Hardcoded `basePath: "/ws"` | Simpler but breaks Vercel | |
| Runtime-detected basePath | Inspect `window.location` at boot | |

**Auto-selected (recommended):** Env-driven via `GITHUB_PAGES` build env var.

---

## Responsive Shell

| Option | Description | Selected |
|--------|-------------|----------|
| Server layout + client AppShell wrapper (recommended) | Server `layout.tsx` for shell+fonts+theme; client `<AppShell>` for nav | ✓ |
| Fully client-side layout | Mark `app/layout.tsx` as `"use client"` | |

**Auto-selected (recommended):** Hybrid — no FOUC, no hydration loop.

| Option | Description | Selected |
|--------|-------------|----------|
| Hand-rolled nav (recommended) | 40-line bottom tab bar + 40-line desktop sidebar | ✓ |
| shadcn `<Sidebar>` primitive | Full sidebar framework with collapse modes | |

**Auto-selected (recommended):** Hand-rolled — shadcn `<Sidebar>` is overkill for 4 nav items.

| Option | Description | Selected |
|--------|-------------|----------|
| Home / People / Events nav items (recommended) | Settings deferred to header menu per REQUIREMENTS.md | ✓ |
| Include Settings as 4th nav item | Matches some wireframe variants | |

**Auto-selected (recommended):** 3 nav items — matches locked requirements.

---

## Theming

| Option | Description | Selected |
|--------|-------------|----------|
| `next-themes` `attribute="class"` + `defaultTheme="system"` (recommended) | Inline script prevents FOUC; standard shadcn pairing | ✓ |
| Custom theme provider | Hand-rolled localStorage + class swap | |

**Auto-selected (recommended):** `next-themes` — locked by CLAUDE.md.

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn `new-york` defaults (recommended) | Ship Phase 1 with stock palette; polish in Phase 4 | ✓ |
| Custom Linear-style tokens now | Token tweaks per `research/ARCHITECTURE.md` §"Theming" | |

**Auto-selected (recommended):** Stock defaults — prevents the "three days theming before any flow works" pitfall.

---

## Data Layer (Schema v1)

| Option | Description | Selected |
|--------|-------------|----------|
| Ship all 4 stores with every eventual index (recommended) | `people`, `events`, `touches`, `meta` with `*tags`, `*attendees`, `lastContactAt`, `followUpAt` indexes | ✓ |
| Ship only stores Phase 1 needs | Add `touches` + multi-entry indexes in v2 | |

**Auto-selected (recommended):** All 4 stores, all indexes — FND-04 mandate; schema churn = data loss.

| Option | Description | Selected |
|--------|-------------|----------|
| `globalThis`-cached Dexie singleton (recommended) | HMR-safe per PITFALLS §"Hot reload" | ✓ |
| Plain module-scoped Dexie instance | Simpler but breaks under HMR | |

**Auto-selected (recommended):** `globalThis` cache — explicit pitfall.

| Option | Description | Selected |
|--------|-------------|----------|
| ULIDs via `ulid` package (recommended) | Time-sortable string IDs; locked by CLAUDE.md | ✓ |
| `crypto.randomUUID()` | No package; not time-sortable | |
| Auto-increment (`++id`) | Breaks export/import; forbidden by PITFALLS | |

**Auto-selected (recommended):** ULIDs — locked.

---

## Persistence Hardening

| Option | Description | Selected |
|--------|-------------|----------|
| Ship `requestPersistentStorage()` helper in Phase 1, fire in Phase 2 (recommended) | Decouples helper-existence from first-write trigger | ✓ |
| Fire `navigator.storage.persist()` on app boot in Phase 1 | Earlier ITP defense but no data to defend yet | |
| Defer helper entirely to Phase 2 | Skips the seam | |

**Auto-selected (recommended):** Helper now, fire in Phase 2 — cleanest separation.

---

## Repository Skeleton

| Option | Description | Selected |
|--------|-------------|----------|
| Ship empty repo + hook stubs with correct signatures (recommended) | Phase 2/3 fills bodies without touching imports across the app | ✓ |
| Defer all repo/hook files to Phase 2 | Smaller Phase 1 diff | |

**Auto-selected (recommended):** Stub now — reduces Phase 2 diff and improves teaching clarity.

---

## Tests

| Option | Description | Selected |
|--------|-------------|----------|
| Single Dexie smoke test (recommended) | Insert + query each store under fake-indexeddb | ✓ |
| Smoke + component test scaffold | Full RTL setup with a shell component test | |
| No tests in Phase 1 | Defer to Phase 2 | |

**Auto-selected (recommended):** One smoke test — satisfies FND-09 with minimal scope; component test infra configured but unused.

---

## Deploy

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions auto-deploy on push to `main` (recommended) | `actions/deploy-pages@v4` flow; uploads `out/` | ✓ |
| Manual `gh-pages` branch deploy | Old pattern; needs manual push | |
| No deploy in Phase 1 | Defer to Phase 4 (rejected — front-loading deploy risk is the whole point of Phase 1) | |

**Auto-selected (recommended):** Auto-deploy via GH Actions.

| Option | Description | Selected |
|--------|-------------|----------|
| GH Pages only in Phase 1 (recommended) | Vercel = one-click connect later | ✓ |
| GH Pages + Vercel both wired in Phase 1 | More work for the same proof | |

**Auto-selected (recommended):** GH Pages only — Vercel demoed in Phase 4.

---

## Placeholder Routes

| Option | Description | Selected |
|--------|-------------|----------|
| All routes ship minimal placeholder content (recommended) | Every route through `AppShell`; nav reachable end-to-end | ✓ |
| Only home + one list route in Phase 1 | Defer events routes to Phase 3 | |

**Auto-selected (recommended):** All routes — phase success criterion #2 demands every section + dynamic placeholder pages resolve.

---

## Claude's Discretion

- Font: Geist vs Inter (likely Geist — shadcn-Vercel default)
- Navigation chrome details (icons, label text, hover/active states) — match shadcn `new-york` defaults
- File naming convention in `components/shell/` — Next.js 16 docs use kebab-case
- Whether to ship `loading.tsx` per route in Phase 1 (defer if page content is trivial)
- GH Actions workflow structure (single `deploy.yml` is fine)

## Deferred Ideas

(See `01-CONTEXT.md` §`<deferred>` — Linear/Notion polish, master-detail layout, search, header menu, first-run prompt, touchpoint UI, PWA, `navigator.storage.persist()` firing, full skeletons, Vercel connection.)
