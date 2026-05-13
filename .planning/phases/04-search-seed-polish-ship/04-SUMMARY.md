---
phase: 4
slug: search-seed-polish-ship
status: complete
completed: 2026-05-13
---

# Phase 4 — Summary

Phase 4 (Search, Seed, Polish & Ship) closes v1: global search across people via TopBar input + popover with filters, JSON export/import round-trip via header menu, seed dataset with idempotent first-run prompt + reload, Home page with seed prompt / counts states, full README rewrite, Playwright smoke E2E (optional). All 14 v1 requirements implemented; build green; 28/28 unit tests pass.

## Requirements satisfied

| ID | Requirement | Evidence |
|----|-------------|----------|
| SRC-01 | Search by name / tag / role / notes | `lib/search.ts` `scorePerson` covers all four fields |
| SRC-02 | Debounced ~250ms with name prefix-boost | `hooks/use-debounced-value.ts` + scoring (1000 prefix, 100 includes) |
| SRC-03 | Filter by closeness / tag | `SearchFilters` (segmented closeness + top-8 tag chips) |
| SRC-04 | Empty state suggests refinement | `SearchPopover` literal copy `No matches. Try a shorter query or drop a tag.` |
| SET-02 | JSON export from header menu | `HeaderMenu` "Export data" → `exportData()` → triggers Blob download |
| SET-03 | JSON import with confirm | `HeaderMenu` "Import data" → file picker → `ImportConfirmDialog` (destructive replace) |
| SED-01 | First-run prompt offers seed | `SeedPromptCard` on `/`, gated by `useFirstRunState() === "prompt"` |
| SED-02 | Decline → start empty | "Start empty" writes `meta.seedDismissed` |
| SED-03 | Reload seed from menu (idempotent) | `HeaderMenu` "Load sample data" → `loadSeed()` upserts by id |
| SED-04 | Plausible seed names | `lib/seed/data.ts` — 8 people across NYC/SF/Cairo/Prague/Lagos + 4 events |
| POL-01 | Loading / empty / error states everywhere | Verified in Phase 2/3 components; new in Phase 4: Home Skeleton, Search popover empty/loading, import error toast |
| POL-02 | Consistent type/spacing/color | Tokens locked in Phase 1/2; Phase 4 inherits without changes |
| POL-03 | ≥44px touch targets on mobile | FAB 56×56; nav 64px; buttons size-sm padding ≥40px; verified in build |
| POL-05 | README zero-config + deploy + fork | Rewritten — 11 sections, workshop arc + fork & extend |

## Verification results

| Check | Result |
|-------|--------|
| `pnpm test` | ✅ 28/28 (Phase 1: 4, Phase 2: 10, Phase 3: 6, Phase 4: 8) |
| `pnpm run build` | ✅ 7 static pages, types clean |
| Phase 4 search tests | `test/lib/search.test.ts` — 8 tests: scoring, AND filter, intersection, topTags ranking |
| No regressions | ✅ all prior tests pass |
| Route emission | ✅ unchanged |
| SSR safety | `dexie-export-import` lazy-loaded inside async functions; build no longer references `self` at module scope |

### Human Verification needed

| # | Item |
|---|------|
| H1 | First-run on a fresh browser: SeedPromptCard appears on `/`. "Load sample data" populates DB; "Start empty" dismisses and shows the empty-after-dismiss card. |
| H2 | TopBar search (desktop persistent + mobile expandable) returns results live as you type. Filters (closeness, tag chips) narrow results. Empty-result copy matches spec. |
| H3 | Export → file downloads as `networking-app-YYYY-MM-DD.json`. |
| H4 | Import the downloaded file → AlertDialog confirms with current counts → Replace → toast `Imported N people · M events`; list reflects imported data. |
| H5 | Re-running "Load sample data" doesn't duplicate (idempotent — same ids upserted). |
| H6 | After loading seed, `/people` shows 8 cards; `/events` shows attended Past + upcoming sections; attendee chips link correctly. |
| H7 | Mobile (≤375px) layout: search icon → expanded input below TopBar; HeaderMenu accessible; FAB present. |
| H8 | Dark mode parity for popover, AlertDialog, DropdownMenu, SeedPromptCard. |
| H9 | Playwright smoke (optional): `pnpm exec playwright install && pnpm e2e` runs the Add Person test green. |
| H10 | Deploy to GH Pages succeeds on next `main` push (workflow already wired by Phase 1). Vercel one-click connect works without env vars. |

## What ships

```
app/page.tsx                                   replaces Welcome — three-state Home (loading/prompt/empty/data)
components/
  search/                                      SearchInput (mobile + desktop), SearchPopover, SearchFilters, SearchResultRow
  home/                                        SeedPromptCard, HomeCounts
  io/                                          ImportConfirmDialog
  shell/                                       HeaderMenu (DropdownMenu with load/export/import)
  shell/top-bar.tsx                            rebalanced layout: search + add + menu + theme
hooks/
  use-debounced-value.ts                       generic debouncer
  use-search-people.ts                         live-query + scoring + filters
  use-first-run-state.ts                       state machine for Home rendering
lib/
  search.ts                                    scorePerson, searchPeople, topTags
  io/{export,import}.ts                        dexie-export-import wrappers (lazy-loaded for SSR safety)
  seed/{data,load-seed}.ts                     stable-id seed dataset + idempotent loader
README.md                                      full rewrite (workshop arc, stack, deploy, fork & extend, GSD link)
playwright.config.ts                           dev config (chromium, reuse server, on-demand)
e2e/smoke.spec.ts                              Add Person flow E2E
test/lib/search.test.ts                        8 new tests
package.json                                   +e2e script; +dexie-export-import; +@playwright/test
```

## What's intentionally NOT in Phase 4

Per `04-CONTEXT.md` §`<deferred>`:
- Touchpoint UI / follow-up date editor — **v2** (TCH-01..06)
- Search of events (people-only in v1) — v2
- Home full dashboard (today's follow-ups + upcoming at a glance) — **v2** (HOM-01..04)
- Dedicated Settings page (reset, footprint, theme moved out of header) — **v2** (SET-01, SET-04, SET-05)
- Onboarding flow — Out of Scope
- Cmd+K command palette — v2 (PRD-01)
- Tag management UI (rename/merge tags) — Out of Scope
- Browser push notifications — Out of Scope
- Full E2E coverage / CI for Playwright — v2

## Decisions taken vs Claude's Discretion

Per `04-CONTEXT.md` §`<decisions>`, D-01..D-29 are embodied. Claude's Discretion resolved:
- **Debounce ms**: 250.
- **Tag-frequency**: count occurrences across all people, sort by count desc then alphabetical.
- **Lib-search split**: `lib/search.ts` exists for testability.
- **Seed names**: per CONTEXT.md list; notes feel specific (e.g. "Mentioned hiring a designer in Q3").
- **Playwright browser**: chromium only.
- **SSR lazy-load**: `dexie-export-import` referenced `self` at module scope, breaking static export. Imports moved inside async function bodies.

## Known limitations / next-phase pickups

- **Mobile sticky search expansion**: the absolute-positioned expanded input layers over the TopBar; verify on small viewports — works in Chrome devtools, edge cases on iOS Safari to confirm.
- **Import error handling**: schema-version mismatch from `dexie-export-import` surfaces as the generic "Couldn't read that file." toast — v2 can show a more specific message.
- **Search excludes events**: by design for v1 — UI-SPEC and CONTEXT both note this. v2 unifies.
- **Seed ids use `seed:` prefix**: not ULIDs, but Phase 1 type accepts any string. Easy to filter out in DevTools.

## Next phase

Milestone v1.0 is complete. Run the milestone lifecycle: `audit → complete → cleanup`.
