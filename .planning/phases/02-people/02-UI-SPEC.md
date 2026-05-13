---
phase: 2
slug: people
status: approved
shadcn_initialized: true
preset: new-york
created: 2026-05-13
inherits_from: 01-UI-SPEC.md
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for the People phase.
> Phase 2 fills the empty `/people` list, `/people/[id]` detail, and lands the floating Add Person Sheet — the headline 30-second capture moment. The shell, tokens, and design system are locked by Phase 1; this document only specifies what's new.

---

## Inheritance

Everything in `01-UI-SPEC.md` is still in force unless overridden here. New shadcn primitives, new copy, new patterns are listed below.

---

## Design System Additions

| Property | Value |
|----------|-------|
| Tool | shadcn/ui CLI 3.5 |
| Preset | new-york (unchanged) |
| Font | Geist Sans + Geist Mono (unchanged) |
| Icons | lucide-react (unchanged) |

**shadcn primitives added in Phase 2** (install in one batch):

```bash
pnpm dlx shadcn@latest add input label textarea form select badge alert-dialog sheet sonner popover command
```

| Primitive | Used for |
|-----------|----------|
| `input` | Name, role, company, note, tag-input text field |
| `label` | Field labels in Add/Edit forms |
| `textarea` | Notes multi-line on detail's edit mode |
| `form` | react-hook-form wrapper around fields |
| `select` | Where-we-met dropdown reading `useEvents()` |
| `badge` | Tag chips on list cards and detail header |
| `sheet` | Add Person surface (bottom-sheet mobile, drawer-right desktop) |
| `alert-dialog` | Delete confirmation |
| `sonner` | Toast on save / delete |
| `popover` | Tag autocomplete dropdown anchored under chip input |
| `command` | Powers the tag autocomplete list inside `popover` (filter + keyboard nav for free) |

No third-party registries — official shadcn only.

---

## Spacing — phase additions

Phase 1 scale unchanged. New layout constants:

| Token | Value | Usage |
|-------|-------|-------|
| Card padding | `p-4` (16px) | PersonCard interior, list rows |
| Card gap | `gap-3` (12px) | Between rows inside a card |
| Card list gap | `space-y-2` (8px) | Between PersonCard instances in the list |
| Sheet content padding | `p-6` (24px) | Add Person form padding |
| Form field stack gap | `space-y-4` (16px) | Between form fields |
| FAB size | `h-14 w-14` (56×56px) | Floating Action Button — exceeds POL-03 44×44 floor |
| FAB offset (mobile) | `bottom-20 right-4` | Above BottomNav (`h-16`) + 16px; safe-area aware |
| Sheet width (desktop) | `sm:max-w-md` (~448px) | Drawer-right width on `≥sm` |
| Tag chip gap | `gap-1.5` (6px) | Between badges on a card |
| Closeness segmented control height | `h-9` (36px) | Three-chip pill row on detail |

---

## Typography — additions

No new sizes. Reaffirm Phase 1 scale:

| Role | Where it lands in Phase 2 |
|------|---------------------------|
| Heading (20px / 600) | Person detail H1 (the person's name) |
| Display (24px / 600) | List page H1 ("People") |
| Body (14px / 400) | Card name row, field values, notes body |
| Label (13px / 500) | Card secondary row (role, "Last seen Nd"), field labels, badge chips |

Tabular numerals: not yet needed (counts appear in Phase 4 on Home).

---

## Color — additions

Phase 1 palette unchanged. Phase 2 starts using:

| Role | Token | Where |
|------|-------|-------|
| Destructive | `destructive` / `destructive-foreground` | Delete button in AlertDialog, "Delete person" item in DropdownMenu |
| Secondary background | `secondary` | Tag `Badge` background (filled chip) |
| Muted | `muted` / `muted-foreground` | Card secondary row, field labels, empty-state body copy, "+N" overflow chip |
| Border | `border` | Card outlines, Sheet edges, segmented control divider |
| Accent | `accent` / `accent-foreground` | Active closeness chip in segmented control, FAB hover |
| Primary | `primary` | FAB background (mobile), "Save" button, "Add person" TopBar button (desktop) |
| Ring | `ring` | Focus state on every focusable control (unchanged from Phase 1) |

**60/30/10 invariant** still holds: background dominates, muted/secondary fill, primary/accent reserved for FAB + active closeness + focus + Save button.

**Closeness chip palette** (semantic but tone-restrained — Linear/Notion idiom):

| State | Active background | Active foreground | Inactive |
|-------|-------------------|-------------------|----------|
| close  | `bg-accent` | `text-accent-foreground` | `text-muted-foreground` |
| warm   | `bg-accent` | `text-accent-foreground` | `text-muted-foreground` |
| cooling | `bg-accent` | `text-accent-foreground` | `text-muted-foreground` |

Active state is identical accent across the three — visual differentiation comes from the **emoji + label**, not from coloring each state a different hue. Reason: keeps the palette honest, the page calm, and avoids reading-as-status-light (red/yellow/green) which would imply auto-decay (deferred to v2).

---

## Copywriting Contract — Phase 2

| Element | Copy |
|---------|------|
| List page H1 | `People` |
| FAB aria-label (mobile) | `Add a person` |
| TopBar button (desktop) | `+ Add person` |
| List empty title | `No people yet` |
| List empty body | `Add the first person you've met.` |
| List empty CTA | `+ Add person` (opens Sheet) |
| Loading state (list) | Six `Skeleton` rows mimicking PersonCard height (~72px each) |
| Add Person Sheet title | `Add a person` |
| Add Person Sheet description | `Capture them while it's fresh.` |
| Field: Name | label `Name` / placeholder `e.g. Sara Kim` |
| Field: Role | label `Role` / placeholder `Designer at Linear` |
| Field: Company | label `Company` / placeholder `Optional` |
| Field: Tags | label `Tags` / placeholder `Type a tag and press Enter` |
| Field: Note | label `Note` / placeholder `One line you don't want to forget` |
| Field: Where-we-met | label `Where you met` / placeholder when empty events: `No events yet` |
| Submit button (idle) | `Add person` |
| Submit button (busy) | `Saving…` |
| Submit button (disabled tooltip) | `Add a name to save` |
| Cancel button | `Cancel` |
| Toast on add success | `Added {name}` |
| Toast on add error | `Couldn't add — try again` |
| Name validation error | `Name is required` |
| Detail page (loading) | `Skeleton` block matching the detail card |
| Detail page (not found) | `This person doesn't exist or was removed.` + link `Back to people` |
| Detail: closeness segmented labels | `★ close` · `🔥 warm` · `❄ cooling` (literal per REQUIREMENTS.md PPL-09) |
| Detail: "Last seen Nd ago" | `Last seen {formatDistanceToNow(lastContactAt)}` (e.g. `Last seen 3 days ago`, `Last seen today`) |
| Detail: where-we-met chip | `Met at {event.name}` (linked) — hidden when `eventMetId` empty |
| Detail: notes empty | `No notes yet.` (muted, in view mode) |
| Detail: tags empty | (row hidden when empty in view mode; in edit mode shows the input) |
| Detail: Edit button | `Edit` |
| Detail: Save button (edit mode) | `Save` |
| Detail: Cancel button (edit mode) | `Cancel` |
| Detail: overflow menu trigger aria-label | `Person actions` |
| Detail: overflow menu item | `Delete person` (destructive variant) |
| Delete dialog title | `Delete {name}?` |
| Delete dialog body | `This removes them and any touchpoints linked to them. This can't be undone.` |
| Delete dialog cancel | `Cancel` |
| Delete dialog confirm | `Delete` (destructive variant) |
| Toast on delete | `Deleted {name}` |
| Toast on update | `Saved` (single-word; minimal — the data refresh itself is the proof) |
| Tag autocomplete: create | `Create "{query}"` |
| Tag autocomplete: empty | `No matching tags — press Enter to create` |

**Voice rules** (inherited from Phase 1, reinforced):
- Direct, factual, kind.
- Sentence case throughout (no Title Case).
- One sentence per microcopy slot; no exclamation marks; no marketing.
- Emoji only where REQUIREMENTS.md explicitly mandates (closeness chip — PPL-09).
- Never address the user with "you" inside form labels; use it freely in empty states and dialogs.

---

## Registry Safety

| Registry | Blocks used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | All shadcn primitives listed in Design System Additions | Not required — official registry |
| `lucide-react` | `Plus` (FAB / add button), `Star`, `Flame`, `Snowflake` (closeness fallback if emoji feels off), `MoreVertical` (overflow trigger), `X` (chip remove), `Pencil` (Edit), `Trash2` (delete), `Check` (save), `ArrowLeft` (back link on not-found) | Not required |
| `react-hook-form` + `@hookform/resolvers` + `zod` v3 | Form wiring | Not required — already in stack |
| `dexie-react-hooks` | `useLiveQuery` in `useTagSuggestions`, `usePeople`, `usePerson`, `useEvents` | Not required |
| `date-fns` | `formatDistanceToNow` for "Last seen Nd ago" | Not required |
| `sonner` | toast renderer (shipped via shadcn-add) | Not required |

No third-party (community) registries used.

---

## Interaction Contracts

### Add Person Flow

- **Trigger A (mobile):** Floating `+` action button at `bottom-20 right-4`, primary background, primary-foreground icon, `shadow-lg`, hidden `md:hidden`. Renders inside `AppShell` so every route gets it. Pressing it opens the Sheet.
- **Trigger B (desktop):** "+ Add person" button in TopBar (right-aligned, ghost variant on hover, primary on rest). Visible `hidden md:inline-flex`. Same Sheet.
- **Sheet behavior:**
  - Mobile (`<sm`): slides up from the bottom (`side="bottom"`), full-width, max 90vh.
  - Desktop (`≥sm`): slides in from the right (`side="right"`), `sm:max-w-md`.
  - `Sheet` close-on-outside-click stays on (shadcn default). `Escape` closes.
  - First focus goes to the Name input (the autofocused field).
- **Form sequence (tab order):** Name → Role → Company → Tags chip input → Note → Where-we-met → Submit.
- **Validation:** Required = Name only. Trim whitespace before validation. Empty Name renders inline `text-destructive` message under the field.
- **Submit:** disabled while name is empty OR while request is in flight. Pressing Enter in any single-line input submits. Tag chip input swallows Enter for chip commit (doesn't submit form).
- **On success:** sheet closes (~150ms exit animation), Sonner toast fires from bottom-right (desktop) or bottom-above-nav (mobile, respecting safe-area), list refreshes via `useLiveQuery`. The newly added person appears at the top.
- **On error:** sheet stays open, toast fires with retry copy, form values preserved.
- **Re-open behavior:** opening the Sheet always starts with a clean empty form (no draft persistence in v1).

### People List

- Three-state render strictly applied: `usePeople() === undefined` → 6 Skeleton rows; `=== []` → EmptyState card; else → list of `PersonCard`.
- **PersonCard layout:**
  ```
  ┌─────────────────────────────────────────────┐
  │ Sara Kim                       [🔥 warm]    │  ← Body 14/400 + chip
  │ Designer · Linear           Last seen 3d    │  ← Label 13/500 muted
  │ [design] [nyc] [+2]                         │  ← Badge secondary chips
  └─────────────────────────────────────────────┘
  ```
  - Whole card is clickable, routes to `/people/{id}`.
  - Closeness chip on row 1 is **not** interactive on the list — tap goes to detail. Inline edit lives on detail page only (D-13 prevents accidental tap-and-change on dense list scroll).
  - Tags row appears only when `tags.length > 0`. Hidden cleanly otherwise.
  - On hover (desktop): `hover:bg-muted/50` + cursor pointer. Mobile uses `active:bg-muted/50`.

- **Empty state card** centered with vertical padding:
  ```
  ┌─────────────────────────────────────────────┐
  │                                             │
  │            No people yet                    │  ← Heading 20/600
  │   Add the first person you've met.          │  ← Body 14/400 muted
  │           [+ Add person]                    │  ← Primary button
  │                                             │
  └─────────────────────────────────────────────┘
  ```
  Button triggers the same shared Sheet store.

### Person Detail

- Layout:
  ```
  ┌─────────────────────────────────────────────┐
  │ ← People             [Edit]  [⋯]            │  ← back link, edit, overflow
  │                                             │
  │ Sara Kim                                    │  ← Heading 20/600
  │ Designer · Linear                           │  ← Label 13/500 muted
  │                                             │
  │ [★ close] [🔥 warm] [❄ cooling]              │  ← Segmented control
  │                                             │
  │ Last seen 3 days ago                        │  ← Label muted
  │ Met at React NYC Meetup                     │  ← Linked chip (or hidden)
  │                                             │
  │ Tags                                        │  ← Label
  │ [design] [nyc] [react]                      │
  │                                             │
  │ Notes                                       │  ← Label
  │ Loves typography. Looking for a side proj.  │  ← Body
  └─────────────────────────────────────────────┘
  ```
- **View mode** is default. **Edit mode** toggles when user clicks `Edit`.
- **In edit mode:**
  - Name, role, company, note become inputs; tag chip input renders inline; where-we-met `Select` renders.
  - Edit button hides; Save + Cancel buttons appear in its place.
  - Closeness segmented control stays interactive in BOTH modes (D-13 — instant save).
  - Cancel reverts changes and exits edit mode. Save fires `updatePerson` and exits edit mode on success, Sonner "Saved" toast.
- **Closeness segmented control:**
  - Three buttons in a row, each `h-9` and equal-width, inside a `border rounded-md` shell.
  - Active state: `bg-accent text-accent-foreground`.
  - Inactive: `text-muted-foreground hover:bg-muted/50`.
  - Tapping a chip fires `updatePerson(id, { closeness })` optimistically; live-query rebroadcasts the result.
- **Overflow menu** (`DropdownMenu` triggered by `MoreVertical` icon button):
  - Item: `Delete person` (destructive — red text + `Trash2` icon).
  - On click → opens `AlertDialog`. Cancel keeps state; Delete fires `deletePerson(id)` → router.push("/people") → Sonner "Deleted {name}".

### Tag Chip Input (`TagChipInput.tsx`)

- Composition: bordered container (`rounded-md border h-auto px-2 py-1`) wrapping flexible row of `Badge`+× chips and a flex-grow `<input>` text element.
- Click anywhere in the container focuses the text input.
- **Commit triggers:** Enter, comma, Tab (each appends current input value as a normalized chip — trim+lowercase, dedupe).
- **Backspace on empty input** removes the last chip.
- **Autocomplete behavior:**
  - On focus or first char typed, render a `Popover` positioned under the input.
  - Inside the popover, a `Command` from shadcn with `CommandList` of up to 5 matching existing tags (filtered by prefix), sorted by descending frequency (cheap: `db.people.orderBy("tags").uniqueKeys()` then re-rank — or simpler, alphabetical for v1).
  - Arrow-down moves selection into the popover; Enter commits the highlighted suggestion.
  - "Create '{query}'" appears as the last item when the input is non-empty and not an exact match for an existing tag.
- **Visual:**
  - Inline chips: `<Badge variant="secondary">` with trailing `<X className="ml-1 size-3" />` button.
  - Chips rendered in **lowercase** to match stored form (PPL-08).
  - Container border tightens to `ring-2 ring-ring` on focus-within.

### FAB Specifics

- `aria-label="Add a person"`, `role="button"`.
- `h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95`.
- Position: `fixed bottom-20 right-4 md:hidden z-40` — sits above BottomNav (h-16) with breathing room, hides on desktop.
- Respects safe-area: `mb-[env(safe-area-inset-bottom)]` added to the outer wrapper.

### Responsive Breakpoints (Phase 2 additions)

| Breakpoint | Behavior |
|------------|----------|
| `<md` (mobile) | FAB visible; TopBar shows app title + theme toggle only; Add Person Sheet slides up from bottom |
| `≥md` (desktop) | FAB hidden; TopBar shows app title + "+ Add person" button + theme toggle; Add Person Sheet slides in from right |

No `lg:` master-detail in Phase 2 — list and detail remain single-column on every viewport (master-detail is v2 / PRD-02).

### Loading States

- **People list:** 6 `Skeleton` rows, each ~72px tall mimicking PersonCard shape. Renders while `usePeople()` is `undefined`.
- **Person detail:** Skeleton block for name+role row, then chip row, then 2 muted rows. Renders while `usePerson(id)` is `undefined`.
- **Add Sheet submit:** Submit button shows `Saving…` text + disabled state; the rest of the form stays interactive.
- **No global page-loading bar** in Phase 2. Live-query response times under fake-indexeddb and real Dexie are sub-frame.

### Empty States

- **People list empty** — see Copywriting table; primary CTA opens Sheet.
- **Person detail "not found"** — fired when `usePerson(id) === null` (i.e., loaded but missing). Shows a small card with the not-found copy and a `← Back to people` link.
- **Tag list inside detail empty** — entire tags row hidden in view mode; in edit mode the input renders empty with its placeholder.
- **Notes empty (view mode)** — italic muted "No notes yet."; in edit mode the textarea is empty with placeholder.

---

## Accessibility

- All form fields wired through `<Label htmlFor>` ↔ `<Input id>`. Tag chip input has `aria-label="Tags"` since chips themselves carry the label semantically.
- Sheet uses shadcn's built-in focus trap, restores focus on close.
- AlertDialog: title + description bound via `aria-labelledby` / `aria-describedby` (shadcn default).
- Segmented closeness control: rendered as a `role="radiogroup"` with three `role="radio" aria-checked` buttons; arrow keys navigate, Space activates.
- Overflow menu: `aria-haspopup="menu"` (shadcn default).
- Destructive button gets `aria-label` repeating the action verb ("Delete Sara Kim").
- Toasts: Sonner default `role="status"` for success, `role="alert"` for errors.
- Tap targets: FAB 56×56 (exceeds 44). PersonCard whole card ~72px tall. Closeness chip row at `h-9` per chip — keyboard-driven on desktop, finger-friendly on mobile (entire row stretches to width).
- Color contrast: shadcn `new-york` accent + foreground meets AA; verify in both themes during execute.

---

## Visual Hierarchy Examples

### Mobile — People list (with people)
```
┌────────────────────────────────────┐
│ Networking App              [☼]   │  ← TopBar h-14
│ ──────────────────────────────── │
│ # People                            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Sara Kim          [🔥 warm]    │ │
│ │ Designer · Linear  Last seen 3d │ │
│ │ [design] [nyc] [+2]             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Kareem Tate       [★ close]    │ │
│ │ PM · Notion        Last seen 1w │ │
│ └─────────────────────────────────┘ │
│                                     │
│                              [+]   │  ← FAB, above BottomNav
│ ─────────────────────────────────  │
│ [⌂ Home] [☺ People] [📆 Events] │  ← BottomNav
└────────────────────────────────────┘
```

### Mobile — Add Person Sheet (bottom)
```
┌────────────────────────────────────┐
│ ╳   Add a person                   │
│     Capture them while it's fresh. │
│                                     │
│ Name                                │
│ [_________________________________] │
│                                     │
│ Role                                │
│ [_________________________________] │
│                                     │
│ Company (optional)                  │
│ [_________________________________] │
│                                     │
│ Tags                                │
│ [design] [nyc] [type…           ▢] │
│                                     │
│ Note                                │
│ [_________________________________] │
│                                     │
│ Where you met                       │
│ [Select event ▾]                    │
│                                     │
│              [Cancel]  [Add person] │
└────────────────────────────────────┘
```

### Desktop — People list with TopBar Add button
```
┌────────────┬────────────────────────────────────────┐
│            │ Networking App   [+ Add person][☼ menu]│
│  Networking│ ──────────────────────────────────────│
│            │ # People                                │
│  ○ Home    │                                         │
│  ◉ People  │  ┌──────────────────────────────────┐  │
│  ○ Events  │  │ Sara Kim         [🔥 warm]      │  │
│            │  │ Designer · Linear  Last seen 3d  │  │
│            │  │ [design] [nyc] [+2]              │  │
│            │  └──────────────────────────────────┘  │
│  [☼ Theme] │  ...                                    │
└────────────┴────────────────────────────────────────┘
```

### Desktop — Person Detail
```
┌────────────┬────────────────────────────────────────┐
│            │ Networking App                  [☼]    │
│  Networking│ ──────────────────────────────────────│
│            │ ← People                  [Edit] [⋯]  │
│  ○ Home    │                                         │
│  ◉ People  │ Sara Kim                                │
│  ○ Events  │ Designer · Linear                       │
│            │                                         │
│            │ [★ close] [🔥 warm] [❄ cooling]         │
│            │                                         │
│            │ Last seen 3 days ago                    │
│            │ Met at React NYC Meetup ↗               │
│            │                                         │
│            │ Tags                                    │
│            │ [design] [nyc] [react]                  │
│            │                                         │
│            │ Notes                                   │
│            │ Loves typography. Looking for a side    │
│  [☼ Theme] │ project.                                │
└────────────┴────────────────────────────────────────┘
```

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting — every visible string is named and in voice (direct/factual/kind, sentence case, no marketing)
- [x] Dimension 2 Visuals — list/detail/sheet patterns line up with REQUIREMENTS.md (PPL-01..09) and CONTEXT.md decisions; wireframes consulted, Linear/Notion polish maintained
- [x] Dimension 3 Color — 60/30/10 ratio holds; destructive only on delete; closeness states share accent (single hue avoids stoplight semantics)
- [x] Dimension 4 Typography — same Geist scale as Phase 1; no new weights; restraint preserved
- [x] Dimension 5 Spacing — every new value is a multiple of 4 / Tailwind default; FAB position respects BottomNav + safe-area; Sheet sizing declared
- [x] Dimension 6 Registry Safety — only official shadcn registry; no third-party blocks

**Approval:** approved 2026-05-13 — UI contract aligns with CONTEXT.md decisions D-01 through D-21 and inherits Phase 1's locked design system.
