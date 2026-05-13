---
phase: 3
slug: events-linking
status: approved
shadcn_initialized: true
preset: new-york
created: 2026-05-13
inherits_from: 02-UI-SPEC.md
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for Events & Linking.
> Phase 3 mirrors Phase 2's patterns deliberately so workshop attendees see the same shape twice — list page, detail page, Sheet form, segmented status chip, AlertDialog delete. This contract documents only what's new: EventCard, StatusChip, AttendeesPicker (`Dialog` + `Command`), bi-directional linking writes, and the route-aware FAB/TopBar.

---

## Inheritance

Everything in `02-UI-SPEC.md` is still in force. The Linear/Notion polish floor, color tokens, spacing scale, typography, and component primitives all carry over.

---

## Design System Additions

| Property | Value |
|----------|-------|
| New shadcn primitives | None — Phase 2 already shipped `dialog`, `command`, `select`, `badge`, etc. |
| New deps | None — `date-fns` already in stack for date formatting |

If a primitive is missing during build (e.g., `checkbox` for the picker), add via `pnpm dlx shadcn@latest add <name>` as a one-off; record in plan if it happens.

---

## Spacing — additions

Phase 2 scale unchanged. New layout constants:

| Token | Value | Usage |
|-------|-------|-------|
| Event section gap | `space-y-6` | Between Upcoming and Past sections on `/events` |
| Section heading | `text-sm font-medium text-muted-foreground` + count `Badge` | Above each section's card list |
| Attendees row gap | `space-y-2` | Between attendee `PersonCard` rows on event detail |
| Attendee row remove button | `size-7` ghost icon button | Per-attendee `×` |

---

## Typography — additions

No new sizes. Status pill reuses `Badge` styles. Date pill uses `text-[13px]` muted.

---

## Color — additions

Phase 2 palette unchanged.

**Status chip palette** (same restraint as ClosenessChip — single accent across active states, differentiation via emoji + label):

| State | Active background | Inactive |
|-------|-------------------|----------|
| interested | `bg-accent` | `text-muted-foreground` |
| going | `bg-accent` | `text-muted-foreground` |
| attended | `bg-accent` | `text-muted-foreground` |

Same reasoning as Phase 2: avoid stoplight semantics. Status of an event doesn't auto-decay; user picks one.

---

## Copywriting Contract — Phase 3

| Element | Copy |
|---------|------|
| List page H1 | `Events` |
| Upcoming section heading | `Upcoming ({count})` |
| Past section heading | `Past ({count})` |
| FAB aria-label (mobile, `/events`) | `Add an event` |
| TopBar button (desktop, `/events`) | `+ Add event` |
| List empty title | `No events yet` |
| List empty body | `Add the first event you'll attend — or one you just left.` |
| List empty CTA | `+ Add event` |
| Add Event Sheet title | `Add an event` |
| Add Event Sheet description | `Where you meet matters.` |
| Field: Name | label `Name` / placeholder `e.g. React NYC Meetup` |
| Field: Date | label `Date` / native picker |
| Field: Location | label `Location` / placeholder `e.g. Brooklyn, NY` |
| Field: Tags | label `Tags` / placeholder `Type a tag and press Enter` |
| Field: Status | label `Status` / segmented control |
| Submit button (idle) | `Add event` |
| Submit button (busy) | `Saving…` |
| Toast: add success | `Added {name}` |
| Toast: add error | `Couldn't add — try again` |
| Status labels (literal) | `🤔 interested` · `📅 going` · `✓ attended` |
| Detail (not found) | `This event doesn't exist or was removed.` + link `Back to events` |
| Detail: date display (upcoming) | `Tue, May 14` (date-fns `format(d, "EEE, MMM d")`) |
| Detail: date display (past) | `3 days ago` (date-fns `formatDistanceToNow`, addSuffix true) |
| Attendees section heading | `Attendees ({count})` |
| Attendees empty | `No attendees yet.` |
| Add attendees button | `+ Existing person` |
| Add new person from event | `+ New person` |
| Remove attendee button aria-label | `Remove {name} from this event` |
| Toast: attendee added | `Added {name}` |
| Toast: attendee removed | `Removed {name}` |
| Attendees picker title | `Add attendees` |
| Attendees picker search placeholder | `Search by name, role, or tag` |
| Attendees picker empty | `No matching people — try a shorter query` |
| Attendees picker commit | `Done` |
| Delete event dialog title | `Delete {event.name}?` |
| Delete event dialog body | `Any person whose "where you met" was this event will lose that link. Attendees themselves are kept.` |
| Delete event dialog confirm | `Delete` (destructive) |
| Toast: event deleted | `Deleted {name}` |
| "Keep open after save" label (in event-flow Add Person sheet) | `Keep adding more people` |
| Met-at chip on person detail (already exists in Phase 2) | `Met at {event.name}` |

**Voice rules:** unchanged from Phase 2 — direct, factual, sentence case.

---

## Registry Safety

| Registry | Blocks used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `dialog`, `command`, `sheet`, `alert-dialog`, `select`, `badge`, `dropdown-menu`, `form`, `input`, `label`, `textarea` (all from Phase 1+2) | Not required |
| `lucide-react` | `Calendar`, `MapPin`, `Plus`, `MoreVertical`, `X`, `Pencil`, `Trash2`, `ArrowLeft`, `Check` | Not required |
| `date-fns` | `format`, `formatDistanceToNow`, `startOfDay`, `isAfter`, `isBefore` | Not required |

No third-party registries.

---

## Interaction Contracts

### Route-aware FAB + TopBar button

- A single `RouteAwareFab` component lives in `AppShell`. It reads `usePathname()`:
  - On `/people*` → renders `AddPersonFab`
  - On `/events*` → renders `AddEventFab`
  - On `/` (Home) → renders `AddPersonFab` (the safer default — Home dashboard in v2 will reconsider)
- Mobile only (`md:hidden`). Hidden when any modal/sheet is open.
- TopBar button mirrors: pathname-driven choice between `AddPersonButton` and `AddEventButton`, desktop only.

### Events List

- Three-state render: `useUpcomingEvents() === undefined || usePastEvents() === undefined` → 6-row skeleton; both empty → `EventsEmptyState`; else → sections rendered.
- Sections collapse when empty: if no upcoming, the "Upcoming" heading is hidden.
- EventCard:
  ```
  ┌──────────────────────────────────────┐
  │ React NYC Meetup         [📅 going] │
  │ Brooklyn · 5 attendees   Tue, May 14│
  │ [meetup] [react]                     │
  └──────────────────────────────────────┘
  ```
- Whole card is `<Link href="/events/{id}">`.

### Add Event Sheet

- Identical flow to Phase 2 AddPersonSheet. Side = `bottom` on `<sm`, `right` on `≥sm`.
- Tab order: Name → Date → Location → Tags → Status → Submit.
- Validation: name required (zod), date required (zod — string ISO).
- After save: toast, close sheet (no keep-open mode for events — only the per-attendee loop opens an event).

### Status Chip

- Three-button `radiogroup`, same idiom as ClosenessChip.
- Always interactive on detail (instant save).
- Read-only `StatusBadge` (outline variant) on cards.

### Event Detail Page

- Layout mirrors PersonDetail: ← back link, Edit toggle, ⋯ overflow with Delete event.
- Heading: event name + location subtitle.
- Status segmented control under heading (interactive).
- Date display: relative or absolute depending on past/future.
- Tags row (view) / `TagChipInput` (edit).
- Attendees section:
  ```
  Attendees (3)
  [+ Existing person]   [+ New person]
  ──────────────────────────────────
  ┌──────────────────────────────────┐
  │ Sara Kim         [🔥 warm]   ×  │
  │ Designer · Linear                │
  └──────────────────────────────────┘
  ...
  ```
- Each attendee card is the same `PersonCard` from Phase 2, with a per-row remove `×` button positioned absolute-top-right; the rest of the card still routes to the person on click. Click on `×` stops propagation.
- Empty attendees: muted "No attendees yet." copy under the two add buttons.

### Attendees Picker (Dialog)

- shadcn `Dialog` (NOT Sheet). Centered, max-width-md, scroll inside.
- `Command` with:
  - `CommandInput` (autofocus)
  - `CommandList`:
    - `CommandEmpty` with the empty copy
    - `CommandGroup` of all people; each row a `CommandItem` with checkbox + name + `role · company` subtitle.
- Footer `DialogFooter`: Cancel (ghost) + Done (primary, count badge).
- Selection lives in local component state until Done is pressed — a single transaction commits all new attendees at once.

### Add-New-Person-from-Event loop (EVT-05)

- `AddPersonSheet` accepts `presetEventMetId` + `afterSubmit` + `keepOpenAfterSave` props.
- When opened via the event detail "+ New person" button:
  - `presetEventMetId = event.id`
  - `afterSubmit = (newId) => addAttendee(event.id, newId)`
  - `keepOpenAfterSave = true` initially; user can uncheck the in-sheet checkbox
- After submit:
  - If keep-open: clear form, autofocus Name, show inline confirm "Added {name} ✓" for 2s
  - Else: close Sheet

### Smart event-met default (EVT-07)

- When `AddPersonSheet` opens elsewhere (FAB anywhere, or TopBar), if `presetEventMetId` is undefined AND `useMostRecentEvent()` returns a non-null event, the form initializes with that event id selected.
- User can clear via the `—` option in the dropdown.
- The default does NOT reactively update mid-form.

### Delete-event cascade

- AlertDialog confirms with the literal body copy.
- On confirm, transaction clears `eventMetId` on affected people, deletes the event, toasts, routes to `/events`.

### Visual hierarchy examples

**Mobile — Events list (mixed)**
```
┌─────────────────────────────┐
│ Networking App      [☼]    │
│ ────────────────────────── │
│ # Events                    │
│                             │
│ Upcoming (2)                │
│ ┌─────────────────────────┐ │
│ │ React NYC   [📅 going]  │ │
│ │ Brooklyn · 5  Tue May 14│ │
│ │ [meetup] [react]        │ │
│ └─────────────────────────┘ │
│ ...                         │
│                             │
│ Past (3)                    │
│ ┌─────────────────────────┐ │
│ │ AI Tinkerers Cairo      │ │
│ │ Cairo · 3 atts  3d ago  │ │
│ │ [meetup]                │ │
│ └─────────────────────────┘ │
│                             │
│                       [+]   │
│ [⌂][☺][📆]                  │
└─────────────────────────────┘
```

**Desktop — Event detail with attendees**
```
┌────┬─────────────────────────────────────────┐
│ Net│ Networking App        [+ Add event][☼]  │
│work│ ─────────────────────────────────────── │
│    │ ← Events            [Edit] [⋯]         │
│ ○H │ React NYC Meetup                        │
│ ○P │ Brooklyn, NY                            │
│ ◉E │                                         │
│    │ [🤔 interested][📅 going][✓ attended]   │
│    │                                         │
│    │ Tue, May 14                             │
│    │ [meetup] [react]                        │
│    │                                         │
│    │ Attendees (3)                           │
│    │ [+ Existing person] [+ New person]      │
│    │ ───────────────────────────────────     │
│    │ ┌────────────────────────────────┐      │
│    │ │ Sara Kim       [🔥 warm]  ×    │      │
│    │ │ Designer · Linear              │      │
│    │ └────────────────────────────────┘      │
│    │ ...                                      │
└────┴─────────────────────────────────────────┘
```

---

## Accessibility

- `AttendeesPicker` Dialog: focus trap on open, restore on close (shadcn default), Escape closes.
- `Command` provides keyboard navigation out of the box.
- Status segmented: `role="radiogroup"`, arrow-key navigation (same as ClosenessChip).
- Remove-attendee `×` button: `aria-label` includes the person's name and the event name for context.
- Date input: native browser picker — keyboard date entry works; mobile pops the native picker.
- Toast on attendee add/remove uses `role="status"`.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting — every string named, sentence case, factual voice
- [x] Dimension 2 Visuals — Events list/detail mirror People rhythm; attendees use existing PersonCard; cards' two-line layout consistent
- [x] Dimension 3 Color — same accent reservation; status chips share active hue
- [x] Dimension 4 Typography — Phase 2 scale, no new sizes/weights
- [x] Dimension 5 Spacing — Tailwind defaults; section gaps explicit
- [x] Dimension 6 Registry Safety — shadcn official only

**Approval:** approved 2026-05-13 — aligns with CONTEXT.md D-01..D-34 and inherits Phase 2's locked design system.
