---
phase: 2
slug: people
status: human_needed
verified_at: 2026-05-13
automated_pass: true
human_needed: true
---

# Phase 2 — Verification

## Automated checks

| Check | Command | Result |
|-------|---------|--------|
| TypeScript + production build | `pnpm run build` | ✅ pass — 7 static pages |
| Unit tests | `pnpm test` | ✅ 14/14 pass in ~1s |
| Schema tests (Phase 1 regression) | included in `pnpm test` | ✅ 4/4 pass |
| People repository tests (Phase 2) | `test/db/people.test.ts` | ✅ 4/4 pass (normalize, ULID/timestamps, cascade delete, update normalize) |
| Tag library tests | `test/lib/tags.test.ts` | ✅ 6/6 pass (normalize, dedupe, filter, exclusion) |
| Route emission | build output | ✅ `/`, `/people`, `/people/[id]`, `/events`, `/events/[id]` all emit |
| No `100vh` regressions | `grep -r "100vh" app/ components/ lib/` | ✅ no matches (shell uses `min-h-dvh`) |
| Client-only Dexie | `db.ts` starts with `"use client"` | ✅ unchanged |

## must_haves (goal-backward verification)

- [x] Floating "+" reachable from every screen (mobile FAB visible <md; desktop TopBar button visible ≥md) — covered by `AddPersonFab` + `AddPersonButton`, mounted in `AppShell`
- [x] Name-only required Add flow closes under 30s — code path verified (PersonForm autofocus name + minimal required validation + no navigation on submit); stopwatch UAT pending
- [x] People list sorted by recent activity with closeness chip on each card — `usePeople()` (lastContactAt desc) + `PersonCard` (ClosenessBadge)
- [x] Detail page with all stored fields + tag display + where-we-met link — `PersonDetail` renders all, `EventMetChip` linked
- [x] Edit toggle that lets every field be modified — `Edit` button toggles `PersonForm` in edit mode
- [x] Delete with confirm dialog and cascade-cleanup of touchpoints — `DeletePersonDialog` + `deletePerson` repo + test 3 verifies cascade
- [x] Tags normalized to trim+lowercase and deduped on save — `normalizeTags` in `lib/tags.ts`, applied in `createPerson` + `updatePerson`, verified by tests
- [x] Autocomplete suggesting existing tags — `useTagSuggestions` + `TagChipInput` + tests
- [x] Closeness chip editable inline (not gated by Edit mode) — `ClosenessChip` rendered outside form, calls `updatePerson` directly
- [x] `pnpm run build` green; `pnpm test` green — no Phase 1 regressions

## Human verification required

The following items need a person at a browser to confirm. Per `02-PLAN.md` §"Verification (UAT)":

| # | Item | Why human |
|---|------|-----------|
| H1 | 30-second-capture stopwatch on a mobile viewport | PPL-02 is a UX metric, not a code metric |
| H2 | FAB / Sheet responsive parity (320px ↔ 1440px) | Visual responsive check — Sheet `side` switch via `useMediaQuery` |
| H3 | Dark-mode parity for new surfaces (Sheet, AlertDialog, Popover, Toaster) | Visual contrast check |
| H4 | Tag autocomplete Popover doesn't clip inside Sheet | Z-index / portal verification — only visible at runtime |
| H5 | Cascade delete UX (toast + redirect) feels clean | Subjective UX check |
| H6 | Add 3+ people, verify list order matches Last seen / recent activity | Live data flow check |
| H7 | Re-load the page after closeness change — value persists | Persistence proof |
| H8 | `navigator.storage.persist()` granted after first create (DevTools → Application → Storage) | iOS-Safari eviction proof; FND-06 follow-through |

## Conclusion

**Status:** `human_needed` — all automated checks pass, but UX-level UAT requires a browser session. The autonomous workflow should surface H1–H8 to the user via the human_needed routing.
