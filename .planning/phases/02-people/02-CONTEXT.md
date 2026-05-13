# Phase 2: People - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning
**Mode:** Smart discuss (4 grey areas, all recommendations accepted)

<domain>
## Phase Boundary

User can capture and manage the people they meet end-to-end — the "Add a person in under 30 seconds" core-value moment is real and demoable.

**In scope** (PPL-01..09):
- Floating "+" FAB / TopBar "Add person" button reachable from every screen
- Add Person Sheet (shadcn Sheet) — name + role + tag chips + 1-line note + where-we-met dropdown all above-fold
- People list page replacing the Phase 1 placeholder — two-line cards sorted by recent activity
- Person detail page replacing the Phase 1 placeholder — Edit toggle, three-chip closeness segmented control, overflow menu with delete-with-confirm, optional where-we-met chip linking to event
- Tag chip input with Enter/comma commit, autocomplete from existing tags, lowercase normalization (already wired in `lib/db/repositories/people.ts`)
- `usePeople` hook (already shipped — returns lastContactAt-desc sorted list) drives the list view
- `createPerson` triggers `requestPersistentStorage()` on first write (already wired; first invocation in this phase satisfies FND-06)
- Friendly empty states on list and detail
- Cascade delete: `deletePerson` already removes touches referencing the person

**Out of scope for this phase** (deferred):
- Events CRUD UI + attendees picker — Phase 3
- Smart "event-met" default (auto-prefill most recent event) — Phase 3 (the dropdown ships in Phase 2 reading existing events; auto-default lands in Phase 3 when events become user-creatable)
- Global search, closeness filter, tag filter — Phase 4 (SRC-01..04)
- JSON export/import, seed data, first-run prompt — Phase 4
- Touchpoint UI / follow-up date editing — v2 (TCH-01..06); follow-up field exists in schema but is not editable in v1
- Loading skeletons beyond shadcn `Skeleton` defaults — polish pass is Phase 4

</domain>

<decisions>
## Implementation Decisions

### Add Person Flow

- **D-01:** Add Person entry points — **floating "+" FAB bottom-right on mobile** (`<md` viewport, fixed positioned, safe-area-inset aware), **"Add person" button in TopBar on desktop** (`≥md`). Both open the same Sheet. _Why: PPL-01 requires "from anywhere in the app"; FAB is the conventional mobile pattern and the desktop TopBar already exists from Phase 1._
- **D-02:** Form surface — **shadcn `Sheet`** sliding up from bottom on mobile, drawer from right on desktop. No route change. _Why: 30-second capture (PPL-02) breaks if we navigate; Sheet keeps the user's place. shadcn already gives us the primitive — install via `pnpm dlx shadcn@latest add sheet`._
- **D-03:** Visible fields, in order:
  1. **Name** (text input, autofocused, required, only required field per PPL-01)
  2. **Role / company** (single text input — store role; company is optional and lives as a separate optional string per `Person` type)
  3. **Tag chips** (chip input — see D-12 through D-15)
  4. **Note** (single-line input — PPL-02 says "1-line note"; multi-line lives in detail's edit mode)
  5. **Where-we-met** (`Select` from existing events; reads `useEvents` — in Phase 2 the dropdown will usually be empty since no events exist yet, that's fine. The smart auto-default lands in Phase 3 per EVT-07.)
- **D-04:** Closeness selection in Add form — **not shown**. Defaults to `warm` (already the repo default in `createPerson`). User sets closeness from detail page after save. _Why: keeps Add form lean; closeness is editable inline on detail per D-08._
- **D-05:** After save — show **shadcn `Sonner` toast** "Added {name}", close Sheet, list refreshes via `useLiveQuery`. No navigation. _Why: stays in flow; user can add multiple people back-to-back by tapping the FAB again._
- **D-06:** Validation — name required, all else optional. Use `react-hook-form` + `zod` v3 resolver (per CLAUDE.md pin). Trim whitespace on submit; reject empty-after-trim name with inline error.
- **D-07:** Submit button states — `Saving...` spinner while async, disabled when name is empty.

### People List Page

- **D-08:** Card layout — two-line:
  - Row 1: **Name** (medium weight) + **closeness chip** (right-aligned, glanceable per PPL-09)
  - Row 2: **Role / company** (muted) + **"Last seen Nd ago"** (right-aligned, muted, computed from `lastContactAt` via `date-fns`)
  - Below: up to **3 tag chips + "+N more"** when over 3. Lowercase rendered.
- **D-09:** Default sort — **recent activity** (`lastContactAt` desc — `usePeople` already does this). No user-facing sort switcher in Phase 2.
- **D-10:** No filter UI in Phase 2 — closeness/tag filtering is **Phase 4** per SRC-03 (deferred). The Phase 2 list just renders everything in one scroll.
- **D-11:** Empty state — copy + button. Renders when `usePeople()` returns `[]`:
  ```
  No people yet.
  Add the first person you've met.
  [+ Add person]    ← opens Sheet
  ```
  Wrapped in a centered card per shadcn idiom. **Three-state render rule still applies** — `undefined` shows a Skeleton list, `[]` shows the empty state, otherwise shows cards.

### Person Detail Page

- **D-12:** Edit pattern — **single Edit toggle in TopBar-area of the page**. When off, fields render as labeled values. When on, fields become inputs; "Save" and "Cancel" buttons appear. No separate `/edit` route. _Why: keeps the URL surface small (one route per entity), Linear/Notion idiom._
- **D-13:** Closeness chip — **always interactive** (not gated by Edit mode). Three-chip segmented control near the top of the detail card; tap a chip → `updatePerson(id, { closeness })` fires immediately, optimistic via `useLiveQuery`. Per PPL-09: "editable inline from the detail page".
- **D-14:** Delete — overflow menu (top-right **⋯** button using shadcn `DropdownMenu` already in `components/ui/`). Item label "Delete person". Opens shadcn `AlertDialog`:
  - Title: "Delete {name}?"
  - Description: "This removes them and any touchpoints linked to them. This can't be undone."
  - Actions: Cancel / Delete (destructive variant)
  - On confirm: `deletePerson(id)` then `router.push("/people")`.
- **D-15:** Where-we-met display — chip showing `eventMet.name` linking to `/events/{eventMetId}`. **Hidden when `eventMetId` is unset.** When the event has been deleted (EVT-06 cascade clears the reference), the chip should not render. Reads via `useEvent(eventMetId)`.
- **D-16:** Notes display — single text block under the field strip. In edit mode becomes a `Textarea` allowing multi-line. Single-line input on Add form is intentional friction control; expand on detail.
- **D-17:** "Last seen N days ago" — factual indicator in a small muted row near the closeness chip. Uses `formatDistanceToNow(person.lastContactAt)`. Always shown, never editable directly (touchpoint UI in v2 is the editor).

### Tag Chip Input

- **D-18:** Input mechanics — type to filter; **Enter, comma, or Tab commits**; Backspace on empty input removes the last chip. Implemented as a controlled input wrapping a list of chips + a text `<input>`.
- **D-19:** Autocomplete — after the first character typed, query existing tags via `db.people.orderBy("tags").uniqueKeys()` (Dexie multi-entry index — already declared in v1 schema), filter by prefix, show top 5 in a popover below the input. Final option: "Create '{typedValue}'" when no exact match. Lift this into a hook `useTagSuggestions(query)` for reuse in Phase 3.
- **D-20:** Tag display on list cards — top 3 tags + "+N" overflow chip (count only, not interactive in Phase 2; filtering by tag is Phase 4).
- **D-21:** Chip visual — shadcn `Badge` `secondary` variant for inline display; in input form, custom chip component with a small "×" icon (lucide-react `X`) to remove. All chips lowercase to match stored form (PPL-08).

### Routes & files (target)

- `app/people/page.tsx` — list page (replaces Phase 1 placeholder).
- `app/people/[id]/page.tsx` — detail page (replaces Phase 1 placeholder).
- `components/people/PersonCard.tsx` — list row.
- `components/people/PersonForm.tsx` — Add/Edit form (shared between Sheet and inline edit mode).
- `components/people/AddPersonSheet.tsx` — Sheet wrapper hosting `PersonForm`.
- `components/people/ClosenessChip.tsx` — segmented control.
- `components/people/TagChipInput.tsx` — chip input with autocomplete.
- `components/people/PersonDetail.tsx` — detail layout (view + edit modes).
- `components/people/DeletePersonDialog.tsx` — AlertDialog wrapper.
- `components/shell/FloatingActionButton.tsx` — FAB (lives in shell since it's globally visible).
- `components/shell/AddPersonTrigger.tsx` — orchestrates the open state of the Sheet from FAB + TopBar.
- `hooks/use-tag-suggestions.ts` — autocomplete data hook.

### Claude's Discretion

- Exact icon choices for closeness chip (lucide-react has `Star`, `Flame`, `Snowflake` — likely those, or emoji per ROADMAP spec — try emoji first to match REQUIREMENTS.md literal text).
- Exact toast library — Sonner is the shadcn-default; install via `pnpm dlx shadcn@latest add sonner` if not present.
- Exact role-vs-company field split: ROADMAP says "name + role + 2 tags + 1-line note"; Person type has both `role` and `company`. Phase 2 ships them as **two separate single-line fields stacked**, with company optional. Compact enough for 30s capture.
- Whether to use shadcn `Form` wrapper or raw `react-hook-form`. Either is fine; pick the one that produces smaller diffs.
- Tag autocomplete popover positioning quirks — adjust if shadcn `Popover` clips inside the Sheet.
- Component test coverage depth — at minimum: createPerson + useTagSuggestions + tag normalization. Aim for the smoke level rather than exhaustive UI tests; full UI testing is Phase 4 polish.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project framing & locked decisions
- `.planning/PROJECT.md` — Core value (30-second capture), Linear/Notion aesthetic, workshop-readable code
- `.planning/REQUIREMENTS.md` §People — PPL-01..09 (the actual acceptance criteria for this phase)
- `.planning/REQUIREMENTS.md` §Search & Filter — confirms SRC-03 (closeness/tag filter) is Phase 4, NOT Phase 2
- `.planning/ROADMAP.md` §"Phase 2: People" — Goal, requirements list, 5 success criteria
- `.planning/phases/01-foundation-static-export-spine/01-CONTEXT.md` — Locked Phase 1 decisions (D-01..D-34); especially D-17 (schema), D-22 (ULIDs), D-23 (`requestPersistentStorage` helper exists)
- `.planning/phases/01-foundation-static-export-spine/01-SUMMARY.md` — What actually shipped, hook/repo stub locations
- `CLAUDE.md` — Conventions (client/server boundary, three-state render, tag normalization, ULIDs, no demo-only hacks, comments policy)

### Existing code surface (Phase 1 contracts to fill, not reshape)
- `lib/db/db.ts` — Dexie singleton; `people` store with index on `*tags`, `lastContactAt`, `closeness`, `followUpAt`. **Do not edit `version(1).stores(...)`**.
- `lib/db/types.ts` — `Person`, `Closeness` types — extend only if a required PPL field is missing
- `lib/db/repositories/people.ts` — `createPerson`, `updatePerson`, `deletePerson` already implement tag normalization and cascade delete. Fill out, don't rewrite.
- `lib/db/persist.ts` — `requestPersistentStorage()` helper; `createPerson` already calls it (satisfies FND-06).
- `hooks/use-people.ts` — `usePeople()` (lastContactAt-desc), `usePerson(id)`, `usePeopleCount()` — all live-queries, ready to consume.
- `hooks/use-events.ts` — `useEvents()`, `useEvent(id)`, `useMostRecentEvent()` — Phase 2 reads via `useEvents` for the where-we-met dropdown. (Most recent default lands in Phase 3.)
- `lib/id.ts` — `newId()` ULID generator. Use it; do not introduce a second id mechanism.
- `app/people/page.tsx`, `app/people/[id]/page.tsx`, `app/people/[id]/layout.tsx` — Phase 1 placeholders to replace. Keep the server `layout.tsx` exporting `generateStaticParams: () => []` and `dynamicParams = true` per D-05 from Phase 1.
- `components/ui/` — `button`, `dropdown-menu`, `separator`, `skeleton` already installed. Phase 2 likely adds: `sheet`, `input`, `label`, `textarea`, `form`, `select`, `badge`, `alert-dialog`, `sonner`, `popover`. Install in one batch via `pnpm dlx shadcn@latest add ...`.
- `components/shell/top-bar.tsx` — desktop "Add person" button slot; do not redesign the shell.

### Stack & architecture references
- `.planning/research/STACK.md` — pinned versions (zod v3, react-hook-form 7, dexie-react-hooks); shadcn install incantation
- `.planning/research/ARCHITECTURE.md` §"Data Layer" — repository pattern + `useLiveQuery` pattern; tag normalization rule
- `.planning/research/ARCHITECTURE.md` §"Forms" (if present) — react-hook-form + zod wiring
- `.planning/research/PITFALLS.md` §Moderate §"Dark-mode FOUC" — `next-themes` already wired; Sheet/Dialog primitives inherit theme correctly when rendered inside the shell
- `.planning/research/PITFALLS.md` §"Phase-Specific Warnings" — any Phase 2 row applies here

### Wireframes (informational, not literal)
- `Networking App Wireframes EN _standalone_.html` — hand-drawn People list/profile/add-person variants. *Built* product lands closer to Linear/Notion than the sketches per PROJECT.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (shipped in Phase 1)
- `hooks/use-people.ts` — `usePeople`, `usePerson(id)`, `usePeopleCount` (all live queries; `usePeople` already sorts by `lastContactAt` desc).
- `hooks/use-events.ts` — `useEvents`, `useEvent(id)`, `useMostRecentEvent` — Phase 2 needs `useEvents` for the where-we-met dropdown.
- `lib/db/repositories/people.ts` — `createPerson`, `updatePerson`, `deletePerson` with tag normalization and cascade delete already implemented.
- `lib/db/persist.ts` — `requestPersistentStorage()` (fires on first `createPerson` — FND-06 trigger lives in this phase).
- `lib/id.ts` — `newId()` ULID generator.
- `components/shell/{app-shell,top-bar,sidebar,bottom-nav}.tsx` — responsive shell ready to host FAB + Add Person trigger.
- `components/ui/{button,dropdown-menu,separator,skeleton}.tsx` — shadcn primitives.

### Established Patterns (from CLAUDE.md + Phase 1)
- Every Dexie-touching page is `"use client"`; pages that need `useParams()` colocate a server `layout.tsx` exporting `generateStaticParams: () => []`.
- Three-state render: `undefined` → skeleton, `[]` → empty state, else → data.
- Reads via `useLiveQuery` hooks; writes via repository functions.
- Tag normalization (`.trim().toLowerCase()`) on save in repository.
- IDs are ULIDs from `lib/id.ts`.
- Shell uses `min-h-dvh` and safe-area insets.
- Theme classes are applied at the html element by `next-themes`.

### Integration Points
- FAB lives inside `AppShell` (already present) — mobile fixed bottom-right, hidden ≥md. Tapping it dispatches the same "open Add Person Sheet" action as the desktop TopBar button.
- Add Person Sheet's open state lives in a small client store (Zustand or a simple React context in shell — keep it dependency-free if possible; one `useState` lifted to `AppShell` is fine).
- `useTagSuggestions(query)` hook colocated in `hooks/` for reuse by Phase 3 (event tags) and Phase 4 (search).
- The where-we-met `Select` reads `useEvents()` and stores selected event id as `eventMetId` on the person — Phase 3's smart default (EVT-07) will pre-select `useMostRecentEvent()?.id` when the form opens; Phase 2 ships the field empty by default since no events exist yet.

</code_context>

<specifics>
## Specific Ideas

- The 30-second capture moment is the headline. Every Phase 2 friction-touch (extra modal step, animation > 200ms, validation error blocking submit) is a defect.
- Toast over redirect after save (D-05). Keep the user's place.
- shadcn Sheet + a single-screen form is the entire Add flow. No multi-step wizard.
- Closeness chip is interactive even when Edit mode is off (D-13). It's the one inline-editable field.
- Tag input shared between Add and Edit. One component, both modes.

</specifics>

<deferred>
## Deferred Ideas

- **Smart event-met auto-default** — Phase 3 (EVT-07). Phase 2's Where-we-met dropdown defaults to "no event" since no events exist yet user-creatable.
- **Closeness filter chips on list** — Phase 4 (SRC-03).
- **Tag chip filter on list** — Phase 4 (SRC-03).
- **Global search input** — Phase 4 (SRC-01).
- **Touchpoint UI / follow-up date editor** — v2 (TCH-01..06). Schema fields exist (`followUpAt`, `lastContactAt`) but no UI.
- **Notes Markdown / rich text** — out of v1; plain text.
- **Tag management screen** — explicitly out per REQUIREMENTS.md Out-of-Scope. Autocomplete + normalize-on-save covers 80%.
- **Bulk operations (multi-select people)** — v2 (PRD-04).
- **Cmd+K command palette** — v2 (PRD-01).
- **Master-detail desktop layout** — v2 (PRD-02). Phase 2 ships single-column list + single-page detail on both viewports.
- **Per-route `loading.tsx` skeletons** — minimal Phase 2 skeletons via `Skeleton` inline; polish pass is Phase 4 (POL-01).
- **Comprehensive component tests** — Phase 2 ships smoke-level coverage (tag normalization, repo CRUD, optionally Add Person submit happy-path); full coverage is Phase 4.

</deferred>

---

*Phase: 02-people*
*Context gathered: 2026-05-13*
