---
phase: 4
slug: search-seed-polish-ship
status: ready
mode: auto-chain
created: 2026-05-13
requirements: [SRC-01, SRC-02, SRC-03, SRC-04, SET-02, SET-03, SED-01, SED-02, SED-03, SED-04, POL-01, POL-02, POL-03, POL-05]
---

# Phase 4 — PLAN

Reference: `04-CONTEXT.md`, `04-UI-SPEC.md`, prior phase artifacts. Goal: workshop-grade — searchable, seeded, JSON-portable, polished, documented, deployable.

## Plan Index

| # | Plan | Output |
|---|------|--------|
| 4.01 | Install `dexie-export-import` (runtime) and `@playwright/test` (dev) | `package.json`, `pnpm-lock.yaml` |
| 4.02 | `useDebouncedValue` hook + `lib/search.ts` (scorePerson, searchPeople) + tests | `hooks/use-debounced-value.ts`, `lib/search.ts`, `test/lib/search.test.ts` |
| 4.03 | `useSearchPeople(query, closeness, tags)` hook (live-query over people, applies score + filters) | `hooks/use-search-people.ts` |
| 4.04 | `SearchFilters` component (closeness segmented + top-8 tag chips) | `components/search/search-filters.tsx` |
| 4.05 | `SearchResultRow` + `SearchPopover` | `components/search/{search-result-row,search-popover}.tsx` |
| 4.06 | `SearchInput` (mobile expandable + desktop persistent) | `components/search/search-input.tsx` |
| 4.07 | `lib/io/{export,import}.ts` round-trip helpers using `dexie-export-import` | `lib/io/export.ts`, `lib/io/import.ts` |
| 4.08 | `ImportConfirmDialog` (AlertDialog destructive replace) | `components/io/import-confirm-dialog.tsx` |
| 4.09 | `lib/seed/data.ts` (8 people + 4 events with stable seed-prefixed ids) | `lib/seed/data.ts` |
| 4.10 | `lib/seed/load-seed.ts` (idempotent upsert + meta flag) + `useFirstRunState` hook | `lib/seed/load-seed.ts`, `hooks/use-first-run-state.ts` |
| 4.11 | `SeedPromptCard` + `HomeCounts` + replace `/` page | `components/home/{seed-prompt-card,home-counts}.tsx`, `app/page.tsx` |
| 4.12 | `HeaderMenu` (DropdownMenu with seed/export/import) — wires file picker for import | `components/shell/header-menu.tsx` |
| 4.13 | Wire SearchInput + HeaderMenu into TopBar layout | `components/shell/top-bar.tsx` |
| 4.14 | README rewrite (workshop, stack, run, build, deploy, fork & extend, GSD link) | `README.md` |
| 4.15 | Playwright smoke E2E + config | `playwright.config.ts`, `e2e/smoke.spec.ts`, `package.json` (e2e script) |
| 4.16 | Local verification: build + tests + verification report | (no new files) |

## Detail per plan

### 4.01 — Install deps

`action`:
```bash
pnpm add dexie-export-import
pnpm add -D @playwright/test
```

`acceptance_criteria`:
- `package.json` contains `"dexie-export-import": ...` and `"@playwright/test": ...`
- `pnpm install` exits 0

`commit`: `chore(04): add dexie-export-import + @playwright/test`

---

### 4.02 — `useDebouncedValue` + `lib/search.ts` + tests

`action`:
- `hooks/use-debounced-value.ts`:
  ```ts
  "use client";
  import { useEffect, useState } from "react";
  export function useDebouncedValue<T>(value: T, delay = 250): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
  }
  ```
- `lib/search.ts`:
  - `scorePerson(person, q): number` per CONTEXT.md D-04.
  - `searchPeople(people, query, closeness, tags): Person[]` — applies score + filter + sort.
  - `topTags(people, limit = 8): string[]` — count tag occurrences, return top by freq then alphabetical.
- `test/lib/search.test.ts` — cover scoring boost order, closeness filter, tag AND filter, empty query + filters, topTags ranking.

`acceptance_criteria`:
- Prefix match scores higher than infix
- AND-tag filter requires all selected tags
- `pnpm test` adds ≥4 new passing tests

`commit`: `feat(04): useDebouncedValue + lib/search (scorePerson, searchPeople, topTags) + tests`

---

### 4.03 — `useSearchPeople`

`action`: live-query over all people; pipe through `searchPeople(allPeople, debouncedQuery, closeness, tags)`. Returns `Person[] | undefined`.

`acceptance_criteria`: returns sorted results; empty query + no filters returns `[]`.

`commit`: `feat(04): useSearchPeople hook`

---

### 4.04 — `SearchFilters`

`action`: closeness segmented (`All / ★ close / 🔥 warm / ❄ cooling`) + top-8 tag chip row using `topTags` from search.ts. Selected chips render `aria-pressed`.

`acceptance_criteria`: emits onChange callbacks for closeness + tags; renders.

`commit`: `feat(04): SearchFilters (closeness + top-8 tag chips)`

---

### 4.05 — `SearchResultRow` + `SearchPopover`

`action`:
- `SearchResultRow`: dense Link row — name + role/company + closeness badge
- `SearchPopover`: shadcn `Popover` anchored to the input; renders `SearchFilters` + result list + empty state copy from UI-SPEC
- Visibility: shown when (focus && (debouncedQuery !== "" || closeness !== "All" || tags.length > 0))

`acceptance_criteria`: popover shows/hides per visibility; empty state copy literal.

`commit`: `feat(04): SearchPopover + SearchResultRow`

---

### 4.06 — `SearchInput`

`action`: client component owning the controlled query state + closeness/tag filter state. Mobile: icon button → expandable sticky input. Desktop: persistent `<Input type="search" />` with leading Search icon. Wires `useDebouncedValue` + `useSearchPeople` + `SearchPopover`.

`acceptance_criteria`:
- `<input type="search">` present
- `aria-label="Search people"` on the input
- Popover renders results

`commit`: `feat(04): SearchInput with mobile/desktop layouts`

---

### 4.07 — `lib/io/export.ts` + `lib/io/import.ts`

`action`:
- `export.ts`:
  ```ts
  "use client";
  import { exportDB } from "dexie-export-import";
  import { db } from "@/lib/db/db";
  export async function exportData(): Promise<{ blob: Blob; counts: { people: number; events: number } }> {
    const [people, events] = await Promise.all([db.people.count(), db.events.count()]);
    const blob = await exportDB(db);
    return { blob, counts: { people, events } };
  }
  ```
- `import.ts`:
  ```ts
  "use client";
  import { importInto } from "dexie-export-import";
  import { db } from "@/lib/db/db";
  export async function replaceWithImport(blob: Blob): Promise<{ people: number; events: number }> {
    await db.delete();
    await db.open();
    await importInto(db, blob);
    const [people, events] = await Promise.all([db.people.count(), db.events.count()]);
    return { people, events };
  }
  export async function currentCounts() {
    const [people, events] = await Promise.all([db.people.count(), db.events.count()]);
    return { people, events };
  }
  ```

`acceptance_criteria`: both files start with `"use client"`; types compile.

`commit`: `feat(04): JSON export/import round-trip via dexie-export-import`

---

### 4.08 — `ImportConfirmDialog`

`action`: AlertDialog accepting `{ blob, counts, open, onOpenChange, onDone }`. On Replace → `replaceWithImport(blob)` + toast + onDone.

`acceptance_criteria`: literal copy match; destructive red button.

`commit`: `feat(04): ImportConfirmDialog (destructive replace)`

---

### 4.09 — `lib/seed/data.ts`

`action`: export `SEED_PEOPLE` and `SEED_EVENTS` with stable seed-prefixed ids and plausible content per CONTEXT.md D-15/D-16. Events reference person ids in their `attendees` arrays; people have matching `eventMetId`.

`acceptance_criteria`: file exports the two arrays; ids look like `seed:sara-kim`, `seed:react-nyc-meetup`; build is green.

`commit`: `feat(04): seed dataset (8 people + 4 events)`

---

### 4.10 — `loadSeed` + `useFirstRunState`

`action`:
- `lib/seed/load-seed.ts` — `loadSeed()` upserts each person + event via `db.{table}.put`, then sets `meta.seedLoaded = true`. Returns count loaded.
- `hooks/use-first-run-state.ts` — derives `"prompt" | "data" | "empty-after-dismiss" | undefined` from people count, event count, and meta keys.

`acceptance_criteria`: re-calling `loadSeed` doesn't duplicate; `useFirstRunState` transitions correctly on dismiss/load.

`commit`: `feat(04): seed loader + first-run state machine`

---

### 4.11 — Home page + components

`action`:
- `components/home/seed-prompt-card.tsx` — card with literal copy; Load button calls `loadSeed`; Start-empty writes `meta.seedDismissed: true`.
- `components/home/home-counts.tsx` — small muted row "{N} people · {M} events".
- Rewrite `app/page.tsx`: greeting; render based on `useFirstRunState()` state.

`acceptance_criteria`:
- `app/page.tsx` starts with `"use client";`
- Conditional rendering of SeedPromptCard / empty / counts based on state

`commit`: `feat(04): Home page with seed prompt + counts`

---

### 4.12 — `HeaderMenu`

`action`: `components/shell/header-menu.tsx` — DropdownMenu with three items. "Load sample data" → loadSeed + toast. "Export data" → exportData → trigger download. "Import data" → programmatic `<input type="file">` → on file pick → open ImportConfirmDialog with the blob.

`acceptance_criteria`: menu trigger has aria-label "App menu"; all three actions wired.

`commit`: `feat(04): TopBar HeaderMenu (load seed / export / import)`

---

### 4.13 — TopBar layout

`action`: Re-balance TopBar to host SearchInput (flex-grow on desktop, icon on mobile), RouteAwareAddButton (desktop), HeaderMenu (right of Add), ThemeToggle (mobile).

`acceptance_criteria`: TopBar renders all three trigger surfaces without overlap on 320px → 1440px.

`commit`: `feat(04): wire SearchInput + HeaderMenu into TopBar`

---

### 4.14 — README rewrite

`action`: full rewrite per CONTEXT.md D-24 sections.

`acceptance_criteria`:
- Contains: project description, workshop branch arc, stack list, pnpm + npm install instructions, build/test commands, GH Pages auto-deploy + Vercel connect-and-go, fork & extend, GSD framework link
- `grep "00-empty" README.md` matches
- `grep "GSD" README.md` matches

`commit`: `docs(04): README rewrite (workshop arc, stack, deploy, fork & extend)`

---

### 4.15 — Playwright smoke

`action`:
- `playwright.config.ts` — basic config: `webServer: { command: "pnpm dev", port: 3000, reuseExistingServer: true }`; `testDir: "e2e"`; chromium-only.
- `e2e/smoke.spec.ts` — one test: open `/`, dismiss seed prompt (if shown), tap "Add a person" / "+ Add person", fill name, submit, expect card to appear.
- `package.json` script `"e2e": "playwright test"`.

`acceptance_criteria`:
- `playwright.config.ts` exists
- `e2e/smoke.spec.ts` exists with one `test()`
- `package.json` has `e2e` script
- README documents `pnpm exec playwright install` before first run
- NOT wired to CI

`commit`: `test(04): Playwright config + smoke E2E (Add Person flow)`

---

### 4.16 — Verification

`action`:
- `pnpm run build` exits 0
- `pnpm test` exits 0 (≥24 tests passing — 20 prior + ≥4 new search-lib tests)
- Manual UAT items recorded in `04-VERIFICATION.md` per ROADMAP Phase 4 success criteria

`acceptance_criteria`: `04-VERIFICATION.md` exists with automated check results + H-items for human UAT.

`commit`: `docs(04): verification report` (written by verify step)

---

## must_haves

- Global search across people by name/tag/role/notes with prefix-boost — SRC-01, SRC-02
- Closeness + tag filter UI — SRC-03
- "No matches" empty state copy — SRC-04
- JSON export → import round-trip — SET-02, SET-03
- First-run seed prompt with idempotent loader — SED-01, SED-02, SED-03
- Plausible seed dataset (8 people + 4 events) — SED-04
- Skeleton + EmptyState + error toast across all list views — POL-01
- Type/spacing/color tokens verified consistent — POL-02
- ≥44px touch targets on mobile — POL-03
- README zero-config local run + deploy + fork — POL-05
- Build + tests green; no regressions to Phases 1-3

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `dexie-export-import` v1 export Blob has version metadata — re-import on a different schema version may fail | Toast catches errors with a clear message; user re-exports or starts fresh. |
| Search popover clipping on mobile when keyboard is up | Popover anchors to input; shadcn handles collision. |
| Seed ids using "seed:" prefix violate ULID format | Phase 1 schema accepts any string as id; only the form-generated ULIDs are ULID-shaped. Repo functions don't enforce ULID format. Safe. |
| Header menu overlap with theme toggle on mobile | TopBar uses `gap-1` + flex shrink ordering; verify in UAT. |
| Playwright browser install adds 200MB+ | Only run on demand; documented; not in CI. |

## Deferred

- Search of events
- Settings page (reset, footprint)
- Home full dashboard (today's follow-ups, upcoming) — v2
- Cmd+K palette
- CI for E2E
