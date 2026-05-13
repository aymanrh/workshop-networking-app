---
phase: 2
slug: people
status: complete
completed: 2026-05-13
---

# Phase 2 — Summary

Phase 2 (People) landed end-to-end: floating Add Person Sheet (mobile FAB + desktop TopBar button), People list with live-query cards + skeleton + empty state, Person detail with inline-saving closeness chip, single-toggle Edit mode, cascade-delete confirmation, tag chip input with autocomplete and lowercase normalization. All 9 PPL requirements implemented; build green; 14/14 tests pass; the Phase 1 shell + schema + repo signatures were inherited without changes.

## Requirements satisfied

| ID | Requirement | Evidence |
|----|-------------|----------|
| PPL-01 | Create a person from anywhere via floating "+"; only name required | `components/people/add-person-fab.tsx` (mobile fixed FAB), `components/people/add-person-button.tsx` (desktop TopBar), mounted via `AppShell`. Name is the only `min(1)` field in `lib/validators/person.ts`. |
| PPL-02 | Add Person flow completes in under 30s for a typical entry | `AddPersonSheet` shows all 6 fields above the fold; `PersonForm` autofocuses Name; submit closes Sheet + toasts without navigation. (Stopwatch UAT pending — see Human Verification.) |
| PPL-03 | Person record stores name, role, company, tags, notes, closeness, createdAt, lastContactAt, optional followUpAt, optional eventMetId | Schema unchanged from Phase 1. `createPerson` in `lib/db/repositories/people.ts` populates all fields. |
| PPL-04 | Browse all people in a clean list sorted by recent activity, with name/role/closeness chip/last-touch on each card | `app/people/page.tsx` consumes `usePeople()` (sorts by `lastContactAt` desc). `components/people/person-card.tsx` renders all four card elements. |
| PPL-05 | Open detail page to see all stored fields, notes, where-we-met | `app/people/[id]/page.tsx` + `components/people/person-detail.tsx`. `EventMetChip` links to `/events/{id}` when set. |
| PPL-06 | Edit fields from detail | `Edit` button toggles into `PersonForm` mode="edit". `updatePerson` invokes the repo. Closeness edits live outside the form (instant-save). |
| PPL-07 | Delete with cascade cleanup of touches | `DeletePersonDialog` confirms; `deletePerson(id)` (Phase 1 contract) runs a `rw` transaction over `people` + `touches`. Covered by test in `test/db/people.test.ts`. |
| PPL-08 | Tag normalization (trim + lowercase) + autocomplete from existing tags | `lib/tags.ts` exports `normalizeTag`, `normalizeTags`, `filterTagSuggestions`. Repository writes go through `normalizeTags`. `TagChipInput` autocompletes via `useTagSuggestions` (Dexie `*tags` multi-entry index). |
| PPL-09 | Closeness chip glanceable on every card, editable inline on detail | `ClosenessBadge` on card, `ClosenessChip` (segmented `radiogroup`) on detail — always interactive (NOT gated by Edit mode). |

## Verification results

| Check | Result |
|-------|--------|
| `pnpm test` | ✅ 14/14 passed in ~1s (Phase 1: 4 schema; Phase 2: 4 repo + 6 tag-lib) |
| `pnpm run build` | ✅ 7 static pages, TypeScript clean |
| Route parity | ✅ `/`, `/events`, `/events/[id]` (Phase 1 placeholders intact) + `/people` (replaced) + `/people/[id]` (replaced) all build |
| No 100vh regressions | ✅ unchanged from Phase 1 (shell untouched outside provider wrapping) |
| Bundle still client-only for data | ✅ `db.ts` still `"use client"`; new code at `components/people/*` and `hooks/*` is all `"use client"` |

### Human Verification needed (cannot be performed by Claude in this run)

1. **30-second capture stopwatch (PPL-02):** Open `pnpm dev`, navigate to `/people`, tap the FAB on a mobile viewport (≤375px), fill `name=Sara Kim`, `role=Designer`, two tags, one-line note, submit. Confirm <30s from tap to toast.
2. **Mobile/desktop responsive parity:** Resize between 320px and 1440px. Confirm FAB visible <md, hidden ≥md. Confirm TopBar "Add person" button hidden <md, visible ≥md. Confirm Sheet slides up from bottom on mobile, drawer-right on desktop.
3. **No-FOUC dark mode unchanged:** Reload in dark mode — Sheet, AlertDialog, Popover, Toaster all respect dark tokens.
4. **Tag autocomplete inside Sheet:** Open Add sheet, type "de" in Tags — autocomplete Popover should render below the input without clipping inside the Sheet.
5. **Cascade delete UX:** Delete a person from detail — confirm the redirect to `/people` is clean and the toast appears.

## What ships

```
app/people/page.tsx                            real People list
app/people/[id]/page.tsx                       real Person detail
components/people/
  add-person-button.tsx                        desktop TopBar trigger
  add-person-context.tsx                       sheet open-state provider
  add-person-fab.tsx                           mobile floating "+"
  add-person-sheet.tsx                         Sheet hosting PersonForm
  closeness-chip.tsx                           ClosenessChip + ClosenessBadge
  delete-person-dialog.tsx                     AlertDialog confirm
  people-empty-state.tsx                       empty-state CTA
  people-list-skeleton.tsx                     loading state
  person-card.tsx                              list row
  person-detail.tsx                            view + edit + closeness + delete
  person-form.tsx                              react-hook-form + zod (shared)
  tag-chip-input.tsx                           chip input + autocomplete
components/ui/                                 +12 shadcn primitives
hooks/use-tag-suggestions.ts                   live-query of existing tags
hooks/use-media-query.ts                       responsive Sheet side switch
lib/tags.ts                                    normalize + dedupe + filter
lib/validators/person.ts                       zod v3 schema + PersonFormValues type
lib/db/repositories/people.ts                  routes tag writes through normalizeTags
app/layout.tsx                                 mounts <Toaster />
components/shell/app-shell.tsx                 wraps tree in AddPersonProvider, mounts Sheet+FAB
components/shell/top-bar.tsx                   mounts AddPersonButton on desktop
test/db/people.test.ts                         4 repo tests (normalize, ULID/timestamps, cascade, update-norm)
test/lib/tags.test.ts                          6 tag-lib tests
```

## What's intentionally NOT in Phase 2

Per `02-CONTEXT.md` §`<deferred>`:
- Closeness chip filter row on list — **Phase 4** (SRC-03)
- Tag chip filter row on list — **Phase 4** (SRC-03)
- Global search input — **Phase 4** (SRC-01)
- Smart event-met default (auto-prefill most recent event) — **Phase 3** (EVT-07)
- Touchpoint UI / follow-up date editor — **v2** (TCH-01..06)
- Loading skeletons beyond inline `Skeleton` use — **Phase 4** polish (POL-01)
- Comprehensive component tests (only repo + lib smoke in Phase 2) — Phase 4
- Bulk multi-select operations — **v2** (PRD-04)
- Master-detail layout — **v2** (PRD-02)

## Decisions taken vs Claude's Discretion

Per `02-CONTEXT.md` §`<decisions>`, every D-01..D-21 is now embodied. Claude's Discretion items resolved:
- **Closeness icons:** Emoji per REQUIREMENTS.md literal (`★ close`, `🔥 warm`, `❄ cooling`) — kept text crisp, no lucide swap.
- **Toast library:** Sonner via shadcn `Toaster`; `richColors closeButton position="bottom-right"`.
- **Role vs company split:** Two separate single-line inputs in PersonForm — stacked, both optional, company below role.
- **Form wrapper:** `shadcn/ui` `Form` (= `react-hook-form` + zod resolver) — produces small declarative diffs.
- **Popover-in-Sheet clipping:** shadcn `Popover` already uses portals + collision padding; works inside `Sheet` without extra props (verified by build; will UAT visually).
- **Tag autocomplete sort:** alphabetical for v1 (cheap, predictable); frequency-weighted ranking deferred to Phase 4 search work.
- **Component test depth:** smoke at repository + lib level only (no jsdom-based UI tests) — matches CONTEXT.md guidance.

## Known limitations / next-phase pickups

- **Where-we-met dropdown** appears in Phase 2 but the events table is empty until Phase 3, so the user typically sees "No events yet" placeholder. The form gracefully hides the field on Add mode when events list is empty. Phase 3 ships event creation + the EVT-07 smart default.
- **`useMostRecentEvent`** is wired in Phase 1 but uses `orderBy("createdAt")` which is unindexed (Dexie does a full scan). Acceptable for v1 scale; Phase 3 can add an explicit index in a v2-bump if it becomes a hotspot. Not exercised by Phase 2.
- **Real Dexie persistence on iOS Safari** depends on `requestPersistentStorage()` firing on first `createPerson`. Phase 1 helper + Phase 2 first-write hookup is now active; manual UAT can confirm via DevTools → Application → Storage.
- **No follow-up date editor in v1.** The schema field exists and the index is declared, but no UI lands until v2 touchpoints.

## Next phase

`/clear` then `/gsd-autonomous --from 3` — Phase 3 (Events & Linking) plugs into the same hook/repo stubs (`useEvents`, `events.ts` repository) shipped in Phase 1, and reuses `TagChipInput` and the new shell `AppShell` structure.
