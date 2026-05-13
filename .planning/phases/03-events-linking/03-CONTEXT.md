# Phase 3: Events & Linking - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning
**Mode:** Smart discuss (4 grey areas, all recommendations accepted)

<domain>
## Phase Boundary

User can model the *places* they meet people and link people to events bi-directionally — the "event-as-container" pattern that makes bulk-add rhythmic and unlocks the smart "event-met" default that keeps capture under 30 seconds.

**In scope** (EVT-01..07):
- `/events` list page replaces Phase 1 placeholder — Upcoming + Past sections, each sorted by date, with EventCard layout mirroring PersonCard
- `/events/[id]` detail page replaces Phase 1 placeholder — view + Edit toggle + overflow ⋯ + AlertDialog delete
- Add Event Sheet (same Sheet pattern as People), reusing `useMediaQuery` for mobile-bottom / desktop-right
- Event create form: name (required), date (native `<input type="date">`), location, tags (`TagChipInput` reused), status (`StatusChip` segmented control similar to `ClosenessChip`)
- Event detail attendees section: list of `PersonCard` rows; "Add attendees" button opens a `Dialog` with shadcn `Command` filterable multi-select; "Add a new person" button on the same row opens `AddPersonSheet` pre-filling `eventMetId = currentEventId`
- Bi-directional linking: writing an attendee adds the person id to `event.attendees` AND (when the person was added via the event flow) sets `person.eventMetId`
- Smart event-met default (EVT-07): when `AddPersonSheet` opens from anywhere in the app and `useMostRecentEvent()` returns a non-null event, pre-select that event's id in the where-we-met dropdown
- Delete-event cascade (EVT-06): transaction clears `person.eventMetId` on any person whose `eventMetId === thisEventId`, then deletes the event. People retained.
- Status chip on event card + event detail (interested / going / attended) — instant save on tap, no edit gate
- Empty state copy on `/events`; not-found state on `/events/[id]`

**Out of scope for this phase** (deferred):
- Calendar grid view, calendar sync, ICS export — v2 (INT-01..02)
- Luma / Partiful / Eventbrite paste-parse — v2 (INT-03)
- Touchpoint UI per attendee, "follow-up after event" reminders — v2 (TCH-01..06)
- Recurring events — v2
- Global search inputs (search box in header) — Phase 4 (SRC-01..04)
- Seed data — Phase 4 (SED-01..04)

</domain>

<decisions>
## Implementation Decisions

### Events List Page

- **D-01:** `/events` renders **two stacked sections** in order: Upcoming, then Past. Each section has its own heading (with a small muted count badge) and a list of EventCard rows. Sort within section: Upcoming by `date` ascending (soonest first); Past by `date` descending (most recent first).
- **D-02:** "Upcoming" boundary: `event.date >= startOfToday()` (date-fns `startOfDay(new Date())`). Same-day events stay in Upcoming until tomorrow.
- **D-03:** Reuse `usePeople`/`usePerson` pattern via `useEvents`, `useEvent` from Phase 1 stubs. `useEvents()` already orders by date desc — we'll add a `useUpcomingEvents()` and `usePastEvents()` selector built on top so the page can render the two sections without re-sorting in component code.
- **D-04:** Three-state render preserved: `undefined → EventsListSkeleton`, both sections empty → `EventsEmptyState`, else → sections rendered. If only one section has entries, the other section is hidden entirely.

### Event Card

- **D-05:** EventCard layout (mirrors PersonCard):
  - Row 1: name (truncate) + status pill (right-aligned, glanceable)
  - Row 2: location · attendee count (`5 attendees`, `1 attendee`) — date pill on the right (formatted as `Tue, 14 May` for upcoming, `3 days ago` for past)
  - Bottom: up to 3 tag chips + `+N` overflow
  - Whole card is a `<Link href="/events/{id}">`
- **D-06:** `EventCard` reads attendees count from `event.attendees.length`. Tags > 3 collapse to `+N`. Empty tags row hidden.

### Add Event Sheet

- **D-07:** Trigger pattern parallel to People:
  - Mobile FAB lives in `AppShell` (currently People-FAB only — generalize to "AppFab" or have one per context-page? **Pick**: keep route-aware single FAB. The FAB's icon/aria-label/onClick come from the route — `/people` → opens AddPersonSheet, `/events` → opens AddEventSheet. Implementation: `useFabContext` driven by `usePathname()`.
  - **Simpler alternative**: ship two FABs, mutually exclusive via the same `md:hidden` plus a `usePathname()` switch. Pick this — less abstraction.
  - Desktop TopBar gets a second route-aware button: `+ Add event` when on `/events`, `+ Add person` otherwise. Or always render both — but visual clutter. **Pick**: route-aware single button driven by `usePathname()`.
- **D-08:** `AddEventSheet` mirrors `AddPersonSheet` — same `useMediaQuery("(min-width: 640px)")` to choose `side`. Title "Add an event", description "Where you meet matters.".
- **D-09:** Fields in tab order:
  1. Name (required, autofocus)
  2. Date (native `<input type="date">` wrapped in shadcn `Input` with `type="date"`)
  3. Location (single-line, optional)
  4. Tags (`TagChipInput` reused — Phase 2 component already handles autocomplete from all tags across people; for events we want autocomplete from BOTH people-tags and event-tags, so generalize `useTagSuggestions` to query both stores)
  5. Status (`StatusChip` segmented — close-warm-cooling analogue: interested · going · attended — defaults to `interested` for upcoming, `attended` for past at-creation? Pick: always default to `interested` regardless of date; user can change in one tap.
- **D-10:** Submit creates event via `createEvent` repo function (currently a stub — fill in). On success: toast `Added {name}`, close sheet.

### Status Chip

- **D-11:** `StatusChip` is a copy of `ClosenessChip` pattern with three options: `interested` · `going` · `attended`. Same `radiogroup` semantics, same instant-save behavior on detail, readonly `StatusBadge` on cards.
- **D-12:** Labels: `🤔 interested`, `📅 going`, `✓ attended` — emoji to mirror closeness rhythm but kept lighter (avoid overdesign). Acceptable to swap to lucide icons if emoji feels off — Claude's Discretion in execution.

### Event Detail Page

- **D-13:** Layout (mirrors PersonDetail):
  - Header: ← Events link, Edit button, ⋯ overflow with `Delete event`
  - Name + location subtitle
  - Status segmented control (always interactive)
  - Date display: `Tue, May 14` or `3 days ago` depending on past/future
  - Tags row (view mode) / TagChipInput (edit mode)
  - Notes? **No** — events have no `notes` field in schema. Skip notes section.
  - Attendees section: heading "Attendees ({count})", two buttons — `+ Existing person` (opens picker) and `+ New person` (opens AddPersonSheet pre-filled); list of `PersonCard` (compact variant). Remove-from-event button per attendee (small `×` button on hover or always visible).
- **D-14:** Edit mode swaps fields into `EventForm` (shared with AddEventSheet). Closeness analog (status) lives OUTSIDE the form same as People.

### Attendees Picker

- **D-15:** Component name: `AttendeesPicker`. Triggered by "+ Existing person" button. Opens a shadcn `Dialog` (NOT a Sheet — picker is a brief interrupt, not a context-keeping flow).
- **D-16:** Dialog content:
  - shadcn `Command` with `CommandInput` (filters by person name, role, tags)
  - `CommandList` items: per-person row with checkbox state, name, role · company. Already-attending people show as preselected and disabled. (Removing attendees happens on the event detail page, not in the picker.)
  - Footer: `Done` button commits the selection. `Cancel` closes without saving.
- **D-17:** Commit logic: for each newly checked person, dual-write:
  1. Add person.id to `event.attendees` array (if not already)
  2. If person's `eventMetId` is unset, set it to `event.id` (so the picker also retroactively fills in where-we-met for people who pre-existed without one). If `eventMetId` is already set (to any event), leave it alone — never overwrite a prior decision.
- **D-18:** Wrap dual-write in a Dexie `rw` transaction.

### Add-New-Person from Event

- **D-19:** "+ New person" button on event detail opens `AddPersonSheet` with a context prop `presetEventMetId = currentEvent.id`. The PersonForm pre-fills the where-we-met `Select` with this value.
- **D-20:** After submit, in addition to `createPerson` returning the new id, add the new id to `event.attendees`. Pattern: extend the `AddPersonProvider` to accept an optional `afterSubmit?: (newId: string) => Promise<void>` callback; event detail sets `afterSubmit = (id) => addAttendee(eventId, id)`.
- **D-21:** EVT-05 "Add another person" loop: after submit, the Sheet stays open with a cleared form (Name autofocused again) so the user can rapidly log multiple people. Add a checkbox in the Sheet: "Keep open after save" (default ON when opened from an event; default OFF when opened from the FAB elsewhere).

### Smart Event-Met Default (EVT-07)

- **D-22:** `useMostRecentEvent()` currently orders by `createdAt` (unindexed) — switch to `orderBy("date").reverse().limit(1)` (date IS indexed) which returns the latest-date event; that's the right semantic for "what did the user just attend or is about to attend". If there's no event, returns null.
- **D-23:** In `AddPersonSheet`, when `presetEventMetId` is undefined AND `useMostRecentEvent()` returns a non-null event, pre-select that event id as the default. The user can clear it via the `Select` "—" option.
- **D-24:** Only fires on first render of the form for each "open" cycle — don't reactively change the field if the most-recent event changes mid-form (would surprise the user).

### Delete-Event Cascade (EVT-06)

- **D-25:** `deleteEvent(id)` runs a `rw` transaction:
  ```ts
  await db.transaction("rw", db.events, db.people, async () => {
    await db.people
      .where("eventMetId").equals(id)
      .modify({ eventMetId: undefined });
    await db.events.delete(id);
  });
  ```
- **D-26:** Confirmation copy: "Delete {event.name}? Any person whose 'where you met' was this event will lose that link. Attendees themselves are kept."

### Remove Attendee

- **D-27:** From event detail, each attendee `PersonCard` has a small `× Remove` overflow action (lucide `X` button in the corner — visible on hover desktop, always visible mobile). Click confirms via toast "Remove {name} from this event?" + Undo button (within 5s the undo restores).
- **D-28:** Implementation: a single `removeAttendee(eventId, personId)` repo fn in a `rw` transaction:
  - Splice `personId` out of `event.attendees`
  - If `person.eventMetId === eventId`, clear it; otherwise leave it.

### Events Repo (fill in stubs)

- **D-29:** `lib/db/repositories/events.ts` currently a Phase 1 stub. Fill in:
  - `createEvent(input)` — assigns ULID, `createdAt: Date.now()`, normalizes tags, defaults `attendees: []`, `status: "interested"`. Calls `requestPersistentStorage()`.
  - `updateEvent(id, patch)` — re-normalizes tags if present.
  - `deleteEvent(id)` — cascade per D-25.
  - `addAttendee(eventId, personId)` — dual-write per D-17 (idempotent on event.attendees).
  - `removeAttendee(eventId, personId)` — per D-28.

### Tag Autocomplete Generalization

- **D-30:** `useTagSuggestions` currently queries `db.people.orderBy("tags").uniqueKeys()`. Generalize to union of `db.people.orderBy("tags").uniqueKeys()` and `db.events.orderBy("tags").uniqueKeys()`. Both stores' `*tags` index already exists. Dedup at the merge step. Phase 4 search will reuse the same generalized hook.

### Routes & files (target)

- `app/events/page.tsx` — list page (replaces Phase 1 placeholder)
- `app/events/[id]/page.tsx` — detail page (replaces Phase 1 placeholder)
- `components/events/EventCard.tsx`
- `components/events/EventForm.tsx`
- `components/events/AddEventSheet.tsx`
- `components/events/AddEventProvider.tsx` (open-state context — same pattern as AddPerson)
- `components/events/AddEventFab.tsx`
- `components/events/AddEventButton.tsx`
- `components/events/StatusChip.tsx` (interactive segmented + readonly badge)
- `components/events/EventDetail.tsx`
- `components/events/DeleteEventDialog.tsx`
- `components/events/AttendeesPicker.tsx`
- `components/events/AttendeesSection.tsx`
- `components/events/EventsEmptyState.tsx`
- `components/events/EventsListSkeleton.tsx`
- `components/shell/route-aware-fab.tsx` — single FAB whose icon/action depends on route
- `lib/db/repositories/events.ts` — fill in stubs
- `lib/validators/event.ts` — zod schema
- `hooks/use-events.ts` — add `useUpcomingEvents`, `usePastEvents`; rewrite `useMostRecentEvent` to use `date` index

### Modifications to Phase 2 surface (minimal)

- **D-31:** Generalize `useTagSuggestions` per D-30. Update its tests.
- **D-32:** `AddPersonSheet` accepts `presetEventMetId?: string` prop AND `afterSubmit?: (newId: string) => Promise<void>` prop. When provided, prefill where-we-met and call afterSubmit before closing. Add `keepOpenAfterSave` opt-in for the EVT-05 loop. The `useAddPerson` hook gains methods `openWithEventId(id)` and `openLoopWithEventId(id)`.
- **D-33:** TopBar swaps the desktop button based on `usePathname()`: `/events` route shows AddEventButton; else shows AddPersonButton.
- **D-34:** The mobile FAB (`AppShell` mounted) becomes route-aware in the same way.

### Claude's Discretion

- Exact emoji vs lucide icons for status (interested/going/attended) — try emoji first.
- Date display format precision — `formatRelative` or short absolute. Try `formatDistanceToNow` for past, `format(date, "EEE, MMM d")` for upcoming. Adjust during execution if cramped on mobile.
- Whether to ship a single shared `AddSheet` component that swaps form payload, or two separate `AddPersonSheet` + `AddEventSheet`. Pick whichever produces smaller diffs. The current Phase 2 surface points toward two separate sheets — keep them parallel.
- Whether `AttendeesPicker` should support keyboard-only flow (Tab through list + Space to toggle) in v1 or wait for polish in Phase 4. Try to ship it now; not blocking if tricky.
- Test coverage depth — repo + lib smoke (events create/update/delete, addAttendee dual-write, removeAttendee inverse, deleteEvent cascade). UI integration tests deferred.
- Whether to also "touch" the person (`lastContactAt = Date.now()`) when they're added to an event. **Pick**: yes — adding an attendee is a touchpoint in spirit even though we're not landing the touches UI in v1. Cheap behavior; matches the personal-CRM mental model.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project framing & locked decisions
- `.planning/PROJECT.md` — Core value, polish floor, audience constraints
- `.planning/REQUIREMENTS.md` §Events — EVT-01..07
- `.planning/REQUIREMENTS.md` §People — EVT-07 ties back into PPL-01..02 (30s capture, smart default)
- `.planning/ROADMAP.md` §"Phase 3: Events & Linking" — Goal + 5 success criteria
- `.planning/phases/01-foundation-static-export-spine/01-CONTEXT.md` — Phase 1 decisions (D-17 schema, D-22 ULIDs)
- `.planning/phases/01-foundation-static-export-spine/01-SUMMARY.md` — Shipped Phase 1 surface
- `.planning/phases/02-people/02-CONTEXT.md` — Phase 2 decisions (D-01..D-21); especially D-13 (closeness inline-save), D-18 (tag input mechanics), D-22 (TopBar route-aware slot reserved)
- `.planning/phases/02-people/02-SUMMARY.md` — What Phase 2 ships; PersonCard / AddPersonSheet / PersonForm / TagChipInput as reusable surface
- `.planning/phases/02-people/02-UI-SPEC.md` — Design tokens, copy voice, interaction primitives (status chip will mirror ClosenessChip)
- `CLAUDE.md` — Conventions (client/server boundary, three-state render, IDs as ULIDs, schema migration discipline, tag normalization, no demo-only hacks)

### Existing code surface (Phase 1+2 contracts to fill, not reshape)
- `lib/db/db.ts` — Dexie schema v1 — DO NOT EDIT
- `lib/db/repositories/events.ts` — Phase 1 stubs to fill in
- `hooks/use-events.ts` — `useEvents`, `useEvent`, `useMostRecentEvent` already wired; the last one needs the `date`-index swap per D-22
- `components/people/{add-person-sheet,add-person-context,person-form,tag-chip-input,closeness-chip}.tsx` — patterns to mirror, hooks to extend
- `components/shell/{app-shell,top-bar}.tsx` — generalize triggers per D-33/D-34
- `lib/tags.ts` — normalize and dedupe; reuse as-is
- `lib/validators/person.ts` — pattern to copy for `event.ts`

### Wireframes
- `Networking App Wireframes EN _standalone_.html` — Events upcoming/past, attendees, add-event-flow sketches; built product lands closer to Linear/Notion than sketches

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (shipped in Phase 1 + 2)
- `useEvents`, `useEvent(id)`, `useEventsCount`, `useMostRecentEvent` — live-queries ready (mostRecent needs the `date`-index switch per D-22)
- `lib/db/repositories/events.ts` — stubs to fill
- `TagChipInput`, `ClosenessChip` (pattern), `Sheet`-based modal flow, `AlertDialog`-confirmed delete, `react-hook-form + zod` form pattern — all from Phase 2
- `AddPersonProvider` open-state context (extend with optional preset/afterSubmit/keepOpen)
- `useMediaQuery`, `useTagSuggestions`, `normalizeTags`, `filterTagSuggestions` — utility surface
- `Toaster` (Sonner) already mounted in root layout
- Phase 2's CSS tokens, spacing, color, type scales — inherit

### Established Patterns
- Each entity gets a parallel set: list page + [id] detail + Sheet + Form + Card + EmptyState + Skeleton + EditMode + DeleteDialog. Phase 3 follows the Phase 2 mold deliberately.
- Three-state render (`undefined → skeleton, [] → empty, else → data`).
- Repos own normalization + transactions; hooks own reads; components own UI.

### Integration Points
- TopBar + Mobile FAB become route-aware in this phase. Owns route-driven decision once; future phases (Phase 4 search button) plug in here.
- `AttendeesPicker` will reuse shadcn `Command` + `Dialog`. Same `Command` pattern is used by `TagChipInput`'s autocomplete — workshop attendees see the pattern twice.
- Phase 4 search will live in TopBar (right of theme toggle on desktop; expandable on mobile). Phase 3 leaves that slot empty.

</code_context>

<specifics>
## Specific Ideas

- EVT-05's "Add another person" rhythm is the second-most-important UX moment after PPL-02's 30s capture. Optimize: autofocus name, do not close sheet on save, clear form, show "Added {name} ✓" inline above the form fields for 2s.
- Status emoji default: `🤔 interested`, `📅 going`, `✓ attended` — but reserve the right to swap to lucide if too noisy. Try emoji first.
- "Met at {event.name}" chip on PersonDetail already exists; events page should reverse-link with "{N} attendees" badge that taps into the attendee list.
- Schema-bake done in Phase 1: `*attendees` multi-entry index on events is ready for query speed.

</specifics>

<deferred>
## Deferred Ideas

- Calendar grid view — v2
- Calendar sync (Google, ICS export) — v2 (INT-01..02)
- Luma / Partiful / Eventbrite paste-parse — v2 (INT-03)
- Touchpoints per attendee (timeline of who was where, when) — v2 (TCH-01..06)
- "Reminder X days before event" — v2
- Recurring events — v2
- Event location → map link — out of v1
- Event cost / RSVP tracking — out of category
- Global search of events by name/tag — Phase 4 (SRC-01..04)
- Seed data including events — Phase 4 (SED-01..04)
- Per-route loading.tsx skeletons — Phase 4 polish (POL-01)
- Full UI integration tests — Phase 4 polish

</deferred>

---

*Phase: 03-events-linking*
*Context gathered: 2026-05-13*
