# Phase 1: Foundation & Static-Export Spine - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning
**Mode:** `--auto --chain` (all gray areas auto-resolved with recommended defaults; auto-advance to plan+execute)

<domain>
## Phase Boundary

A deployable, themed, tested **responsive shell** exists with an **IndexedDB schema sufficient for every later phase**, so feature work in Phases 2–4 plugs in with zero migrations and zero deploy surprises.

**In scope** (FND-01..09, POL-04):
- Next.js 16 + TS + Tailwind v4 + shadcn/ui project scaffold
- App shell: persistent navigation (sidebar ≥md, bottom tabs <md), TopBar, theme toggle
- Light/dark theme with no FOUC
- All v1 routes resolve (Home, People list/[id], Events list/[id])
- Dynamic `[id]` routes proven under `output: "export"` (placeholder content)
- Dexie schema v1 fully declared (`people`, `events`, `touches`, `meta` stores with all eventual indexes pre-baked)
- HMR-safe Dexie singleton
- `100dvh` shell with safe-area insets
- One Vitest smoke test against fake-indexeddb proving the data layer works headlessly
- `next.config.ts` configured for static export to GH Pages and Vercel
- GitHub Actions workflow that deploys `out/` to GitHub Pages
- README zero-config local-run instructions
- First GH Pages deploy proven green

**Out of scope for this phase** (deferred to later phases):
- Any People/Event CRUD UI (Phase 2/3)
- Any actual data write (`navigator.storage.persist()` call shipped as a helper, fires in Phase 2 on first real write)
- Seed data, search, export/import (Phase 4)
- Theme toggle UI lives in the header in this phase but is the only "data-touching" UI control shipped

</domain>

<decisions>
## Implementation Decisions

### Project Bootstrap

- **D-01:** Scaffold via `npx create-next-app@latest` at the repo root (no subdir), accepting TypeScript / Tailwind / ESLint / App Router / Turbopack / no `src/` / alias `@/*`. _Why: Workshop attendees recognize this exact incantation; matches every Next.js 16 tutorial they will read. Hand-rolling the config is teaching debt._
- **D-02:** Commit the scaffold as a single atomic plan step before anything else lands, so the rest of Phase 1 is diff-able against a known-clean Next.js install.
- **D-03:** `packageManager` field pins **pnpm**; lockfile committed. README documents `npm install && npm run dev` as the canonical fallback for forkers. Both must produce a working build.
- **D-04:** Node version pinned via `.nvmrc` and `engines.node` to current Node 22 LTS — covers Next 16's actual requirement and prevents workshop-attendee install errors.

### Routing & Static Export

- **D-05:** Dynamic `[id]` routes use the **Pattern A** from `research/ARCHITECTURE.md` §"Pattern A": page is `"use client"`, reads id via `useParams()`; a colocated **server `layout.tsx`** in `[id]/` exports `generateStaticParams(): []` and `dynamicParams = true`. _Why: This is the only static-export pattern that survives `output: "export"` + GH Pages + user-generated IDs (PITFALL §Critical "Dynamic route breaks `next build` under `output: 'export'`")._
- **D-06:** Phase 1 ships placeholder detail pages: `/people/[id]` renders "Person `{id}` — detail coming in Phase 2" reading id from `useParams()`. **No Dexie lookup in Phase 1** — proves the route mechanism only. Phase 2 fills it in.
- **D-07:** `next.config.ts` settings (all required, all together): `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`, plus env-gated `basePath` + `assetPrefix`. Ship `public/.nojekyll`.
- **D-08:** `basePath` strategy: **env-driven**. Read `process.env.GITHUB_PAGES === "true"` at build time; when true, set `basePath: "/ws"` + `assetPrefix: "/ws/"`; otherwise both undefined. Vercel and local builds emit root-relative URLs; GH Pages workflow sets the env var. _Why: One build, two deploy targets, zero hardcoding._

### Responsive Shell

- **D-09:** Shell composition: server `app/layout.tsx` (HTML scaffold, fonts via `next/font/google` Geist or Inter, `<ThemeProvider>` from `next-themes`), wrapping a client `<AppShell>` component that contains `Sidebar` (≥md), `TopBar`, `BottomNav` (<md), and `{children}` slot. _Why: Keeps the layout server-rendered (no FOUC, no hydration loop), pushes all interactive nav into a single client component._
- **D-10:** Sidebar + BottomNav are **hand-rolled** (no shadcn `<Sidebar>` primitive in v1). _Why: shadcn `<Sidebar>` is a full sidebar framework with collapsible/inset modes — overkill for 4 nav items and adds workshop-teaching surface area. A 40-line bottom tab bar + a 40-line desktop sidebar list is more honest and forkable._
- **D-11:** Nav items: Home, People, Events. Settings is **not** a top-level nav item (header menu only — REQUIREMENTS.md "Data Management" section). Search will be a header element added in Phase 4, not nav.
- **D-12:** Use `100dvh` (POL-04) and `pb-[env(safe-area-inset-bottom)]` on the BottomNav. Test on a mobile viewport in dev tools as the closing step before deploy.
- **D-13:** Header carries: app title (left), theme toggle (right). Backup/restore menu items land in Phase 4 — header is structured to accept menu items but ships with theme only.

### Theming (no-FOUC)

- **D-14:** `next-themes` with `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange`. Inline script is injected automatically — handles FND-08 (no FOUC).
- **D-15:** Use shadcn **`new-york` style** with tighter token tweaks per `research/ARCHITECTURE.md` §"Theming" (near-black primary, `--radius: 0.5rem`, generous body line-height). Default light + dark palettes from shadcn — no custom color work in Phase 1.
- **D-16:** Type scale and spacing: Tailwind defaults; no `tailwind.config.ts` density customization in Phase 1. Polish is Phase 4 (per PITFALLS §"Spending three days on theming").

### Data Layer (Schema v1)

- **D-17:** Dexie schema v1 is locked at first run with **all four stores fully indexed**, matching `research/ARCHITECTURE.md` exactly:
  ```ts
  db.version(1).stores({
    people:  "id, name, closeness, lastContactAt, followUpAt, *tags",
    events:  "id, date, status, *tags, *attendees",
    touches: "id, personId, eventId, timestamp, type",
    meta:    "key",
  });
  ```
  _Why: FND-04 mandates pre-declaring **every eventual field** (`*tags`, `*attendees`, `lastContactAt`, `followUpAt`, `touches` store) so Phases 2–4 + any v2 work need zero migrations. Schema churn = data loss per PITFALLS §Critical._
- **D-18:** Even though Touchpoints are deferred to v2, the `touches` store and `lastContactAt`/`followUpAt` indexes still ship in Phase 1's `version(1)` block. This is a deliberate forward-bake.
- **D-19:** TypeScript entity types (`Person`, `Event`, `Touch`, `Meta`, `Closeness`, `TouchType`) ship in `lib/db/types.ts` exactly as documented in `research/ARCHITECTURE.md` §"Data Layer".
- **D-20:** Dexie instance is a **`globalThis`-cached singleton** to survive HMR (PITFALLS §"Hot reload breaks mid-demo"):
  ```ts
  const g = globalThis as unknown as { __db?: typeof db };
  export const db = g.__db ?? (g.__db = new Dexie("NetworkingApp") as ...);
  ```
- **D-21:** **`lib/db/db.ts` starts with `"use client"`.** Every file that imports `db` is a client component. No server-side Dexie access anywhere (PITFALLS §"Dexie + SSR hydration crashes the build").
- **D-22:** ID generation: **ULIDs** via `ulid` package (or a tiny hand-rolled wrapper). Stored as the primary key string. _Why: CLAUDE.md mandates ULIDs over auto-increment; ULIDs sort lexicographically by time which gives "recent activity" ordering for free._

### Persistence Hardening

- **D-23:** Ship a `requestPersistentStorage()` helper in `lib/db/` that calls `navigator.storage.persist()` and stores the granted result in the `meta` store under key `"persistGranted"`. **Phase 1 does NOT fire this helper** — Phase 2's first `createPerson` is the trigger (FND-06). This decouples the helper-existence concern from the first-write concern.

### Repository Skeleton

- **D-24:** Create empty repository module files in `lib/db/repositories/` for `people.ts`, `events.ts`, `touches.ts`, `meta.ts` — each exporting placeholder no-op functions with the right signatures. _Why: Establishes the import surface so Phase 2 fills in bodies without touching imports across feature components. Reduces Phase 2 diff size, improves teaching clarity._
- **D-25:** Same for `hooks/` — `use-people.ts`, `use-events.ts`, `use-touches.ts` ship as stubs exporting hooks that return `undefined`. Pages can import them in Phase 1, render skeletons, and Phase 2/3 fills behavior.

### Tests

- **D-26:** Vitest + `fake-indexeddb/auto` per `research/ARCHITECTURE.md` §"Testing". Single config: `test/setup.ts` registers fake-indexeddb; `vitest.config.ts` points to it; `environment: "node"` (jsdom not needed for repo tests).
- **D-27:** Phase 1 smoke test (FND-09): `test/db/schema.test.ts` opens `db`, inserts one row into each of the four stores, queries them back, asserts shapes + multi-entry index works (`db.people.where("tags").equals("foo")`). One test file. ~30 lines.
- **D-28:** No component tests in Phase 1. Component test infrastructure (RTL + jsdom) is configured but unused until Phase 2.

### Deploy

- **D-29:** GitHub Actions workflow at `.github/workflows/deploy.yml` deploys to GitHub Pages on push to `main`. Uses the official `actions/deploy-pages@v4` artifact flow: build with `GITHUB_PAGES=true`, upload `out/`, deploy.
- **D-30:** First Pages deploy must be **green** before Phase 1 closes. Per ROADMAP.md Phase 1 success criterion #2 and PITFALLS §"basePath/assetPrefix on GH Pages": catching deploy bugs in Phase 1 (not Phase 4) is the entire point of this phase.
- **D-31:** Vercel deploy is **not** wired up in Phase 1 — verifying static export to GH Pages is enough deploy-target proof. Vercel is a one-click connection that gets demoed in Phase 4.

### Placeholder Routes (what ships in Phase 1)

- **D-32:** Every route resolves with minimal page content:
  - `/` — "Networking App — Home" + "People: 0 · Events: 0" (placeholders, no live counts yet)
  - `/people` — "People list — coming in Phase 2" + EmptyState component placeholder
  - `/people/[id]` — "Person `{id}` placeholder" reading from `useParams()`
  - `/events` — same pattern as `/people`
  - `/events/[id]` — same pattern as `/people/[id]`
- **D-33:** Each route is wired through `AppShell` so nav, theme, responsive behavior are all reachable. The point of Phase 1 isn't content — it's that the navigation works end-to-end on a real GH Pages deploy.

### README (Phase 1 scope)

- **D-34:** Phase 1 README includes: project description, zero-config local run (`pnpm install && pnpm dev` AND `npm install && npm run dev`), deploy targets (GH Pages auto-deploy on push to `main`, Vercel = connect-and-go), the workshop branch arc (`00-empty` → `01-planning` → `02-discussion` → `03-milestone`). Full "fork and extend" docs land in Phase 4 (POL-05).

### Claude's Discretion

- Exact font choice between Geist and Inter (research recommends either; Geist is the shadcn-Vercel default — likely the right pick).
- Exact navigation chrome (icons from lucide-react, label text, hover/active states) — match shadcn `new-york` defaults; no custom design work.
- File naming inside `components/shell/` (`AppShell.tsx` vs `app-shell.tsx`) — pick one and stay consistent; Next.js docs use kebab-case in 16.
- Whether to ship a `loading.tsx` skeleton per route in Phase 1 or defer — defer if the page content is trivial enough.
- Exact GH Actions workflow structure (single `deploy.yml` vs split `ci.yml` + `deploy.yml`) — single file is fine for v1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project framing & locked decisions
- `.planning/PROJECT.md` — Core value, audience constraints, locked stack decisions
- `.planning/REQUIREMENTS.md` §Foundation — FND-01..09 + POL-04 (the actual acceptance criteria for this phase)
- `.planning/REQUIREMENTS.md` §"Data Management" — Theme toggle lives in shell header; no Settings page in v1
- `.planning/ROADMAP.md` §"Phase 1: Foundation & Static-Export Spine" — Goal, requirements list, success criteria
- `CLAUDE.md` — Conventions section (client/server boundary, three-state render, IDs as ULIDs, schema migration discipline, `100dvh`, no demo-only hacks)

### Stack & architecture research
- `.planning/research/STACK.md` — Pinned versions of every dependency, install incantation, Tailwind v4 + shadcn/ui setup, zod v3 pin rationale
- `.planning/research/STACK.md` §"Static Export & GitHub Pages — Gotchas" — `next.config.ts` settings (basePath, assetPrefix, trailingSlash, `.nojekyll`)
- `.planning/research/STACK.md` §"Installation" — Exact `create-next-app` + shadcn + dep install commands
- `.planning/research/ARCHITECTURE.md` §"High-Level Architecture" — Browser-only runtime diagram, no API routes
- `.planning/research/ARCHITECTURE.md` §"Recommended Directory Layout" — Folder structure to follow exactly
- `.planning/research/ARCHITECTURE.md` §"Data Layer" — Dexie schema string syntax, EntityTable types, repository pattern, fake-indexeddb test setup
- `.planning/research/ARCHITECTURE.md` §"Client/Server Component Split" — Which files get `"use client"`
- `.planning/research/ARCHITECTURE.md` §"Static Export Specifics" — `next.config.ts` template + Pattern A for `[id]` routes
- `.planning/research/ARCHITECTURE.md` §"Theming for Linear/Notion Vibe" — Token values, next-themes wiring
- `.planning/research/ARCHITECTURE.md` §"Anti-Patterns to Avoid" — 14 anti-patterns; this phase must satisfy #1, 2, 3, 5, 6, 7, 8, 9, 14

### Pitfall catalogue (must be addressed in Phase 1)
- `.planning/research/PITFALLS.md` §Critical §"Dynamic route `/people/[id]` breaks `next build` under `output: 'export'`" — Pattern A, run static build day 1
- `.planning/research/PITFALLS.md` §Critical §"Dexie schema upgrades that drop or rename indexed fields silently lose data" — Lock v1 schema with every eventual field
- `.planning/research/PITFALLS.md` §Critical §"Dexie + SSR hydration crashes the build or first paint" — `"use client"` at top of `db.ts`
- `.planning/research/PITFALLS.md` §Critical §"User clears browser data → all contacts vanish" — Ship `requestPersistentStorage()` helper (fired in Phase 2)
- `.planning/research/PITFALLS.md` §Moderate §"404 on hard-refresh of `/people` on GitHub Pages" — `trailingSlash: true`, `.nojekyll`, copy `404.html`
- `.planning/research/PITFALLS.md` §Moderate §"basePath/assetPrefix on GH Pages — internal links 404 silently" — Env-driven config; always use `<Link>` not `<a>`
- `.planning/research/PITFALLS.md` §Moderate §"iOS Safari `100vh` breaks bottom nav" — `100dvh` + safe-area insets
- `.planning/research/PITFALLS.md` §Moderate §"Dark-mode FOUC on first load" — `next-themes` `attribute="class"` + inline script
- `.planning/research/PITFALLS.md` §Minor §"Hot reload breaks mid-demo because of a stale Dexie connection" — `globalThis` singleton pattern
- `.planning/research/PITFALLS.md` §"Phase-Specific Warnings" §"Phase 1" — Full row applies to this phase

### Wireframe reference (for shell layout)
- `Networking App Wireframes EN _standalone_.html` — Hand-drawn mobile + desktop layouts; informs nav placement and overall feel (the *built* product lands closer to Linear/Notion than the sketches — per PROJECT.md Context)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None yet** — the repo root contains only `.planning/`, `CLAUDE.md`, and the wireframes HTML. No Next.js app, no `package.json`, no `src/`, no `app/`. Phase 1 creates the baseline.

### Established Patterns (from CLAUDE.md and research, not from existing code)
- **Client/server boundary:** `app/layout.tsx` stays server; every Dexie-touching page is `"use client"`. (CLAUDE.md §Conventions)
- **Three-state render:** `useLiveQuery()` returning `undefined` → skeleton, `[]` → empty state, else → data. Treat undefined and empty as distinct. (CLAUDE.md §Conventions, applied at Phase 2+; the placeholder pages in Phase 1 just render static text.)
- **Reads vs writes:** Reads via `useLiveQuery` hooks. Writes via functional repository fns. (Phase 1 ships hook + repo stubs; bodies arrive Phase 2.)
- **Schema migration discipline:** Never edit `version(1).stores()` after first run. Phase 1's v1 block is the contract for v1 of the app.

### Integration Points
- Phase 2 (People) will: fill `usePeople`, `usePerson` hooks; fill `people` repository; build `/people/page.tsx` list + `/people/[id]/page.tsx` detail content; add FAB; trigger `requestPersistentStorage()` on first write.
- Phase 3 (Events) will: same pattern for `events` + add attendees picker.
- Phase 4 (Search/Seed/Polish) will: add search component to header, header menu for JSON export/import, first-run prompt, seed loader, README polish.

**Critical:** every Phase 1 stub must export the exact signature later phases need. Stub signatures are the contract.

</code_context>

<deferred>
## Deferred Ideas

- **Theme tokens beyond shadcn defaults** — Linear/Notion polish (custom palette, type scale, dense list density) is Phase 4 (POL-02). Phase 1 ships shadcn `new-york` defaults.
- **Master-detail desktop layout** — at `lg:` breakpoint, People list could render two-column with selected detail on the right. v2 (PRD-02 in REQUIREMENTS.md §v2). Phase 1 stays single-column stacked.
- **Search in header** — REQUIREMENTS.md SRC-01..04 puts global search in Phase 4. Phase 1's TopBar is structured to accept a search input slot but ships without it.
- **Header menu (backup/restore/seed)** — Phase 4 (SET-02, SET-03, SED-01..04). Phase 1's TopBar carries only the theme toggle.
- **First-run seed prompt** — Phase 4 (SED-01..04). Phase 1 has no first-run UX.
- **Touchpoint UI** — v2 (TCH-01..06). Schema ships in v1 per FND-04, but no UI in v1 at all.
- **PWA / service worker** — explicitly out of v1 (PROJECT.md, REQUIREMENTS.md PWA-01..02). Defer to v2 via Serwist.
- **`navigator.storage.persist()` actually firing** — helper ships in Phase 1, fires in Phase 2 on first `createPerson` (FND-06).
- **`loading.tsx` skeletons per route** — Phase 1 may ship them, but full skeleton design lands with content in Phases 2–4.
- **Vercel deploy wired up** — Vercel is a one-click connection; demoed in Phase 4. Phase 1 only proves GH Pages.

</deferred>

---

*Phase: 01-foundation-static-export-spine*
*Context gathered: 2026-05-12*
