---
phase: 3
slug: events-linking
status: human_needed
verified_at: 2026-05-13
automated_pass: true
human_needed: true
---

# Phase 3 — Verification

## Automated checks

| Check | Command | Result |
|-------|---------|--------|
| TypeScript + production build | `pnpm run build` | ✅ pass — 7 static pages, types clean |
| Unit tests | `pnpm test` | ✅ 20/20 pass |
| Phase 3 repo tests | `test/db/events.test.ts` | ✅ 6/6 (ULID + normalize, update normalize, cascade, idempotent addAttendee, touch lastContactAt, removeAttendee inverse) |
| Phase 1+2 regressions | included in run | ✅ none |
| Route emission | build output | ✅ unchanged |
| Client-only Dexie | `db.ts` `"use client"` unchanged | ✅ |

## must_haves

- [x] Events CRUD (create, browse, view, edit, delete) — EVT-01..03, EVT-06
- [x] Bulk-add existing people as attendees via picker — EVT-04
- [x] "+ New person" rhythmic loop from event — EVT-05 (keep-open toggle + inline Added confirm + form remount)
- [x] Delete event cascade clears `eventMetId` on linked people — EVT-06 (test verifies)
- [x] Smart event-met default — EVT-07 (`useMostRecentEvent` → form default)
- [x] No regressions in Phase 2 surface
- [x] Build + tests green

## Human verification required

H1–H8 from SUMMARY.md. Autonomous workflow surfaces these via `human_needed` status.

## Conclusion

**Status:** `human_needed` — all automated checks pass; UX-level UAT requires a browser session.
