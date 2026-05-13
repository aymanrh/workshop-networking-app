---
quick_id: 20260513-e2e-regression-suite
description: E2E regression suite for v1.0 implemented features
date: 2026-05-13
status: complete
---

# Quick Task: E2E Regression Suite

## What changed

Added a 6-spec Playwright regression suite covering every v1.0 feature with implemented UI, plus per-step screenshot artifacts and three new pnpm scripts.

### New specs (in `e2e/`)

1. `01-people-crud.spec.ts` — add (uppercase tags → asserts lowercase normalization), edit, delete with confirm dialog.
2. `02-events-crud.spec.ts` — add future event, sectioning under "Upcoming", edit, delete.
3. `03-linking-event-met.spec.ts` — most-recent event pre-fills "Where you met"; attendees picker links existing people; remove attendee.
4. `04-search.spec.ts` — query narrows results; tag filter narrows further; deselect restores. Scoped to Radix `data-radix-popper-content-wrapper` to avoid colliding with person-card links.
5. `05-export-import-seed.spec.ts` — load seed (8 people · 4 events), export JSON via download event, reset DB, import same JSON, verify counts.
6. `06-theme-persistence.spec.ts` — dark mode adds `.dark` to `<html>` and survives reload; person added to IndexedDB survives reload.

### Helper

`e2e/helpers/test-setup.ts` — `startFresh(page)` (per-test entry; Playwright contexts are already isolated), `resetDb(page)` (mid-test wipe; closes the `globalThis.__networkingDb` Dexie singleton before `indexedDB.deleteDatabase`), `dismissFirstRun(page)`, `shot(page, name)`.

### Modified

- `e2e/smoke.spec.ts` — fixed strict-mode locator collision (toast vs card both named "Smoke Tester"); now asserts each via its own role.
- `next.config.ts` — `output: "export"` skipped when `E2E=1`. Next 16 enforces `generateStaticParams` at runtime in dev, which broke `/people/[id]` and `/events/[id]` navigation. Production builds (CI, GH Pages) still export.
- `playwright.config.ts` — sets `E2E=1` on the webServer, adds `screenshot: only-on-failure` + `video: retain-on-failure`.
- `package.json` — added `e2e:headed`, `e2e:ui`, `e2e:debug` scripts.
- `.gitignore` — ignore `test-results/` and `playwright-report/`.

## Verification

```
pnpm e2e
# 8 passed (21.6s)
```

Screenshots land in `test-results/screenshots/` — 30 PNGs across the 6 specs, plus the round-tripped seed JSON in spec 05.

## Out-of-scope (v2)

Per `.planning/v1.0-MILESTONE-AUDIT.md` the following are deferred to v2 and not in this regression suite: touchpoint UI, follow-up date editor, "Today's follow-ups" panel, dedicated `/settings` and `/search` routes.

## Note on the pipeline

This quick task was bookkept by hand because `gsd-sdk` is not installed locally. No PLAN.md / planner agent / executor agent spawned. The work is otherwise a normal atomic commit on the active branch.
