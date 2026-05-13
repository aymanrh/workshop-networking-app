---
phase: 3
slug: events-linking
status: complete
completed: 2026-05-13
---

# Phase 3 — Summary

Phase 3 (Events & Linking) shipped end-to-end. Events CRUD parallels People exactly, attendees flow with multi-select picker + EVT-05 rhythmic "Add another" loop works, and the EVT-07 smart event-met default pre-fills Add Person from anywhere when a most-recent event exists. All 7 EVT requirements implemented; build green; 20/20 tests pass.

## Requirements satisfied

| ID | Requirement | Evidence |
|----|-------------|----------|
| EVT-01 | Create event with name, date, optional location/tags/status | `lib/db/repositories/events.ts` `createEvent`, `components/events/event-form.tsx`, `components/events/add-event-sheet.tsx` |
| EVT-02 | Browse events split into Upcoming and Past | `app/events/page.tsx` reads `useUpcomingEvents` / `usePastEvents` (both date-indexed); two sections render with count badges |
| EVT-03 | Open event detail to see info + attendees list | `app/events/[id]/page.tsx` + `components/events/event-detail.tsx` + `attendees-section.tsx` |
| EVT-04 | Add existing people as attendees from the event (multi-select picker) | `components/events/attendees-picker.tsx` — shadcn `Command` filterable list + Dialog footer commits in a transaction |
| EVT-05 | "Add another person" rhythmic loop from event detail | `AddPersonSheet` honors `keepOpenAfterSave`; `openWithEventId` wires `presetEventMetId` + `afterSubmit = addAttendee`. Inline "Added {name} ✓" confirm; clean form remount for next entry. |
| EVT-06 | Delete event cascades: people retained, eventMetId cleared | `deleteEvent` runs `rw` transaction over `events` + `people`. Covered by test. |
| EVT-07 | Add Person from anywhere pre-fills where-we-met to most-recent event | `useMostRecentEvent()` switched to `date`-indexed query; `AddPersonSheet` defaults form to `presetEventMetId ?? mostRecent?.id` |

## Verification results

| Check | Result |
|-------|--------|
| `pnpm test` | ✅ 20/20 (Phase 1: 4, Phase 2: 10, Phase 3: 6) |
| `pnpm run build` | ✅ 7 static pages, TypeScript clean |
| No regressions | ✅ `/people`, `/people/[id]`, `/`, `/events`, `/events/[id]` all build; Phase 2 routes intact |
| Bi-directional linking | ✅ `addAttendee` dual-writes; `removeAttendee` inverses; `deleteEvent` clears `eventMetId` |

### Human Verification needed

| # | Item | Why human |
|---|------|-----------|
| H1 | Create an event in Upcoming, then move past its date — appears in Past on reload | Time-based behavior, can't trigger in CI |
| H2 | Multi-select picker shows all people, hides those already attending, commits selection | Visual + interaction check |
| H3 | "+ New person" from event opens AddPersonSheet pre-filled; "Keep adding more people" toggle works | Interaction loop, EVT-05 |
| H4 | From `/people` FAB, AddPersonSheet pre-fills where-we-met to the most-recent event | EVT-07 visual confirmation |
| H5 | Delete event → confirm person who pointed to it now shows no "Met at" chip | Cascade visible only at runtime |
| H6 | Tag autocomplete in event form lists tags from BOTH people and events | Generalized hook check |
| H7 | Route-aware FAB: on `/people` shows "+ person", on `/events` shows "+ event" | Visual route check |
| H8 | StatusChip instant-save persists across reload | Persistence proof |

## What ships

```
app/events/page.tsx                            real Events list (Upcoming + Past sections)
app/events/[id]/page.tsx                       real Event detail
components/events/
  add-event-button.tsx                         desktop TopBar trigger
  add-event-context.tsx                        sheet open-state provider
  add-event-fab.tsx                            mobile floating "+"
  add-event-sheet.tsx                          Sheet hosting EventForm
  attendees-picker.tsx                         shadcn Command multi-select Dialog
  attendees-section.tsx                        attendee list + Add buttons + per-row remove
  delete-event-dialog.tsx                      AlertDialog cascade copy
  event-card.tsx                               list row
  event-detail.tsx                             view + edit + StatusChip outside form
  event-form.tsx                               react-hook-form + zod (shared add/edit)
  events-empty-state.tsx                       primary CTA opens AddEventSheet
  events-list-skeleton.tsx                     loading state
  status-chip.tsx                              StatusChip (interactive) + StatusBadge
components/shell/route-aware-triggers.tsx      RouteAwareFab + RouteAwareAddButton
components/ui/checkbox.tsx                     +1 shadcn primitive
hooks/use-events.ts                            new selectors: useUpcomingEvents, usePastEvents; useMostRecentEvent now uses date index
hooks/use-people.ts                            new usePeopleByIds for attendees
hooks/use-tag-suggestions.ts                   merges people + events tag uniqueKeys
lib/db/repositories/events.ts                  createEvent + updateEvent + deleteEvent (cascade) + addAttendee/removeAttendee (dual-write + touch)
lib/validators/event.ts                        zod v3 schema + EventFormValues
components/people/add-person-context.tsx       extended with presetEventMetId + afterSubmit + keepOpenAfterSave + openWithEventId
components/people/add-person-sheet.tsx         honors all of the above + inline "Added ✓" confirm + form remount on EVT-05 loop
components/shell/{app-shell,top-bar}.tsx       both providers mounted; route-aware triggers
test/db/events.test.ts                         6 tests (ULID, normalize, cascade, idempotent attendees, touch, inverse)
```

## What's intentionally NOT in Phase 3

Per `03-CONTEXT.md` §`<deferred>`:
- Calendar grid view / sync / ICS export — v2 (INT-01..02)
- Luma / Partiful / Eventbrite paste-parse — v2 (INT-03)
- Touchpoint UI per attendee — v2 (TCH-01..06)
- Recurring events — v2
- Search box in TopBar — **Phase 4** (SRC-01)
- Filter chips on events — **Phase 4** (SRC-03)
- Seed data — **Phase 4** (SED-01..04)

## Decisions taken vs Claude's Discretion

Per `03-CONTEXT.md` §`<decisions>`, every D-01..D-34 is now embodied. Claude's Discretion items resolved:
- **Status emoji:** kept emoji per UI-SPEC literal — `🤔 interested`, `📅 going`, `✓ attended`.
- **Date display:** `format(date, "EEE, MMM d")` for upcoming, `formatDistanceToNow(date, { addSuffix: true })` for past — clean on mobile and desktop.
- **Sheet variant:** two separate `AddPersonSheet` + `AddEventSheet` components — simpler diffs than a generic AddSheet.
- **Attendees picker keyboard flow:** shadcn `Command` provides this for free; no extra wiring needed in v1.
- **Touch on addAttendee:** YES — `lastContactAt` updated when adding an attendee. Matches personal-CRM mental model.

## Known limitations / next-phase pickups

- **`useMostRecentEvent` semantics:** returns the highest-date event (not most-recently created). Reasonable for "what did you just attend / are about to attend" but a future-dated event will be the default after you create it. Acceptable v1 behavior.
- **AttendeesPicker reads from full people list:** scales fine to hundreds; if a workshop demo seeds thousands, the Command filter has built-in efficient handling.
- **Phase 1 schema lacks an `eventMetId` index** on `people`. `deleteEvent` and `removeAttendee` use `.toCollection().filter()` (full scan), which works correctly but isn't index-accelerated. Acceptable for v1 scale; revisit only if profiling shows it.
- **`AddPersonProvider` now imports from `lib/db/repositories/events.ts`** to bake `addAttendee` into `openWithEventId`. This couples the People provider to the Events repo. Tradeoff accepted for ergonomics; cleaner alternative would be a tiny dispatcher hook.
- **No per-attendee touchpoint** — adding someone to an event updates `lastContactAt` but doesn't append a Touch row (touchpoint UI is v2).

## Next phase

`/clear` then `/gsd-autonomous --from 4` — Phase 4 (Search, Seed, Polish & Ship) wires the global search input into TopBar, the JSON export/import header menu, first-run seed prompt + seed loader, polish pass, and README + deploy verification.
