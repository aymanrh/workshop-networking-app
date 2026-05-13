# Phase 4: Search, Seed, Polish & Ship - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning
**Mode:** Smart discuss (4 grey areas, all accepted)

<domain>
## Phase Boundary

Make the app workshop-grade: searchable across people, seeded with a delightful first-run experience, backed by JSON export/import from a header menu, polished in its loading/empty/error states, documented for forkers, and deployed to both GitHub Pages and Vercel.

**In scope** (SRC-01..04, SET-02, SET-03, SED-01..04, POL-01..03, POL-05):
- TopBar search Input (mobile: icon → expandable; desktop: persistent slim search). Popover dropdown shows live results below the input as user types (debounced 250ms) and supports closeness + tag chip filters in the same surface.
- Search across **people** by name (prefix-boosted), tag, role, notes — debounced 250ms.
- Closeness filter chips + tag filter chip row inside the search popover. Filters apply to the popover results AND to a dedicated `/search` page reachable via Enter on the input (Phase 4 ships the popover; the route may stay as an inline section).
- TopBar overflow `⋯` DropdownMenu visible on both viewports: `Load sample data`, `Export data`, `Import data`.
- `lib/seed/data.ts` — 8 people + 4 events with stable ULIDs and plausible content.
- `lib/seed/load-seed.ts` — idempotent loader that checks for existing ids before inserting; sets `meta.key="seedLoaded"` for first-run detection.
- `lib/io/export.ts`, `lib/io/import.ts` — `dexie-export-import` round-trip with confirm-replace UX.
- `SeedPromptCard` on Home — appears only when both stores are empty AND user hasn't dismissed. "Load sample data" loads; "Start empty" sets `meta.key="seedDismissed"`.
- Home page (`/`) — minimal v1 dashboard: greeting, counts (People / Events) if data exists; SeedPromptCard or empty-state card otherwise. (Full at-a-glance Home is v2 HOM-01..04.)
- Polish pass: confirm every list has Skeleton + EmptyState + visible error path (toast on caught errors). Touch targets ≥44px on mobile. Type/spacing tokens already locked in Phase 2 — re-verify.
- README sections: project description → workshop arc → stack → local run → build → deploy (GH Pages + Vercel) → fork & extend → GSD workflow link.
- Playwright config + one smoke E2E shipped (not wired to CI) — `pnpm e2e` runs locally.

**Out of scope for this phase** (deferred):
- Touchpoint UI / follow-up date editor — v2
- Search of events (people-only in v1) — v2
- Home dashboard with today's follow-ups + upcoming events — v2 (HOM-01..04)
- Dedicated Settings page (reset, footprint metrics, theme moved out of header) — v2 (SET-01, SET-04, SET-05)
- Onboarding flow — explicit Out of Scope
- Cmd+K command palette — v2 (PRD-01)
- Full E2E suite — only one smoke E2E for v1

</domain>

<decisions>
## Implementation Decisions

### Search (SRC-01..04)

- **D-01:** Search surface — `SearchInput` component in TopBar.
  - Mobile (`<md`): renders as a `Search` lucide icon button by default; tapping opens a slide-down input above the page content (sticky below TopBar). Tapping outside closes.
  - Desktop (`≥md`): persistent slim input occupying the left-center of the TopBar (between the (hidden-on-desktop) title and the action buttons).
- **D-02:** Results render in a shadcn `Popover` anchored to the input. Opens when input has focus AND (query OR any filter is non-default). Closes on outside-click and Escape.
- **D-03:** Filter row above results in the popover:
  - Closeness chips: `All`, `Close`, `Warm`, `Cooling` — single-select.
  - Tag chips: top 8 most-frequent tags (from existing people) as filter chips; tapping toggles AND-filter inclusion. Show "+N" overflow if more than 8 (no UI to reveal in v1 popover; tags beyond top-8 reachable via free-text search).
- **D-04:** Search algorithm:
  - Normalize query: `query.trim().toLowerCase()`
  - Score:
    - Name `startsWith(q)` → 1000 (prefix boost per SRC-02)
    - Name `includes(q)` → 100
    - Tag exact match → 80
    - Role / company `includes(q)` → 40
    - Notes `includes(q)` → 10
  - Apply closeness filter and tag filters AFTER scoring; only filtered results render.
  - Empty query + active filters → return all people matching filters, sorted by `lastContactAt` desc (no scoring needed).
  - Empty query + no filters → popover hidden.
- **D-05:** Debounce 250ms via a small `useDebouncedValue` hook (CLAUDE.md: no demo-only hacks — keep this utility named clearly).
- **D-06:** Results list: up to 8 visible rows in the popover (`overflow-y-auto max-h-80`). Each row is a compact `<Link>` to `/people/{id}` showing name + role + closeness chip — match the `PersonCard` rhythm in dense form.
- **D-07:** Empty-results copy: `No matches. Try a shorter query or drop a tag.` (mirrors REQUIREMENTS.md SRC-04 literal).
- **D-08:** Search hook: `useSearchPeople(query, closeness, tags)` — internally uses `useLiveQuery` on people. Cheap for v1 dataset sizes (≤a few thousand people). No external search index in v1.

### Export / Import (SET-02, SET-03)

- **D-09:** Header overflow menu — single shadcn `DropdownMenu` triggered by `MoreHorizontal` (lucide) icon button in TopBar (replaces the "slot reserved" comment from Phase 2). Visible on both viewports.
- **D-10:** Menu items, in order:
  1. `Load sample data` (also fires from SeedPromptCard)
  2. `Export data`
  3. `Import data`
- **D-11:** `dexie-export-import` for round-trip. The package handles all stores + multi-entry indexes correctly.
- **D-12:** Export flow:
  - Click → `exportData()` returns a Blob from `dexie-export-import` (`exportDB(db)`).
  - Trigger download via a temporary `<a href={URL.createObjectURL(blob)} download="networking-app-{date}.json">`.
  - Toast `Exported {N} people / {M} events`.
- **D-13:** Import flow:
  - Click → opens a hidden `<input type="file" accept="application/json">` (created on-the-fly + clicked programmatically).
  - On file pick → read text → show AlertDialog: "Replace all your current data with the imported file? Your current data ({N} people, {M} events) will be erased."
  - Confirm → `await db.delete(); await db.open(); await importInto(db, blob)`.
  - Toast `Imported {N} people / {M} events`.
- **D-14:** Errors: malformed JSON → toast "Couldn't read that file."; mismatched schema version → toast "This file was exported from a newer version of the app."

### Seed (SED-01..04)

- **D-15:** `lib/seed/data.ts` — exports `SEED_PEOPLE: NewPerson[]` and `SEED_EVENTS: NewEvent[]` with stable id fields baked in. Names per CONTEXT.md spec list:
  - Sara Kim — Designer at Linear, NYC, ★ close
  - Kareem Tate — PM at Notion, Brooklyn, 🔥 warm
  - Mason Lee — Founder at unknown, SF, 🔥 warm
  - Layla Hassan — Engineer at Anthropic, Cairo, ❄ cooling
  - Diego Ortiz — Product designer at Stripe, NYC, 🔥 warm
  - Priya Patel — Data scientist at Pinecone, Brooklyn, ★ close
  - Tomáš Novák — Engineer at Vercel, Prague, 🔥 warm
  - Aisha Bello — Founder at Stealth, Lagos, ❄ cooling
  Plus tags, role/company, 1-line notes that feel real.
- **D-16:** Events:
  - React NYC Meetup (last week, attended)
  - AI Tinkerers Cairo (yesterday, attended)
  - Design Systems Conf (next Thursday, going)
  - Founder Brunch SF (in two weeks, interested)
- **D-17:** Stable seed ids — generate at module-load time via deterministic IDs (e.g., `seed-person-sara-kim`). Since Phase 1 mandated ULIDs for the prod schema, the seed uses a `seed:` prefix on the id to keep it human-readable in DevTools. The id field is a `string` per Phase 1 type; no type change needed.
- **D-18:** `loadSeed()` in `lib/seed/load-seed.ts`:
  - For each seed person, `db.people.put({...row})` — `put` is upsert by id, so re-running is idempotent.
  - For each seed event, similar `db.events.put`.
  - Update each event's `attendees` array with the seed person ids it should have (3-5 attendees per event).
  - Update each person's `eventMetId` accordingly.
  - Set `meta.put({ key: "seedLoaded", value: true })`.
  - Toast `Loaded sample data`.
- **D-19:** First-run prompt: `SeedPromptCard` rendered on `/` Home when `useFirstRunState()` returns `"prompt"`. State machine:
  - If `people.count > 0` OR `events.count > 0` → `"data"` (no prompt)
  - Else if `meta.seedDismissed === true` OR `meta.seedLoaded === true` → `"data"` (or `"empty-after-dismiss"`)
  - Else → `"prompt"`
  - Render prompt card with "Load sample data" (calls `loadSeed`) and "Start empty" (writes `meta.seedDismissed: true`).
- **D-20:** Home page (`/`) ships in this phase to host the prompt. Minimal layout: greeting, optional counts row (if any data), and the prompt OR an empty-state card. Avoid v2 Home creep.

### Polish (POL-01..03)

- **D-21:** Audit all list/detail views — confirm each has Skeleton, EmptyState, and error toast. Already done by Phases 2-3; this is a verify-and-fix pass, not a rewrite.
- **D-22:** Touch targets — confirm all interactive controls are ≥44×44 on mobile. The FAB is 56×56 (already exceeds). Inspect buttons, chip × icons, overflow trigger.
- **D-23:** Token consistency — type scale (text-xs/sm/base/lg/xl/2xl), spacing (multiples of 4), restrained palette already locked. POL-02 is verify, not redo.

### README (POL-05)

- **D-24:** Rewrite `README.md`:
  1. **What this is** — one paragraph
  2. **Workshop** — 2026-05-30 workshop reference + branch arc `00-empty → 01-planning → 02-discussion → 03-milestone`
  3. **Stack** — bullet list
  4. **Local run** — `pnpm install && pnpm dev` AND `npm install && npm run dev`
  5. **Build & test** — `pnpm run build`, `pnpm test`
  6. **Deploy** — GH Pages (auto on `main` push), Vercel (connect repo, no config needed)
  7. **Fork & extend** — short guide: schema lives at `lib/db/db.ts`; entity types at `lib/db/types.ts`; repos at `lib/db/repositories/*`; live-query hooks at `hooks/*`; new features = parallel folder under `components/`. Pointer to `CLAUDE.md` for conventions.
  8. **GSD framework** — link to GSD docs and the workshop URL.

### Vercel deploy (POL-05 second target)

- **D-25:** No code changes required. README documents: "Connect the repo on Vercel — root output dir defaults to `out/` from `output: 'export'`. No env vars."

### Playwright smoke E2E

- **D-26:** Install Playwright as a dev dep; commit `playwright.config.ts` + one test in `e2e/smoke.spec.ts`. Test covers: visit `/`, dismiss seed prompt, add a person (FAB → fill name → submit), assert card appears, navigate to detail, edit closeness, return to list. No CI wiring.
- **D-27:** `package.json` adds `"e2e": "playwright test"`. Browsers are installed by `pnpm exec playwright install` (documented).

### Routes & files (target)

- `app/page.tsx` — replace placeholder Home with conditional seed prompt + counts
- `components/search/SearchInput.tsx`
- `components/search/SearchPopover.tsx`
- `components/search/SearchResultRow.tsx`
- `components/search/SearchFilters.tsx`
- `components/home/SeedPromptCard.tsx`
- `components/home/HomeCounts.tsx`
- `components/shell/header-menu.tsx`
- `components/ui/dropdown-menu.tsx` — already exists
- `lib/seed/data.ts`, `lib/seed/load-seed.ts`
- `lib/io/export.ts`, `lib/io/import.ts`
- `hooks/use-search-people.ts`
- `hooks/use-debounced-value.ts`
- `hooks/use-first-run-state.ts`
- `e2e/smoke.spec.ts`
- `playwright.config.ts`

### Modifications to Phase 2/3 surface (minimal)

- **D-28:** TopBar gains: SearchInput (left/middle area), HeaderMenu (right) — both visible across viewports with mobile/desktop layout tweaks.
- **D-29:** README.md is fully rewritten — Phase 1 ship is the baseline; Phase 4 adds workshop + extension docs.

### Claude's Discretion

- Exact debounce ms (200 vs 250 vs 300) — REQUIREMENTS.md SRC-02 says ~250ms; use 250.
- Tag-frequency calculation for filter chips — count occurrences across people in the active live-query result, take top 8 alphabetical ties.
- Whether to ship a small `lib/search.ts` extracting the score function for testability — YES, mirrors `lib/tags.ts` pattern.
- Exact seed names — list is in D-15; can swap if any feel off in execution. Notes should feel like a real notebook — short, specific, varied.
- Playwright browser to ship — chromium only is fine for the smoke; documented.

</decisions>

<canonical_refs>
## Canonical References

### Project framing
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md` §Search & Filter (SRC-01..04), §Data Management (SET-02, SET-03), §First Run & Seed Data (SED-01..04), §Polish (POL-01..05)
- `.planning/ROADMAP.md` §"Phase 4"
- `.planning/phases/01-foundation-static-export-spine/01-CONTEXT.md` — schema lock, deploy decisions
- `.planning/phases/02-people/02-CONTEXT.md` — TopBar slot reservation, search note
- `.planning/phases/03-events-linking/03-CONTEXT.md` — TopBar route-aware buttons, tag suggestions over both stores
- `CLAUDE.md` — Conventions (export round-trip; comments policy)

### Existing surface to extend (not reshape)
- `components/shell/top-bar.tsx` — add search + header menu without breaking route-aware Add button
- `app/page.tsx` — replace Home placeholder
- `app/layout.tsx` — already mounts Toaster
- `lib/db/db.ts` — schema locked
- `hooks/use-people.ts`, `hooks/use-events.ts`, `hooks/use-tag-suggestions.ts` — leverage existing live-queries
- `lib/tags.ts` — re-use `normalizeTag` for filter chips

### External
- `dexie-export-import` npm package — docs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- All Phase 2/3 components carry over unchanged
- `useLiveQuery` patterns
- `Toaster`, `AlertDialog`, `DropdownMenu`, `Popover`, `Command`, `Sheet`, `Badge`, `Input` — all installed

### Established Patterns
- Repository writes; hook reads; three-state render
- Tag normalization on save
- Sheet for context-keeping flows; Dialog for brief decisions
- Route-aware shell triggers (Phase 3) — search input + menu can coexist with these

### Integration Points
- TopBar layout: re-balance to fit SearchInput (flex-grow on desktop), RouteAwareAddButton (right), HeaderMenu (rightmost), ThemeToggle (mobile-only at far right).
- Sidebar (desktop) still owns ThemeToggle in its bottom row.
- Home page swaps from "Welcome" to either the SeedPromptCard or a minimal counts strip.

</code_context>

<specifics>
## Specific Ideas

- Search must "feel instant" — 250ms debounce is the boundary. Anything more is sluggish on a workshop demo.
- Seed data names are a small but high-leverage authorial choice — they should feel like real people the user might actually meet at NYC + Cairo + SF + Lagos meetups.
- Export filename: `networking-app-YYYY-MM-DD.json` so multiple exports stay sorted.
- Import "replace" model is the simpler, less-corruptible choice for a workshop demo.
- README must get a forker from clone-to-running in under 5 minutes per ROADMAP success criterion.

</specifics>

<deferred>
## Deferred Ideas

- Cmd+K command palette — v2 (PRD-01)
- Saved smart lists ("Designers in NYC") — v2 (PRD-03)
- Search of events — v2
- Tag management UI (rename / merge tags) — explicitly Out of Scope
- Browser push notifications for follow-ups — Out of Scope
- Touchpoint UI / follow-up editor — v2 (TCH-01..06)
- Home dashboard (today's follow-ups + upcoming events at a glance) — v2 (HOM-01..04)
- Settings page (reset, footprint metrics) — v2 (SET-01, SET-04, SET-05)
- Auto-decay of closeness — v2 (SMR-02)
- Full E2E coverage — Phase 4 ships ONE smoke
- CI wiring for Playwright — v2

</deferred>

---

*Phase: 04-search-seed-polish-ship*
*Context gathered: 2026-05-13*
