# Domain Pitfalls

**Project:** Networking App
**Researched:** 2026-05-12
**Overall confidence:** HIGH

This catalog is scoped to a Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Dexie/IndexedDB app, deployed as a static export to GitHub Pages + Vercel + local, with a 2.5-week runway to a live workshop demo (2026-05-30). Each pitfall is concrete, attached to a likely phase, and labelled with severity. "Phase X" references are approximate slots in the roadmap to be created — names map to logical work units, not fixed phase numbers.

Severity legend:
- Critical = causes rewrites, data loss, or demo failure
- Moderate = significant rework or visible UX bug
- Minor = polish-tier or easily fixed once spotted

---

## Critical Pitfalls (cause rewrites / major issues)

### Pitfall: Dynamic route `/people/[id]` breaks `next build` under `output: 'export'`
**What goes wrong:** Person profile route compiles fine locally with `next dev`, then the GitHub Pages build fails with `Page "/people/[id]" is missing "generateStaticParams()" so it cannot be used with "output: export" config`. Because person IDs are user-generated at runtime in IndexedDB, there is nothing to pre-render at build time.
**Why it happens:** Static export forces every dynamic route to enumerate its params at build time. The build server has no IndexedDB and no knowledge of users' future records.
**Consequences:** No profile page works on GitHub Pages. Sharing/bookmarking person URLs fails. Discovering this late forces an architectural rewrite (search params or hash-based routing) the day before the workshop.
**Warning signs:** First `next build` after adding `[id]/page.tsx`. Build log error mentioning `generateStaticParams`. Vercel may "tolerate" this because it falls back to on-demand rendering — masking the GH Pages failure until the very end.
**Prevention:** Decide up front: either (a) put profile under a static route and use a query string (`/people?id=...`) or hash (`/#/people/abc`), or (b) `generateStaticParams` returns `[]` and add a client-side router on the `not-found` boundary. Run `next build && next export`-equivalent (`output: 'export'`) on day 1, not at deploy time. Add a CI check that runs the static build.
**Address in phase:** Phase 1 (foundation / routing scaffold). Critical to lock before any feature work.

### Pitfall: Dexie schema upgrades that drop or rename indexed fields silently lose data
**What goes wrong:** A later version changes `db.version(2).stores({ people: 'id, name, tags' })` to `db.version(3).stores({ people: 'id, name, *tags, closeness' })` without an `.upgrade(tx => ...)` callback that migrates existing rows. Old records survive but indexes are inconsistent; sometimes records vanish after a version bump if a primary key changes.
**Why it happens:** Dexie's declarative versioning expects each historical schema to remain in code with its upgrader. Deleting the old `.version()` call, or omitting an upgrader when changing key paths, leaves users on old versions stranded — IndexedDB silently fails to migrate.
**Consequences:** Workshop attendees who installed the app on Monday and load it again on Saturday see "empty database" or corrupted state. There is no error toast — they just lose their seed data and assume the demo is broken.
**Warning signs:** Bumping `db.version(N)` without an `.upgrade` block. Renaming a primary key. Removing an older `.version()` from code. Browser console: `VersionError`, `DataError`, or silent zero-row results.
**Prevention:** Lock the v1 schema before any seeded data ships. Every `.version(N)` block stays in code forever, with `.upgrade()` when fields change. Write a tiny "schema integrity" test (open DB with old data via fake-indexeddb, bump version, assert row count matches). Document the rule in README under "if you change the schema, read this."
**Address in phase:** Phase 2 (data layer / Dexie schema). Make schema-evolution discipline an explicit teaching point because workshop attendees will hit this if they fork.

### Pitfall: Dexie + SSR hydration crashes the build or first paint
**What goes wrong:** Importing the Dexie instance at module top-level inside a server component or shared module throws `ReferenceError: indexedDB is not defined` during `next build`. Or worse: build succeeds, but the static HTML renders an "empty" state and React hydrates with the IndexedDB state, causing a hydration-mismatch warning and a visible content swap.
**Why it happens:** Dexie touches the `indexedDB` global at construction time. Next.js executes module code on the server when building. App Router server components have no DOM globals.
**Consequences:** Build fails on Vercel and GH Pages. Or, if guarded with `typeof window`, the static HTML shows an empty dashboard for ~200ms before client mounts, which looks broken during a live demo on a slow laptop.
**Warning signs:** Build error `ReferenceError: indexedDB is not defined` or `window is not defined`. Hydration-mismatch warnings in dev console. Empty UI flash on first load.
**Prevention:** Keep the Dexie module client-only: top of `db.ts` starts with `"use client"`, and any component that touches the DB is a client component. Use `next/dynamic(() => import(...), { ssr: false })` for the data-bound shell. Render skeleton states on first paint (`useLiveQuery` returns `undefined` initially — render a skeleton, not "no data").
**Address in phase:** Phase 2 (data layer). Establish the client-boundary pattern early so it doesn't have to be retrofitted.

### Pitfall: User clears browser data → all contacts vanish, no warning, no recovery
**What goes wrong:** User uses the app for a week, builds 30 contacts, then "Clear browsing data" in Chrome wipes IndexedDB. Or Safari evicts the origin after 7 days of inactivity per Intelligent Tracking Prevention. Or iOS private browsing was used and data was never persistent to begin with.
**Why it happens:** IndexedDB is "best-effort" storage by default. Browsers can evict it whenever they like, especially Safari (ITP 7-day rule), iOS PWAs, and any private/incognito context.
**Consequences:** A workshop attendee's data evaporates between sessions. The app looks unreliable. There is no "your data is local" reassurance in the UI; users don't know to back up.
**Warning signs:** No `navigator.storage.persist()` call in the codebase. No export/backup affordance in settings. No "data lives on this device" copy anywhere. Safari testers report empty DB after a weekend away.
**Prevention:** Call `navigator.storage.persist()` after the first write and surface the result (granted = small "Persistent storage" badge in settings; denied = a gentle "your browser may clear data — back up periodically" hint). Add a JSON Export / Import in settings from day 1. Add a "Data: N people, M events" line on the dashboard so visible data-presence cues fight the anxiety.
**Address in phase:** Phase 1 (foundation) for the persist() call; Phase 4 or 5 (settings / data management) for export-import UI. Critical because losing data live in a workshop is unrecoverable optically.

### Pitfall: Skipping tests "because it's a demo" then debugging live on stage
**What goes wrong:** Pressure of the 2.5-week timeline causes "we'll add tests later" thinking. The day before the workshop, a refactor breaks the add-person flow; nobody notices because no smoke test exists; the live demo's first action fails.
**Why it happens:** Demo-tier mental model treats tests as polish, not insurance. The cost of test infra (fake-indexeddb wiring, vitest config, jsdom quirks) feels high up front; the cost of a broken demo is invisible until it happens.
**Consequences:** Public failure. Loss of credibility for the GSD framework being taught. Hours of live debugging.
**Warning signs:** Zero test files past Phase 3. Manual smoke checks only. "It worked on my machine" patterns in commit messages.
**Prevention:** One smoke test per critical flow (add person, view profile, mark follow-up done) by Phase 3. Use `fake-indexeddb/auto` in test setup. Run tests in CI on every commit. Accept that 10 tests catching one regression on workshop morning is a 100x ROI.
**Address in phase:** Phase 2 (immediately after data layer exists), tests added per phase thereafter.

---

## Moderate Pitfalls

### Pitfall: `useLiveQuery` returning `undefined` on first render rendered as empty state
**What goes wrong:** `useLiveQuery(() => db.people.toArray())` returns `undefined` synchronously on first render, then the array on the next tick. Code that renders "No people yet — add your first" on falsy data shows the empty state for a flash before the list appears, on every page navigation.
**Why it happens:** Dexie's hook intentionally distinguishes "loading" (undefined) from "loaded-but-empty" (`[]`). Devs treat both as falsy and skip the distinction.
**Consequences:** Empty-state flash on every render. In a demo, it screams "this app is buggy."
**Warning signs:** Empty-state UI flicker when navigating between pages. `if (!people)` or `if (!people.length)` guards that don't distinguish loading from empty.
**Prevention:** Three-state render: `data === undefined` → skeleton; `data.length === 0` → empty state; else → list. Make this a project-wide convention.
**Address in phase:** Phase 3 (people list / first list view) — set the pattern, reuse everywhere.

### Pitfall: Search slows to seconds as dataset grows because no IndexedDB index is used
**What goes wrong:** Search by name does `db.people.filter(p => p.name.includes(q)).toArray()`. With 30 people it's fine; with 500 seeded people for a stress demo it stutters; combined with debounced re-renders it visibly lags.
**Why it happens:** Dexie's `.filter()` is a full table scan in JS — no index involvement. Substring matching can't use a B-tree index anyway.
**Consequences:** Sluggish search in the demo. Workshop attendees who fork and dump 1000+ records hit a wall.
**Warning signs:** Search latency > 100ms on 200 records. Devtools profiler shows long task in `.filter`. Cursor reads dominate.
**Prevention:** Index `name`, `tags*` (multi-entry), `lastContactAt`. For name search, lowercase-normalize on write and use `.where('nameLower').startsWithIgnoreCase(q)` for prefix queries; only fall back to substring on results. Debounce input (250ms). For 1000+ records, virtualize the result list (`react-window` or `@tanstack/react-virtual`).
**Address in phase:** Phase 3 (people list + search). Even if dataset is tiny in v1, ship indexes from the start because retrofitting indexes requires a schema version bump.

### Pitfall: `next/image` build error or broken assets on GitHub Pages
**What goes wrong:** Default `<Image>` in App Router relies on the Next.js image-optimization endpoint. Static export has no such endpoint. Build either fails or images 404 in production.
**Why it happens:** `output: 'export'` disables server-side features; image optimization is one of them.
**Consequences:** Hero illustration or avatar placeholders broken in the deployed demo.
**Warning signs:** Build warning about image optimization. 404s for `/_next/image?...` URLs. Images load locally but not on GH Pages.
**Prevention:** Set `images: { unoptimized: true }` in `next.config.mjs`. For avatars, prefer initials in a `<div>` or pure SVG — avoid raster images entirely in v1.
**Address in phase:** Phase 1 (Next.js config).

### Pitfall: 404 on hard-refresh of `/people` on GitHub Pages
**What goes wrong:** User navigates to a deep route, hits F5, sees a GitHub Pages 404.
**Why it happens:** GH Pages serves static files; without `trailingSlash: true` or a 404-fallback, `/people` has no file and `/people/index.html` isn't where the export wrote it.
**Consequences:** Sharing URLs during the workshop ("open `/people` on your laptop") breaks for attendees.
**Warning signs:** Works fine on local dev and Vercel; only GH Pages 404s on refresh.
**Prevention:** Set `trailingSlash: true` in `next.config.mjs`. Copy `out/index.html` to `out/404.html` in the deploy script (GitHub Actions step) so any unknown path falls through to the SPA shell. Add `.nojekyll` to `out/`.
**Address in phase:** Phase 1 (deploy config). Verify via the very first deploy to GH Pages.

### Pitfall: basePath/assetPrefix on GH Pages — internal links 404 silently
**What goes wrong:** GH Pages deploys to `https://user.github.io/repo-name/`. Without `basePath: '/repo-name'`, every internal link points to `/people` (which is `https://user.github.io/people` → 404).
**Why it happens:** Next.js generates absolute paths starting from `/`. GH Pages serves from a subpath.
**Consequences:** App "works" on Vercel and locally; ships broken on GH Pages.
**Warning signs:** White page on GH Pages; CSS and JS 404 in Network tab.
**Prevention:** `basePath: '/<repo>'` + `assetPrefix: '/<repo>/'` (trailing slash matters). Use Next's `<Link>` everywhere — never raw `<a href="/...">`. For images and static `<a>` exports, prefix with `process.env.NEXT_PUBLIC_BASE_PATH` or a helper.
**Address in phase:** Phase 1 (deploy config). Catch via first GH Pages deploy.

### Pitfall: iOS Safari `100vh` breaks bottom nav over the home-bar / virtual keyboard
**What goes wrong:** Layout uses `min-h-screen` (Tailwind's `100vh`). On iPhone, the bottom nav is hidden under the Safari URL bar; when the keyboard opens for "add person," the bottom nav lands on top of the input.
**Why it happens:** `100vh` on iOS Safari refers to the largest viewport, not the visible one. The viewport shrinks when chrome appears and when the keyboard opens, but `vh` doesn't track.
**Consequences:** Critical add-person flow has the submit button covered by the keyboard or hidden behind Safari chrome.
**Warning signs:** Testing on Safari iOS shows submit button off-screen or hidden. Layout shifts when scrolling.
**Prevention:** Use `100dvh` (dynamic viewport height) for full-screen layouts; supported in Safari 15.4+, Chrome 108+, Firefox 101+ — fine for the workshop audience. For inputs, use `scrollIntoView({ block: 'center' })` on focus, or rely on `interactive-widget=resizes-content` in the viewport meta. Hide bottom nav when keyboard is open (`visualViewport.height < window.innerHeight - 150`).
**Address in phase:** Phase 1 (responsive shell). Cheap to fix early; expensive to retrofit.

### Pitfall: shadcn Dialog + Form reset stale values when reopened
**What goes wrong:** "Add person" dialog closes after submit; reopening shows the previously typed values instead of an empty form. Or `form.reset()` doesn't clear the Select component's display.
**Why it happens:** Dialog unmounts content only if `forceMount` isn't set, but `react-hook-form` state survives if the form instance is reused. shadcn's Select wraps Radix; `reset()` updates RHF's internal value but the visible label doesn't always sync.
**Consequences:** Workshop demo shows residue from previous test data — looks broken or invasive.
**Warning signs:** Reopening Add dialog shows stale name/tags. Tags or closeness Select shows previous value but submitting saves a different one.
**Prevention:** Recreate the form on each open: key the form by an open-counter or reset in the `onOpenChange` handler with explicit `reset({ name: '', tags: [], ... })`. For Radix Select inside RHF, use `Controller` with explicit `value`/`onChange` and pass `defaultValue` on Select.Root.
**Address in phase:** Phase 3 (add-person form) and reused for add-event.

### Pitfall: Dark-mode FOUC on first load
**What goes wrong:** User has dark-mode preference; static HTML loads with light theme; ~150ms later the class flips to `dark`. Visible flash during the demo, especially noticeable on the dashboard's white-card layout.
**Why it happens:** Static HTML can't know the user's theme. JS applies the class after hydration unless the script runs before paint.
**Consequences:** Looks unpolished. Breaks the "Linear/Notion polish" aesthetic floor.
**Warning signs:** Flash visible when reloading in dark mode. `class="light"` on `<html>` in initial HTML even when user prefers dark.
**Prevention:** Use `next-themes` with `attribute="class"` and `defaultTheme="system"`; it injects an inline `<script>` in `<head>` that sets the class before paint. Avoid CSS transitions on `background-color` / `color` of the root.
**Address in phase:** Phase 1 (theming setup) — get it right at the start.

### Pitfall: Follow-up reminders that "fire" silently because notification permission was never granted
**What goes wrong:** App has a follow-up date; user expects to be reminded; reminder logic runs but `Notification.requestPermission()` returned "default" or "denied"; nothing happens. Or service worker isn't registered. User concludes the feature is broken.
**Why it happens:** Web Notifications need explicit user permission + (for background) a service worker + (on iOS) an installed PWA. None of these are automatic.
**Consequences:** Core "CRM that nudges you" value prop silently fails. Confusing for a workshop attendee.
**Warning signs:** No prompt for notification permission anywhere. No service worker. Follow-up due date passes, no notification.
**Prevention:** Scope reminders to **in-app dashboard surfacing** (today's follow-ups, overdue badge) — guaranteed to work. Treat browser notifications as an optional "Enable reminders" toggle in settings that explains the limitations. Don't ship background-push at all for v1.
**Address in phase:** Phase 4 (follow-ups). Make the in-app surfacing the primary mechanism; notifications are an extension, not the foundation.

### Pitfall: Radix Dialog/Sheet portal sits behind or in front of the bottom nav unpredictably
**What goes wrong:** Bottom nav has `z-50`; Sheet opens and renders at `z-50` via portal — race-condition stacking, or the bottom nav peeks over the Sheet's overlay.
**Why it happens:** Radix portals to `document.body`. Native `z-index` interactions with the bottom nav's stacking context are not what you'd intuit.
**Consequences:** Sheet looks broken; tap targets blocked.
**Warning signs:** Sheet header partially under bottom nav, or overlay doesn't cover bottom nav.
**Prevention:** Give bottom nav a defined z-index (e.g. `z-40`) and let Radix portals inherit their high default (Radix sets very high z-indices in their CSS variables). Test all overlays against bottom nav on mobile viewport in dev. When using Sheet from the bottom, hide the bottom nav while it's open.
**Address in phase:** Phase 1 (layout shell) and Phase 3 (add-person sheet).

### Pitfall: Hover styles stick on tap on mobile
**What goes wrong:** Tapping a card on iOS leaves the hover style applied until tapping elsewhere — list items look "selected" forever.
**Why it happens:** Mobile browsers emulate hover on tap.
**Consequences:** Visual confusion during the demo, especially when paging through people list.
**Warning signs:** Tap a card; visible "stuck" hover state until tapping something else.
**Prevention:** Use `@media (hover: hover)` to gate hover styles, or Tailwind's `hover:` modifier with the new `hover-hover` variant; alternatively, use `active:` styles for press feedback on touch.
**Address in phase:** Phase 3 (people list) and onward.

### Pitfall: Tag explosion / inconsistent capitalization
**What goes wrong:** User types "Networking", "networking", "Networking ", "Networks" — four tags emerge for the same concept. Filter by "networking" misses three of them.
**Why it happens:** No normalization on input, no autocomplete on existing tags.
**Consequences:** Filter feature looks broken; demo data and user-added data don't mix cleanly.
**Warning signs:** Distinct tag list shows variants of the same word. Filter results inconsistent.
**Prevention:** Normalize tags on save (`.trim().toLowerCase()`), but display title-cased. Autocomplete from existing tags as user types. Cap at ~20 unique tags in v1 (not enforced, just don't over-engineer hierarchy).
**Address in phase:** Phase 3 (add-person form, tags input).

### Pitfall: Closeness state goes stale because users don't update it manually
**What goes wrong:** Closeness (close/warm/cooling) ships as a user-set field. After two weeks of contacts, everyone is still "warm" because no one re-edits old people. Filter by "cooling" returns nothing useful.
**Why it happens:** Manual maintenance burden. Users don't think to update.
**Consequences:** A core filter dimension stays at default for everyone. Demo data tells a richer story than user data.
**Warning signs:** Most people show one closeness value. Filter by closeness barely changes the list.
**Prevention:** Either (a) compute closeness automatically from last-contact date (cooling = >90 days) and let user override, or (b) explicitly make it user-controlled in v1 but demo-data the variety so the *feature* is showcased even if user discipline drifts. Document the choice.
**Address in phase:** Phase 2 (data model) — decide before designing the profile UI.

---

## Minor Pitfalls

### Pitfall: Demo seed data feels cringe in front of attendees
**What goes wrong:** Hardcoded "Sara Kim — VP at Acme, met at Demo Day" sounds AI-generated. Attendees notice and the demo loses credibility.
**Why it happens:** Seed data written quickly without care for verisimilitude.
**Consequences:** Tone-deaf moments in the demo.
**Warning signs:** Seed data is generic (John Doe, Jane Smith, Tech Startup Inc).
**Prevention:** Use plausible names with diverse origins, realistic roles, real-sounding events ("AI Tinkerers Cairo", "Sat Brunch w/ Hoda"). 8–12 people is enough. Vary closeness, dates, follow-ups.
**Address in phase:** Phase 5 or 6 (seed data + first-run flow).

### Pitfall: Bundle bloat from importing all shadcn components
**What goes wrong:** `import * from '@/components/ui'` or barrel files pull in every component. First-load JS balloons.
**Why it happens:** Convenience imports defeat tree-shaking.
**Consequences:** Slow first paint, especially on workshop attendees' machines or slow conference Wi-Fi.
**Warning signs:** First-Load JS > 200kB. Build report shows unused shadcn components in bundle.
**Prevention:** Import named exports per component (`import { Dialog } from '@/components/ui/dialog'`). shadcn's per-component file structure makes this natural. Audit `next build` output for surprise size.
**Address in phase:** Ongoing; explicit check at end of Phase 6.

### Pitfall: Hot reload breaks mid-demo because of a stale Dexie connection
**What goes wrong:** During live workshop coding, edits to `db.ts` cause Dexie to throw `InvalidStateError: A mutation operation was attempted on a database that did not allow mutations`. Live audience watches an error stack instead of a feature being added.
**Why it happens:** HMR reloads the module, creating a second Dexie instance pointing at the same database name. The new instance opens while the old one is still alive.
**Consequences:** Demo stalls. "Live coding" loses the room.
**Warning signs:** Browser console errors after editing `db.ts`. Need to hard-refresh to recover.
**Prevention:** Wrap the Dexie instance creation in a `globalThis` cache pattern (similar to Prisma's Next.js pattern). Make this a teaching moment in the workshop, not a fail moment. Test HMR resilience before the demo.
**Address in phase:** Phase 2 (data layer).

### Pitfall: "One more feature" creep breaks the milestone arc
**What goes wrong:** Phase 6 is "polish"; pull-request adds calendar integration "while we're at it." Workshop arc loses its clean phase boundaries.
**Why it happens:** Excitement, scope creep, the comfort of touching code over making decisions.
**Consequences:** Workshop's pedagogical clarity (phase = one cohesive idea) is diluted. Attendees can't follow what's being built.
**Warning signs:** Phase diffs touching > 6–8 files. Commit messages with multiple "and"s.
**Prevention:** GSD discipline. Active triage to backlog. The PROJECT.md "Out of Scope" list is a contract.
**Address in phase:** Every phase. Discipline > technique.

### Pitfall: Spending three days on theming before any flow works end-to-end
**What goes wrong:** Engineer falls in love with Tailwind tokens and shadcn theme variables. Day 4 of 18 ends without a working "add person" flow.
**Why it happens:** Theming has fast visible feedback; product work has slower feedback.
**Consequences:** Phase budget consumed; flows feel rushed at the end.
**Warning signs:** Three commits in a row touching only `globals.css` / `tailwind.config.ts`.
**Prevention:** "Default shadcn theme" is the v1 aesthetic until all flows ship. Polish in a dedicated Phase N. Define a typography scale once and don't revisit.
**Address in phase:** Phase 1 (set theme) and Phase 6 (polish only).

### Pitfall: Export feature produces JSON that can't be re-imported
**What goes wrong:** Settings → Export downloads `people.json`. User loses data. Imports the file. Schema mismatch (Date became string, Set became Array, indexes don't survive). Import fails or duplicates rows.
**Why it happens:** Hand-rolled JSON serialization without symmetric import. Date objects round-trip as strings.
**Consequences:** Backup theatre — feature exists but doesn't actually save the user.
**Warning signs:** No import button next to export. No test that round-trips a DB through export/import and verifies row equality.
**Prevention:** Use `dexie-export-import` library — battle-tested. Round-trip test in CI: seed → export → wipe → import → assert equal.
**Address in phase:** Phase 5 (settings / data management).

### Pitfall: First-run seed prompt looks bad with partial seeding
**What goes wrong:** User clicks "Load demo data," it inserts 5 of 10 people, then a network blip (no — it's IndexedDB, no network — but a transaction error) leaves the DB half-populated. User refreshes; prompt asks again; clicking yes duplicates the first 5.
**Why it happens:** Seeding isn't transactional or idempotent. No "seeded?" flag.
**Consequences:** Confusing first-run; possibly duplicated data.
**Warning signs:** Seeding logic doesn't use `db.transaction(...)`. No `meta.seeded === true` check.
**Prevention:** Seed inside a single Dexie transaction. Persist a `meta.seeded = true` flag; check before re-prompting. Make seeding re-runnable as "reset to demo data" in settings (wipe + reseed).
**Address in phase:** Phase 5 or 6 (seed data + first-run).

### Pitfall: Bottom nav blocks the keyboard's enter affordance / submit button
**What goes wrong:** "Add person" form is full-height; bottom nav is `position: fixed; bottom: 0`; on mobile, the submit button is just above the bottom nav and the keyboard pushes it under the nav.
**Why it happens:** Fixed positioning + keyboard handling are separate concerns and conflict.
**Consequences:** Can't reach submit on mobile.
**Warning signs:** Manual mobile test shows submit unreachable when keyboard open.
**Prevention:** Render add flows as full-screen Sheets that *replace* the bottom nav layout (not overlay it). Use `100dvh` and `safe-area-inset-bottom` padding. Listen for `visualViewport` and hide bottom nav when keyboard is up.
**Address in phase:** Phase 3 (add-person flow).

### Pitfall: Search returns substrings of unrelated fields
**What goes wrong:** Search for "sara" matches a person whose company is "Sarasota Software." Demo data shows correctly; user data is noisier.
**Why it happens:** Substring matching across multiple fields without ranking.
**Consequences:** Confusing matches; tag/name searches blend.
**Warning signs:** Searching a common substring shows surprising hits.
**Prevention:** Match name first (boost), then tags (medium), then notes (low). Show match context in the result (e.g., highlighted snippet). For v1, restrict to name + tags; defer note-search to v2.
**Address in phase:** Phase 3 (search).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Phase 1 — Foundation / config / theming | Static-export routing not validated until end | Run `next build` with `output:'export'` on day 1; deploy a hello-world page to GH Pages before any feature work |
| Phase 1 — Foundation | `100vh` / iOS viewport mistakes baked into shell | Use `100dvh` from the start; test responsive shell on real iPhone before locking |
| Phase 2 — Data layer (Dexie) | Schema churn → data loss; SSR import breaks build | Freeze v1 schema before seed; client-only `db.ts`; HMR-safe singleton |
| Phase 2 — Data layer | No test scaffolding; can't refactor safely | `fake-indexeddb/auto` + vitest setup; first smoke test on day of phase |
| Phase 3 — People list + search | `useLiveQuery undefined` flicker; substring search misranks | Three-state render convention; ranked search (name > tags > notes) |
| Phase 3 — Add person form | shadcn Form + Dialog reset stale; tag duplication | Reset on dialog open; normalize tags; autocomplete from existing |
| Phase 4 — Events + follow-ups | Notification permission silent failure; closeness stale | In-app dashboard surfacing primary; auto-decay closeness from last contact |
| Phase 5 — Settings / data mgmt | Export-only with no import = backup theatre | Use `dexie-export-import`; round-trip test |
| Phase 5 — Seed data | Cringe names; non-idempotent seeding | Plausible diverse names; transactional seed; `meta.seeded` flag |
| Phase 6 — Polish / theming | Time sink; bundle bloat | Lock theme tokens; per-component shadcn imports; check bundle size |
| Deploy | basePath/assetPrefix wrong; 404 on hard refresh | Verify GH Pages deploy at end of Phase 1; `trailingSlash: true`; copy `index.html → 404.html` |

---

## Workshop-Demo Pitfalls (Specific to Live Demo)

### Pitfall: Workshop attendees' `npm install` fails due to Node version / lockfile mismatch
**What goes wrong:** Attendees on Node 18 fail to install; lockfile was committed under Node 22. Or pnpm vs npm mismatch.
**Prevention:** Pin Node version in `.nvmrc` and `package.json engines`. Use npm (most universal). Test install on a fresh machine before the workshop. Provide a `pnpm-lock.yaml`-or-`package-lock.json` choice consistently.

### Pitfall: First `npm run dev` takes 40 seconds on attendees' machines, dragging the demo
**What goes wrong:** Next.js cold start on a fresh clone is slow; attendees stare at a blank tab while the facilitator talks.
**Prevention:** Prebuild dependency cache in `node_modules` if possible. Use `turbopack` for dev (`next dev --turbo`) — significantly faster. Open Next.js docs in another tab for fill while it boots.

### Pitfall: HMR breaks unexpectedly when editing `db.ts` live
(See "Hot reload breaks mid-demo" above.) Test the live-edit moments before the workshop.

### Pitfall: First-run flow has edge cases nobody tested (empty DB, partial seed, second visit)
**What goes wrong:** Attendee's first interaction is a confusing prompt or empty dashboard.
**Prevention:** Manually run the first-run flow on a clean profile *the morning of the workshop*. Document the expected sequence in README.

### Pitfall: Demo runs in a tab with extensions that block IndexedDB (Privacy Badger, etc.)
**What goes wrong:** Facilitator's main browser has aggressive privacy extensions; demo silently fails to persist.
**Prevention:** Demo in a fresh Chrome profile or incognito-with-IndexedDB-enabled. Test the demo in the exact environment that will be projected.

### Pitfall: Live commits during the workshop don't match the planned phase narrative
**What goes wrong:** Branch `02-discussion` was meant to introduce planning artifacts, but a last-minute fix shoehorned in a feature commit.
**Prevention:** Lock teaching branches a week before. Use a separate scratch branch for last-minute fixes; cherry-pick only after the workshop.

### Pitfall: Projector renders the app at 1080p; mobile-first layout looks tiny
**What goes wrong:** Bottom nav and 375px-width design look like a phone screenshot in the middle of a big screen — content area is a sliver, attendees can't read.
**Prevention:** Use browser devtools' device toolbar set to "iPhone 14 Pro" for the mobile demo segment, then switch to "Responsive — desktop" for the master-detail layout. Pre-zoom (Cmd+= a few times) so text is readable from the back row.

### Pitfall: Workshop attendees who fork see "demo-only hacks" that don't generalize
**What goes wrong:** A `// FIXME — demo only` constant in `seed.ts`; a route guard that's commented out "for the workshop"; a debug-only `console.log` chain.
**Prevention:** No demo-only code. Anything that wouldn't make it through a normal code review doesn't ship. The codebase is the teaching asset.

---

## Sources

All accessed 2026-05-12. Confidence labels reflect signal strength of the source (official docs and well-known issue trackers = HIGH; tutorial blogs = MEDIUM).

### Next.js static export, App Router, GH Pages
- [Next.js Guides: Static Exports](https://nextjs.org/docs/app/guides/static-exports) — HIGH (official)
- [Next.js generateStaticParams API reference](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — HIGH (official)
- [Next.js trailingSlash config reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash) — HIGH (official)
- [Support dynamic routes with dynamic params in static export #55393](https://github.com/vercel/next.js/discussions/55393) — HIGH (issue thread, confirms the limitation)
- [Static export with basePath causes request issues #73427](https://github.com/vercel/next.js/issues/73427) — HIGH (issue thread)
- [Next.js basePath and assetPrefix for GitHub Pages — James Wallis](https://wallis.dev/blog/next-js-basepath-and-assetprefix) — MEDIUM (community blog, well-cited)
- [next/image unoptimized with static export #27231](https://github.com/vercel/next.js/issues/27231) — HIGH (issue tracker)
- [output: 'export' with images optimization #60977](https://github.com/vercel/next.js/discussions/60977) — HIGH

### Dexie / IndexedDB
- [Dexie useLiveQuery hook docs](https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) — HIGH (official)
- [Dexie schema versioning — Mastering Dexie.js](https://app.studyraid.com/en/read/11356/355124/defining-database-schema-and-versions) — MEDIUM
- [Dexie versioning rollback issue #1599](https://github.com/dexie/Dexie.js/issues/1599) — HIGH (issue tracker)
- [LiveQuery issues with put/bulkPut #1225](https://github.com/dfahlander/Dexie.js/issues/1225) — HIGH
- [useLiveQuery not updating on db changes #1317](https://github.com/dexie/Dexie.js/issues/1317) — HIGH
- [Why IndexedDB is slow — rxdb.info](https://rxdb.info/slow-indexeddb.html) — HIGH (technical deep-dive)
- [Speeding up IndexedDB reads and writes — Nolan Lawson](https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/) — HIGH (authoritative)
- [fake-indexeddb npm](https://www.npmjs.com/package/fake-indexeddb) — HIGH
- [Testing IndexedDB with Jest — DEV](https://dev.to/andyhaskell/testing-your-indexeddb-code-with-jest-2o17) — MEDIUM
- [Vitest + fake-indexeddb discussion #908](https://github.com/vitest-dev/vitest/discussions/908) — HIGH (issue thread)
- [How to use Dexie in Next.js — Webkul](https://webkul.com/blog/how-to-use-indexeddb-dexie-in-nextjs/) — MEDIUM

### Safari storage / mobile viewport
- [WebKit Updates to Storage Policy (7-day ITP eviction)](https://webkit.org/blog/14403/updates-to-storage-policy/) — HIGH (authoritative)
- [Safari periodically erasing LocalStorage and IndexedDB — bug #266559](https://bugs.webkit.org/show_bug.cgi?id=266559) — HIGH
- [Storage quotas and eviction criteria — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — HIGH
- [100vh problem with iOS Safari — DEV](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9) — MEDIUM
- [Large, Small, and Dynamic Viewports — Bram.us](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/) — HIGH (CSS WG context)
- [Fix mobile keyboard overlap with VisualViewport — DEV](https://dev.to/franciscomoretti/fix-mobile-keyboard-overlap-with-visualviewport-3a4a) — MEDIUM

### shadcn/ui + Radix
- [shadcn/ui Dialog docs](https://ui.shadcn.com/docs/components/radix/dialog) — HIGH (official)
- [shadcn/ui Form (react-hook-form) docs](https://ui.shadcn.com/docs/forms/react-hook-form) — HIGH
- [Radix z-index issues with portals #1317](https://github.com/radix-ui/primitives/issues/1317) — HIGH
- [shadcn Select reset with RHF #549](https://github.com/shadcn-ui/ui/issues/549) — HIGH
- [Form reset doesn't clear fields #1763](https://github.com/shadcn-ui/ui/issues/1763) — HIGH
- [shadcn/ui Dark Mode docs](https://ui.shadcn.com/docs/dark-mode) — HIGH
- [Fixing dark mode FOUC in Next.js — Not A Number](https://notanumber.in/blog/fixing-react-dark-mode-flickering) — MEDIUM

### Hydration / SSR
- [How to fix "window is not defined" and hydration mismatch — Eric Burel](https://medium.com/@eric.burel/how-to-get-rid-of-window-is-not-defined-and-hydration-mismatch-errors-in-next-js-567cc51b4a17) — MEDIUM
- [Next.js react-hydration-error doc](https://nextjs.org/docs/messages/react-hydration-error) — HIGH (official)
- [Hydration mismatch errors — LogRocket](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/) — MEDIUM

### Accessibility / touch targets
- [WCAG 2.5.5 Target Size — W3C](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) — HIGH (standard)
- [Accessible target sizes — Smashing Magazine](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/) — HIGH

### Local-first / data resilience
- [Local-first software — Ink & Switch](https://www.inkandswitch.com/essay/local-first/) — HIGH (canonical essay)
- [Why local-first is the future and its limitations — RxDB](https://rxdb.info/articles/local-first-future.html) — MEDIUM

### Notifications
- [Notification requestPermission — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static) — HIGH
- [PWA push notifications and permission denied — appinstitute](https://appinstitute.com/ultimate-guide-to-pwa-push-notifications/) — MEDIUM

### Performance / virtualization
- [Debounce search input in React — DEV](https://dev.to/manishkc104/debounce-input-in-react-3726) — MEDIUM
- [How and when to debounce or throttle — LogRocket](https://blog.logrocket.com/how-and-when-to-debounce-or-throttle-in-react/) — MEDIUM
