---
phase: 4
slug: search-seed-polish-ship
status: human_needed
verified_at: 2026-05-13
automated_pass: true
human_needed: true
---

# Phase 4 — Verification

## Automated checks

| Check | Command | Result |
|-------|---------|--------|
| TypeScript + production build | `pnpm run build` | ✅ pass — 7 static pages, types clean |
| Unit tests | `pnpm test` | ✅ 28/28 (Phase 1: 4, Phase 2: 10, Phase 3: 6, Phase 4: 8) |
| Phase 4 search-lib tests | `test/lib/search.test.ts` | ✅ 8/8 (prefix-boost, tag exact, closeness filter, tag AND, intersection, topTags ranking) |
| SSR safety after lazy-loading dexie-export-import | build output | ✅ no `self is not defined` errors |

## must_haves

- [x] Global search across people by name/tag/role/notes with prefix-boost — SRC-01, SRC-02
- [x] Closeness + tag filters in search popover — SRC-03
- [x] No-match copy — SRC-04
- [x] JSON export + import round-trip — SET-02, SET-03
- [x] First-run prompt + idempotent loader — SED-01..03
- [x] Plausible seed dataset — SED-04
- [x] Polish floor preserved (Skeleton/Empty/Error coverage) — POL-01
- [x] Type/spacing/color consistent — POL-02
- [x] 44px touch targets — POL-03
- [x] README rewritten — POL-05
- [x] Build + tests green; no regressions

## Human verification required

H1–H10 listed in SUMMARY.md. Workflow surfaces these via `human_needed`.

## Conclusion

**Status:** `human_needed` — all automated checks pass; UAT requires a browser session.
