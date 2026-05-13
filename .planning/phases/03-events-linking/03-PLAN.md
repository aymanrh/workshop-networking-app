---
phase: 3
slug: events-linking
status: ready
mode: auto-chain
created: 2026-05-13
requirements: [EVT-01, EVT-02, EVT-03, EVT-04, EVT-05, EVT-06, EVT-07]
---

# Phase 3 — PLAN

Reference: `03-CONTEXT.md`, `03-UI-SPEC.md`, `02-CONTEXT.md` (Phase 2 patterns to mirror), `02-SUMMARY.md` (Phase 2 surface to reuse), `.planning/REQUIREMENTS.md` §Events, `CLAUDE.md`.

Goal: Events CRUD + bi-directional person↔event linking + smart event-met default (EVT-07). Fill in Phase 1 stubs (`events.ts` repo), generalize Phase 2's reusable bits (`useTagSuggestions`, `AddPersonSheet`, FAB/TopBar triggers), and ship the headline EVT-05 "Add another person" rhythmic-add loop.

## Plan Index

Plans run sequentially. Each plan is a single atomic commit unless noted.

| # | Plan | Output |
|---|------|--------|
| 3.01 | Fill `lib/db/repositories/events.ts` (createEvent, updateEvent, deleteEvent with cascade, addAttendee/removeAttendee dual-write) + `lib/validators/event.ts` zod schema | `lib/db/repositories/events.ts`, `lib/validators/event.ts` |
| 3.02 | Update `hooks/use-events.ts` — switch `useMostRecentEvent` to `date` index; add `useUpcomingEvents` and `usePastEvents` selectors | `hooks/use-events.ts` |
| 3.03 | Generalize `useTagSuggestions` to union of people + events tags | `hooks/use-tag-suggestions.ts` |
| 3.04 | `StatusChip` segmented control + `StatusBadge` | `components/events/status-chip.tsx` |
| 3.05 | `EventForm` (react-hook-form + zod) — shared between Add Sheet and Detail edit | `components/events/event-form.tsx` |
| 3.06 | `AddEventProvider` + `AddEventSheet` + `AddEventFab` + `AddEventButton` (mirroring Phase 2) | `components/events/{add-event-context,add-event-sheet,add-event-fab,add-event-button}.tsx` |
| 3.07 | Route-aware shell wiring — TopBar swaps Add button by `usePathname()`; AppShell mounts both FABs (one shows at a time via `usePathname`) and both Sheets | `components/shell/{app-shell,top-bar}.tsx`, `components/shell/route-aware-fab.tsx` |
| 3.08 | `EventCard` list row (two-line, status badge, date pill, attendee count, tag overflow) | `components/events/event-card.tsx` |
| 3.09 | `/events` list page — replace placeholder with Upcoming + Past sections, three-state render | `app/events/page.tsx`, `components/events/events-empty-state.tsx`, `components/events/events-list-skeleton.tsx` |
| 3.10 | `AttendeesPicker` dialog (shadcn `Command` multi-select) — commits selection via `addAttendee` in transaction | `components/events/attendees-picker.tsx` |
| 3.11 | `AttendeesSection` — heading + 2 add buttons + list of `PersonCard` with per-attendee remove `×` | `components/events/attendees-section.tsx` |
| 3.12 | `DeleteEventDialog` (AlertDialog confirm with cascade copy) | `components/events/delete-event-dialog.tsx` |
| 3.13 | `EventDetail` (view + edit modes, status chip outside form, attendees section, delete) | `components/events/event-detail.tsx` |
| 3.14 | `/events/[id]` page — three-state render | `app/events/[id]/page.tsx` |
| 3.15 | Extend `AddPersonSheet` for EVT-05 + EVT-07: `presetEventMetId`, `afterSubmit`, `keepOpenAfterSave`, and smart default; extend `AddPersonProvider` with `openWithEventId(id)` | `components/people/{add-person-sheet,add-person-context,person-form}.tsx`, `components/events/attendees-section.tsx` (wire up "+ New person" button) |
| 3.16 | Tests: events repo (create, cascade delete, addAttendee dual-write, removeAttendee inverse, "touch" updates lastContactAt), event date filter helpers | `test/db/events.test.ts`, `test/lib/event-date.test.ts` (if any helpers extracted) |
| 3.17 | Local verification: `pnpm run build` green, `pnpm test` green, route emission unchanged, manual UAT items in VERIFICATION.md | (no new files) |

## Wave model

Strictly sequential. Each plan often depends on the previous (e.g., 3.13 needs 3.10, 3.11, 3.12; 3.15 needs 3.13).

## Detail per plan

### 3.01 — Events repo + zod validator

`read_first`: `lib/db/repositories/events.ts` (stub), `lib/db/repositories/people.ts` (pattern), `lib/db/types.ts`, `lib/tags.ts`, `lib/id.ts`, `lib/validators/person.ts` (pattern), `03-CONTEXT.md` §"Events Repo"

`action`:
- `lib/validators/event.ts`:
  ```ts
  import { z } from "zod";
  export const eventFormSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    date: z.string().min(1, "Date is required"), // ISO yyyy-mm-dd from <input type="date">
    location: z.string().trim().optional(),
    tags: z.array(z.string()),
    status: z.enum(["interested", "going", "attended"]),
  });
  export type EventFormValues = z.infer<typeof eventFormSchema>;
  ```
- `lib/db/repositories/events.ts` — replace stubs:
  - `createEvent(input)`: ULID id, `createdAt = Date.now()`, `date = new Date(input.date).getTime()`, `attendees = []`, `status = input.status ?? "interested"`, normalized tags. Call `requestPersistentStorage()`.
  - `updateEvent(id, patch)`: if `patch.tags`, normalize; if `patch.date` and it's a string, convert to ms.
  - `deleteEvent(id)` cascade per CONTEXT.md D-25.
  - `addAttendee(eventId, personId)` per CONTEXT.md D-17 (dual-write + idempotent + touch).
  - `removeAttendee(eventId, personId)` per CONTEXT.md D-28.
  - "Touch" semantics on addAttendee: update `person.lastContactAt = Date.now()` so the People list re-sorts.

`acceptance_criteria`:
- `createEvent` returns a 26-char ULID
- `deleteEvent` clears `eventMetId` on linked people in a single transaction
- `addAttendee` idempotent: calling twice with same `(eventId, personId)` does not duplicate in attendees array
- `addAttendee` sets `person.eventMetId` only when previously unset
- `removeAttendee` clears `person.eventMetId` only when it matches the event being detached
- `pnpm run build` exits 0

`commit`: `feat(03): events repository + zod validator (create, update, cascade delete, attendees dual-write)`

---

### 3.02 — Hooks: date-indexed mostRecent + Upcoming/Past selectors

`read_first`: `hooks/use-events.ts`, `lib/db/db.ts` (confirm `date` index)

`action`:
- Rewrite `useMostRecentEvent` to use `db.events.orderBy("date").reverse().limit(1).toArray()` — `date` IS indexed; `createdAt` is not. Semantically: returns the highest-date event, which matches "what event are you about to attend / just attended".
- Add `useUpcomingEvents()` and `usePastEvents()`. Implementation: read the full sorted list and partition in JS at the boundary `startOfDay(new Date()).getTime()`. Reasonable for v1 dataset sizes; can split into two queries later.
  ```ts
  import { startOfDay } from "date-fns";
  // single live-query returning sorted events; partition in the page
  ```
  Or expose two live-queries:
  ```ts
  export function useUpcomingEvents() {
    return useLiveQuery(async () => {
      const today = startOfDay(new Date()).getTime();
      return db.events.where("date").aboveOrEqual(today).sortBy("date");
    }, []);
  }
  export function usePastEvents() {
    return useLiveQuery(async () => {
      const today = startOfDay(new Date()).getTime();
      return db.events.where("date").below(today).reverse().sortBy("date");
    }, []);
  }
  ```
  Pick the second form — uses the `date` index, no client-side partition.

`acceptance_criteria`:
- `useUpcomingEvents` returns events with `date >= startOfDay(now)`
- `usePastEvents` returns events with `date < startOfDay(now)`, sorted desc
- `useMostRecentEvent` returns the highest-date event (not the most-recently-created)
- `pnpm run build` exits 0

`commit`: `feat(03): use-events selectors (upcoming, past) + date-indexed mostRecent`

---

### 3.03 — Generalize `useTagSuggestions`

`read_first`: `hooks/use-tag-suggestions.ts`, `lib/tags.ts`

`action`:
- In `useAllTags`, change body to query both `db.people.orderBy("tags").uniqueKeys()` and `db.events.orderBy("tags").uniqueKeys()`, merge into a `Set`, sort. Returns a deduplicated `string[]`.
- `useTagSuggestions` stays the same — it's a thin wrapper over `useAllTags`.

`acceptance_criteria`:
- `useAllTags` query touches both stores
- A tag that exists only on an event surfaces in the People tag autocomplete (and vice versa)
- `pnpm run build` exits 0
- Existing `test/lib/tags.test.ts` still passes (those tests don't depend on `useAllTags`)

`commit`: `feat(03): generalize useTagSuggestions over people + events tags`

---

### 3.04 — `StatusChip`

`read_first`: `components/people/closeness-chip.tsx` (pattern), `lib/db/types.ts` (`EventStatus` union)

`action`:
- `components/events/status-chip.tsx` — copy ClosenessChip structure, swap the three options for status:
  ```ts
  const OPTIONS: { value: EventStatus; label: string }[] = [
    { value: "interested", label: "🤔 interested" },
    { value: "going", label: "📅 going" },
    { value: "attended", label: "✓ attended" },
  ];
  ```
- Export `StatusChip` (interactive) and `StatusBadge` (outline `Badge`, readonly).

`acceptance_criteria`:
- `StatusChip` is a `role="radiogroup"` with three `role="radio"` buttons
- Arrow keys navigate; Space activates (same a11y as ClosenessChip)
- `pnpm run build` exits 0

`commit`: `feat(03): StatusChip segmented + StatusBadge`

---

### 3.05 — `EventForm`

`read_first`: `components/people/person-form.tsx` (pattern), `components/events/status-chip.tsx`, `lib/validators/event.ts`, `components/ui/{form,input,label,select}.tsx`

`action`:
- `components/events/event-form.tsx`:
  - Same `useForm + zodResolver` shape as PersonForm.
  - Fields: Name (autofocus on create) → Date (`<Input type="date" />`) → Location → Tags (`TagChipInput`) → Status (`StatusChip` inside the form for create mode; **excluded** in edit mode — status edits live on the detail page outside the form, mirroring closeness).
  - Submit gating: name and date both non-empty.
- The date input value flows as ISO `yyyy-mm-dd`; the repo converts to ms.

`acceptance_criteria`:
- File starts with `"use client";`
- `name` and `date` show inline zod errors when empty on submit
- `pnpm run build` exits 0

`commit`: `feat(03): EventForm shared between Add sheet and Detail edit`

---

### 3.06 — AddEvent context + sheet + FAB + button

`read_first`: `components/people/{add-person-context,add-person-sheet,add-person-fab,add-person-button}.tsx` (mirror these), `lib/db/repositories/events.ts`

`action`:
- `components/events/add-event-context.tsx` — context with `isOpen, open, close, setOpen`; same shape as AddPersonProvider (no preset/afterSubmit needed for events in v1).
- `components/events/add-event-sheet.tsx` — Sheet hosting `EventForm`; on submit: `createEvent(values)` then toast + close.
- `components/events/add-event-fab.tsx` — fixed bottom-right primary button, hidden when sheet open or when on `/people*` (the route-aware wrapper handles that).
- `components/events/add-event-button.tsx` — `+ Add event` desktop button.

`acceptance_criteria`:
- All files start with `"use client";`
- AddEvent flow ends with a toast and closed sheet
- `pnpm run build` exits 0

`commit`: `feat(03): AddEvent sheet + FAB + TopBar trigger (mirrors People)`

---

### 3.07 — Route-aware shell wiring

`read_first`: `components/shell/{app-shell,top-bar}.tsx`, `app/people/page.tsx` (path probe), `app/events/page.tsx` (path probe)

`action`:
- New `components/shell/route-aware-fab.tsx`: client component using `usePathname()`:
  - `/events*` → render `<AddEventFab />`
  - else → render `<AddPersonFab />`
- New `components/shell/route-aware-add-button.tsx`: same logic, returns `<AddEventButton />` on `/events*` else `<AddPersonButton />`.
- `app-shell.tsx`: wrap children in BOTH `AddPersonProvider` and `AddEventProvider` (nested). Render `<RouteAwareFab />` and BOTH `<AddPersonSheet />` and `<AddEventSheet />` (they're cheap, only one open at a time).
- `top-bar.tsx`: replace direct `<AddPersonButton />` with `<RouteAwareAddButton />` on desktop.

`acceptance_criteria`:
- AppShell renders both Providers and both Sheets
- TopBar uses the route-aware button on desktop
- Navigating between `/people` and `/events` toggles which FAB/Button shows
- `pnpm run build` exits 0

`commit`: `feat(03): route-aware FAB + TopBar trigger`

---

### 3.08 — `EventCard`

`read_first`: `components/people/person-card.tsx` (pattern), `components/events/status-chip.tsx`

`action`:
- `components/events/event-card.tsx`:
  - Two-line layout per UI-SPEC.
  - Row 1: name + `StatusBadge`.
  - Row 2: `[location, `${attendees.length} attendee${attendees.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ")` + date pill (right-aligned).
  - Date format: upcoming → `format(date, "EEE, MMM d")`; past → `formatDistanceToNow(date, { addSuffix: true })`.
  - Tag chips: top 3 + `+N` overflow.
  - Whole card `<Link href="/events/{id}">`.

`acceptance_criteria`:
- Renders all UI-SPEC elements
- Past vs upcoming date format applied via `isBefore(date, startOfDay(now))`
- `pnpm run build` exits 0

`commit`: `feat(03): EventCard list row`

---

### 3.09 — `/events` list page

`read_first`: `app/events/page.tsx` (placeholder), `hooks/use-events.ts`, `components/events/event-card.tsx`, `02-PLAN.md` §"2.10" (mirror)

`action`:
- Replace placeholder with three-state render:
  - undefined (either selector) → 6-row Skeleton
  - both empty → `EventsEmptyState`
  - else → render Upcoming section then Past section, each with a heading + count badge
- `components/events/events-empty-state.tsx` — mirror PeopleEmptyState; button uses `useAddEvent().open`.
- `components/events/events-list-skeleton.tsx` — 6 rows of `<Skeleton className="h-[88px] w-full rounded-lg" />`.

`acceptance_criteria`:
- Empty list shows the empty state
- Mixed list shows both headings; single-section list hides the empty heading
- `pnpm run build` exits 0

`commit`: `feat(03): Events list page (Upcoming/Past sections, three-state render)`

---

### 3.10 — `AttendeesPicker`

`read_first`: `components/ui/{dialog,command}.tsx`, `hooks/use-people.ts`, `lib/db/repositories/events.ts`

`action`:
- `components/events/attendees-picker.tsx`:
  - Props: `{ event: AppEvent; open: boolean; onOpenChange: (open: boolean) => void; }`
  - Inside a `Dialog`. Header: title + description.
  - Body: shadcn `Command shouldFilter={true}`:
    - `CommandInput` autoFocus with placeholder copy
    - `CommandList` → `CommandGroup` → one `CommandItem` per person from `usePeople()`. Each item shows a small checkbox + name + role subtitle. Already-attending people are shown as `disabled` with a "(already attending)" muted suffix.
    - `CommandEmpty` with the matching copy.
  - Local selection state: `Set<string>` of person ids to add.
  - Footer: Cancel + Done (Done shows count: `Done (3)`). Done is disabled when no new selections.
  - On Done: open a transaction and call `addAttendee(event.id, id)` for each selected id (the repo handles idempotency + person-touch). Toast `Added {N} attendee{s}`. Close.

`acceptance_criteria`:
- Already-attending people are not double-added
- Dialog focus-traps and Escape closes
- `pnpm run build` exits 0

`commit`: `feat(03): AttendeesPicker dialog (Command multi-select)`

---

### 3.11 — `AttendeesSection`

`read_first`: `components/people/person-card.tsx`, `components/ui/button.tsx`, `lib/db/repositories/events.ts`

`action`:
- `components/events/attendees-section.tsx`:
  - Props: `{ event: AppEvent }`
  - Reads attendees by mapping `event.attendees` → `useLiveQuery` over `db.people.where("id").anyOf(event.attendees).toArray()` (returns the actual Person rows for the ids on the event).
  - Renders heading, two buttons (`+ Existing person` opens `AttendeesPicker`; `+ New person` calls `useAddPerson().openWithEventId(event.id)`), then the list:
    - If empty: muted "No attendees yet."
    - Else: list of `PersonCard` (reuse from Phase 2) each wrapped in a `relative` container with a `<button aria-label="Remove {name} from this event" className="absolute right-2 top-2 ...">×</button>` overlay. The remove button calls `removeAttendee(event.id, person.id)` with a Sonner toast that includes an "Undo" action (within 5s, `addAttendee` re-adds; for v1 simplicity, skip the undo and just confirm).
  - Order attendees by `lastContactAt` desc — same `usePeople` style. (Add a `where("id").anyOf(...)` hook in `use-people.ts` if it's reusable; otherwise inline.)

`acceptance_criteria`:
- Clicking the `×` button calls `removeAttendee` and the row disappears (live-query re-broadcasts)
- Clicking the card body routes to `/people/{id}` (× button stops propagation)
- `pnpm run build` exits 0

`commit`: `feat(03): AttendeesSection with picker + new-person buttons + per-row remove`

---

### 3.12 — `DeleteEventDialog`

`read_first`: `components/people/delete-person-dialog.tsx` (pattern), `lib/db/repositories/events.ts`

`action`:
- `components/events/delete-event-dialog.tsx` — copy DeletePersonDialog with the new copy and `deleteEvent(id)` call. Routes to `/events` on success.

`acceptance_criteria`:
- AlertDialog body contains the literal copy from UI-SPEC
- Destructive button styled red
- `pnpm run build` exits 0

`commit`: `feat(03): DeleteEventDialog with cascade-aware confirmation`

---

### 3.13 — `EventDetail`

`read_first`: `components/people/person-detail.tsx` (pattern), `components/events/{event-form,status-chip,attendees-section,delete-event-dialog}.tsx`, `lib/db/repositories/events.ts`

`action`:
- `components/events/event-detail.tsx`:
  - Props: `{ event: AppEvent }`
  - Same Header pattern (← Events, Edit, ⋯ overflow with Delete event item)
  - Heading: `event.name`; subtitle: `event.location` (hidden if empty)
  - `StatusChip` (interactive, instant save)
  - Date display: per UI-SPEC (relative for past, absolute for upcoming)
  - Tags display (view mode) / `TagChipInput` (edit mode)
  - `AttendeesSection`
  - `DeleteEventDialog`
- Edit mode swaps name/date/location/tags into `EventForm` mode="edit"; status stays outside.

`acceptance_criteria`:
- View ↔ Edit toggle works
- `pnpm run build` exits 0

`commit`: `feat(03): EventDetail (view + edit + delete + attendees)`

---

### 3.14 — `/events/[id]` page

`read_first`: `app/events/[id]/page.tsx` (placeholder), `app/events/[id]/layout.tsx` (DO NOT TOUCH), `app/people/[id]/page.tsx` (mirror)

`action`:
- Replace placeholder with three-state render mirroring `/people/[id]`:
  - `useEvent(id)` returns `undefined` → Skeleton; `null` → NotFound (`This event doesn't exist or was removed.` + back link); else → `<EventDetail event={event} />`.

`acceptance_criteria`:
- `app/events/[id]/layout.tsx` UNCHANGED
- Static export build still emits `/events/_/index.html`
- `pnpm run build` exits 0

`commit`: `feat(03): /events/[id] detail page with three-state render`

---

### 3.15 — Extend AddPersonSheet for EVT-05 + EVT-07

`read_first`: `components/people/{add-person-sheet,add-person-context,person-form}.tsx`, `hooks/use-events.ts`, `lib/db/repositories/events.ts`

`action`:
- `AddPersonProvider`: extend state to `{ isOpen, presetEventMetId, afterSubmit, keepOpenAfterSave, open, openWithEventId, close, setOpen }`. The `openWithEventId(eventId)` method sets `presetEventMetId = eventId`, `afterSubmit = (newId) => addAttendee(eventId, newId)`, `keepOpenAfterSave = true`, then opens.
- `AddPersonSheet`:
  - Read `presetEventMetId`, `afterSubmit`, `keepOpenAfterSave` from context.
  - On open, if `presetEventMetId` is undefined, peek `useMostRecentEvent()` and use its id as the form default; if `presetEventMetId` is defined, use that.
  - After successful `createPerson`, call `afterSubmit?.(newPersonId)`.
  - If `keepOpenAfterSave`, clear form + autofocus name + show inline `Added {name} ✓` for 2s; else close.
  - Add a small checkbox in the SheetHeader area (only when opened with `keepOpenAfterSave`) labeled "Keep adding more people" — controls keepOpen state.
- `PersonForm`: accept `defaultValues.eventMetId` from outer state for the smart default. Already does.
- `AttendeesSection`'s "+ New person" button calls `useAddPerson().openWithEventId(event.id)`.

`acceptance_criteria`:
- Opening Add Person from event detail pre-fills where-we-met to that event id
- Opening Add Person from FAB anywhere else pre-fills where-we-met to `useMostRecentEvent()` if any
- After submit from event detail, the new person is in `event.attendees` and `eventMetId` is set
- "Keep adding more people" toggle controls whether sheet closes
- `pnpm run build` exits 0

`commit`: `feat(03): extend AddPersonSheet for EVT-05 loop + EVT-07 smart default`

---

### 3.16 — Tests

`read_first`: `test/db/people.test.ts` (pattern), `lib/db/repositories/events.ts`

`action`:
- `test/db/events.test.ts`:
  - createEvent: ULID id, status defaults, tag normalization, attendees defaults `[]`, ms-converted date
  - deleteEvent cascade: creates a person with `eventMetId = e1`, deletes e1, asserts person.eventMetId is cleared and person still exists
  - addAttendee idempotent: calling twice doesn't duplicate
  - addAttendee sets `eventMetId` only when previously unset; doesn't overwrite existing
  - addAttendee touches `lastContactAt`
  - removeAttendee splices array; clears `eventMetId` only on match

`acceptance_criteria`:
- `pnpm test` exits 0 with `Phase 1 (4) + Phase 2 (10) + Phase 3 (≥6) = ≥20` tests passing
- All assertions from the bullets above are covered

`commit`: `test(03): events repo (create, cascade, attendees dual-write, inverse)`

---

### 3.17 — Verification (UAT)

Manual UAT items per ROADMAP §"Phase 3" success criteria and EVT-01..07 — recorded in `03-VERIFICATION.md`:

1. **EVT-01:** Create an event with name, date, optional location, tags, status — visible in Upcoming or Past depending on date
2. **EVT-02:** Browse upcoming + past sections — order is correct (upcoming asc, past desc)
3. **EVT-03:** Open detail — see info + attendees list (empty initially)
4. **EVT-04:** From event detail, "+ Existing person" opens picker, multi-select + Done adds them to the event
5. **EVT-05:** From event detail, "+ New person" opens AddPersonSheet pre-filled with this event as where-we-met; submit keeps sheet open with cleared form; can add 3 in a row rhythmic; closes when toggle off
6. **EVT-06:** Delete event → all people who had it as their eventMetId lose the link (visible by opening one of those people)
7. **EVT-07:** From `/people`, tap FAB → Add Person Sheet opens with where-we-met pre-filled to most-recently-dated event
8. **No regressions:** People list/detail still work; build green; tests pass

`acceptance_criteria`:
- `pnpm run build` exits 0
- `pnpm test` exits 0
- `03-VERIFICATION.md` records H1–H8 (human items) and the automated checks

`commit`: `docs(03): verification report` (written by the verify skill)

---

## must_haves (for goal-backward verification)

- Events CRUD reaches users via Sheet + list + detail — EVT-01..03
- Attendees can be bulk-added from event detail with multi-select — EVT-04
- "+ Add another" rhythmic loop works for adding people from event — EVT-05
- Delete event cascade clears eventMetId on linked people, retains the people — EVT-06
- Add Person from anywhere pre-fills where-we-met to most-recent event — EVT-07
- People list still works (no regressions to Phase 2)
- Build + tests green

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `useMostRecentEvent` `date`-index switch breaks edge cases (events with date=undefined) | Schema mandates `date` (required in form); test seeds always have a date. If no events → returns null cleanly. |
| Attendees picker `Command` with checkbox inside CommandItem is awkward | shadcn `Command` items can host arbitrary children. Use a leading checkbox icon (`Check` when selected) instead of a real `<input type="checkbox">`. |
| Multi-attendee commit in a single transaction may exceed Dexie's write batching on very long lists | v1 expected: ≤20 attendees per commit. Acceptable. |
| `usePathname()` returns `null` during the very first render — route-aware FAB might flash wrong | Render `null` if `pathname == null` rather than picking a default. One render frame of nothing is invisible. |
| AddPersonSheet "keepOpenAfterSave" pattern creates surprising state if user closes manually mid-loop | `close()` always resets the loop state. Tested manually. |
| Bi-directional write asymmetry: removing a person on the people page should not affect events | `deletePerson` already removes touches; does NOT remove from `event.attendees`. Stale attendees array is acceptable (we filter on read via `usePeople().anyOf(ids)` which only returns people that actually exist). |

## Deferred

- Touchpoint UI per attendee — v2
- "Add another person" auto-suggest based on recent rhythm — v2
- Reorder attendees / pin attendee — v2
- Search/filter the picker by tag — Phase 4 (SRC-03)
- Event location → map link — out of v1
- Recurring events — v2
- Conflict warnings (overlapping event dates) — v2
