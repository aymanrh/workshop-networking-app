---
phase: 4
slug: search-seed-polish-ship
status: approved
shadcn_initialized: true
preset: new-york
created: 2026-05-13
inherits_from: 03-UI-SPEC.md
---

# Phase 4 — UI Design Contract

> Inherits Phase 2 + Phase 3 design system. This contract documents Search, Header menu, Seed-prompt card, Home polish, and README/deploy decisions.

---

## New surfaces

| Surface | What it is |
|---------|------------|
| TopBar SearchInput | Slim search input in TopBar (mobile: icon → expandable; desktop: persistent) |
| Search Popover | Anchored under SearchInput. Filter row + scrollable result rows + empty-state copy |
| HeaderMenu | `⋯` overflow DropdownMenu in TopBar — Load sample data / Export data / Import data |
| SeedPromptCard | Conditional card on `/` Home when DB is empty AND not dismissed |
| Home counts strip | Two muted counts (People · Events) shown only when data exists |
| Replace-on-import AlertDialog | Confirm replace destructive action |

---

## Spacing additions

| Token | Value | Usage |
|-------|-------|-------|
| TopBar search width (desktop) | `w-64` (256px) | Persistent input width |
| Popover width | match anchor; `min-w-80` | Search Popover |
| Result row padding | `px-3 py-2` | Compact rows inside popover |
| Result list max-height | `max-h-80` (320px) | Scroll boundary |

---

## Color additions

No palette changes. Uses existing `accent` for active filter chip, `muted` for filter chip rest, `popover` background.

---

## Copywriting Contract — Phase 4

| Element | Copy |
|---------|------|
| SearchInput placeholder | `Search people` |
| SearchInput aria-label | `Search people` |
| Mobile search icon aria-label | `Open search` |
| Popover filter heading | `Filters` (small muted) |
| Filter: All closeness | `All` |
| Filter: Close | `★ close` |
| Filter: Warm | `🔥 warm` |
| Filter: Cooling | `❄ cooling` |
| Result list heading (with query) | `Results ({count})` |
| Result list heading (no query, filter active) | `Filtered ({count})` |
| Empty-state copy | `No matches. Try a shorter query or drop a tag.` |
| Initial state copy (no query, no filter) | (popover hidden) |
| HeaderMenu trigger aria-label | `App menu` |
| HeaderMenu: load seed | `Load sample data` |
| HeaderMenu: export | `Export data` |
| HeaderMenu: import | `Import data` |
| Export toast | `Exported {N} people · {M} events` |
| Import-confirm dialog title | `Replace your data?` |
| Import-confirm dialog body | `This replaces your current data ({N} people · {M} events) with the imported file. This can't be undone.` |
| Import-confirm cancel | `Cancel` |
| Import-confirm confirm | `Replace` (destructive) |
| Import success toast | `Imported {N} people · {M} events` |
| Import error toast | `Couldn't read that file.` |
| Seed-prompt card title | `Try with sample data` |
| Seed-prompt card body | `Load 8 sample people and 4 events so you can explore. You can clear it anytime.` |
| Seed-prompt primary | `Load sample data` |
| Seed-prompt secondary | `Start empty` |
| Seed loaded toast | `Loaded sample data` |
| Home title | `Welcome back` |
| Home counts (with data) | `{N} people · {M} events` |
| Home empty-after-dismiss copy | `Nothing here yet. Add someone from the People tab or tap the + below.` |

**Voice rules** unchanged.

---

## Registry Safety

| Registry | Blocks used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `popover`, `dropdown-menu`, `command`, `alert-dialog`, `input`, `badge`, `button` (all installed) | Not required |
| `lucide-react` | `Search`, `MoreHorizontal`, `Download`, `Upload`, `Database` (seed), `X`, `Plus`, `Calendar`, `Users` | Not required |
| `dexie-export-import` | `exportDB(db)`, `importInto(db, blob)` | Not required — vetted Dexie ecosystem |
| `@playwright/test` (dev only) | smoke E2E config | Not required |

No third-party UI registries.

---

## Interaction Contracts

### SearchInput + Popover

- **Mobile:** Search icon button in TopBar. Tap → expands a sticky input under the TopBar (slides down with `transition-all`). Tap outside → collapse.
- **Desktop:** persistent `<Input>` (`w-64`) in TopBar between title-spacer and Add button.
- Input is controlled; debounced query passes to `useSearchPeople`.
- Popover anchors below the input. Opens when (input focused AND (query non-empty OR any filter non-default)).
- Esc closes popover and clears focus.
- Arrow-down inside the input moves focus into the popover result list (uses native Tab semantics — no custom keyboard navigation in v1).
- Clicking a row navigates to `/people/{id}` and closes the popover.

### Filters

- Row of small chip buttons inside the popover, above the result list.
- Closeness: 4-button segmented (`All / Close / Warm / Cooling`) — single-select, default `All`.
- Tag chips: rendered to the right of closeness row; up to 8 chips; toggle to AND-filter.

### Search algorithm

Implemented in `lib/search.ts`:
- `scorePerson(person, q): number` per CONTEXT.md §D-04
- `searchPeople(people, query, closeness, tags): Person[]` returns filtered + sorted matches
- Cap result list to 8 visible (rest accessible via the dedicated route in v2)

### HeaderMenu

- `MoreHorizontal` icon button in TopBar (right of search, before RouteAwareAddButton on desktop; before ThemeToggle on mobile).
- DropdownMenu items:
  - `Load sample data` — calls `loadSeed()`
  - `Export data` — calls `exportData()`; downloads JSON
  - `Import data` — opens hidden file input
- Items disabled briefly during async operation; menu auto-closes on select (shadcn default).

### SeedPromptCard

- Renders centered on Home when `useFirstRunState() === "prompt"`.
- Card has title + body + two buttons stacked on mobile, side-by-side on desktop.
- Loading the seed shows a brief inline "Loading…" state on the primary button.

### Home page composition

- View 1 (no data, not dismissed): SeedPromptCard
- View 2 (no data, dismissed): empty-state card with copy + "+" hint
- View 3 (has data): greeting + counts strip

### Import-replace dialog

- AlertDialog with the literal copy.
- Destructive `Replace` action runs:
  1. `await db.delete()`
  2. `await db.open()`
  3. `await importInto(db, blob)`
  4. toast `Imported X people · Y events`

---

## Accessibility

- SearchInput has `role="searchbox"` (native via `<Input type="search" />`).
- Popover has `role="dialog"` (shadcn default), labelled by the input's label.
- Empty-state copy is inside `aria-live="polite"` so screen readers announce updates.
- HeaderMenu trigger has a clear aria-label.
- Filter chips are buttons with `aria-pressed` for toggle state.

---

## Visual hierarchy

**Desktop TopBar with new surfaces**
```
┌────────────┬─────────────────────────────────────────────────────┐
│            │ [🔍 Search people________]  [+ Add person] [⋯] [☼]  │
│  Networking│ ────────────────────────────────────────────────── │
│            │
```

**Mobile TopBar**
```
┌──────────────────────────────────┐
│ Networking App  [🔍][⋯][☼]      │ ← Search icon expands below
└──────────────────────────────────┘
```

**SearchPopover open**
```
┌──────────────────────────────────────────┐
│ [🔍 sara_____________________________]   │
│ ┌──────────────────────────────────────┐ │
│ │ Filters                              │ │
│ │ [All] [★ close] [🔥 warm] [❄ cool]   │ │
│ │ [design] [nyc] [react] [+5]          │ │
│ │ ──────────────────────────────────── │ │
│ │ Results (2)                          │ │
│ │ Sara Kim — Designer · Linear  [🔥]  │ │
│ │ Sara Park — Eng · Anthropic   [★]   │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Home with seed prompt**
```
┌──────────────────────────────────┐
│ Welcome back                      │
│                                  │
│ ┌──────────────────────────────┐ │
│ │  Try with sample data        │ │
│ │  Load 8 sample people and 4  │ │
│ │  events so you can explore.  │ │
│ │  [Load sample data][Start    │ │
│ │   empty]                     │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## Checker sign-off

- [x] Dimension 1 Copywriting — every string named, voice consistent
- [x] Dimension 2 Visuals — search + popover + menu pattern match Phase 2/3 idioms
- [x] Dimension 3 Color — accent only on active filter, destructive only on replace confirm
- [x] Dimension 4 Typography — no new sizes
- [x] Dimension 5 Spacing — multiples of 4 throughout
- [x] Dimension 6 Registry Safety — shadcn official + `dexie-export-import` vetted

**Approval:** approved 2026-05-13 — aligned with CONTEXT.md D-01..D-29.
