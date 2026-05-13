---
phase: 2
slug: people
status: ready
mode: auto-chain
created: 2026-05-13
requirements: [PPL-01, PPL-02, PPL-03, PPL-04, PPL-05, PPL-06, PPL-07, PPL-08, PPL-09]
---

# Phase 2 — PLAN

Reference: `02-CONTEXT.md`, `02-UI-SPEC.md`, `01-CONTEXT.md` (locked Phase 1 decisions), `01-SUMMARY.md` (shipped surface), `.planning/REQUIREMENTS.md` §People, `CLAUDE.md`.

Goal: User can capture and manage the people they meet end-to-end — the "Add a person in under 30 seconds" core-value moment is real and demoable. Replace Phase 1's `/people` + `/people/[id]` placeholders with full CRUD: floating Add Person Sheet (mobile FAB + desktop TopBar button), list with `useLiveQuery`-driven cards, detail with inline edit, three-chip closeness segmented control with instant save, tag chip input with autocomplete from existing tags + lowercase normalization, cascade-delete confirm dialog. All other Phase 1 surface (shell, theme, schema, hooks/repos) is contracts — fill them, do not reshape.

## Plan Index

Plans run sequentially. Each plan is a single atomic commit unless noted.

| # | Plan | Output |
|---|------|--------|
| 2.01 | Install Phase 2 runtime deps (`react-hook-form`, `zod@3`, `@hookform/resolvers`) + dev verify | `package.json`, `pnpm-lock.yaml` |
| 2.02 | Add Phase 2 shadcn primitives in one batch (`sheet`, `input`, `label`, `textarea`, `form`, `select`, `badge`, `alert-dialog`, `sonner`, `popover`, `command`) | `components/ui/*.tsx` (11 new files), `app/globals.css` (no token changes) |
| 2.03 | Wire `<Toaster />` (Sonner) into the server `app/layout.tsx` so toasts fire from any client component | `app/layout.tsx` |
| 2.04 | Build `useTagSuggestions(query)` hook reading existing tags from Dexie via `*tags` multi-entry index | `hooks/use-tag-suggestions.ts` |
| 2.05 | Build `TagChipInput` component (chips + autocomplete `Popover` + `Command`) — Enter/comma/Tab commit, Backspace deletes last, autocomplete with "Create '{x}'" fallback | `components/people/tag-chip-input.tsx` |
| 2.06 | Build `ClosenessChip` three-button segmented `radiogroup` (★ close / 🔥 warm / ❄ cooling) — controlled component, fires onChange immediately | `components/people/closeness-chip.tsx` |
| 2.07 | Build `PersonForm` (react-hook-form + zod schema) — shared between Add Sheet and Detail edit mode. Name required, role/company/note/tags/eventMetId optional. Where-we-met `Select` reads `useEvents()`. | `components/people/person-form.tsx`, `lib/validators/person.ts` |
| 2.08 | Build the Add Person Sheet experience: `AddPersonSheet` (renders the Sheet + PersonForm), `AddPersonProvider` (shared open-state context), `AddPersonFab` (mobile `+`), `AddPersonButton` (desktop TopBar). Wire trigger into `AppShell` + `TopBar`. | `components/people/add-person-sheet.tsx`, `components/people/add-person-context.tsx`, `components/people/add-person-fab.tsx`, `components/people/add-person-button.tsx`, `components/shell/app-shell.tsx` (mount provider+FAB), `components/shell/top-bar.tsx` (mount desktop button) |
| 2.09 | Build `PersonCard` — two-line layout, closeness chip readonly, tag overflow chip, "Last seen Nd ago" via `date-fns/formatDistanceToNow`, whole-card link to `/people/{id}` | `components/people/person-card.tsx` |
| 2.10 | Replace `/people` placeholder with real list page — three-state render (Skeleton ⟶ EmptyState ⟶ cards), feeds from `usePeople()` | `app/people/page.tsx`, `components/people/people-empty-state.tsx` |
| 2.11 | Build `DeletePersonDialog` (`AlertDialog`) — confirms, fires `deletePerson(id)`, toasts, routes back to `/people` | `components/people/delete-person-dialog.tsx` |
| 2.12 | Build `PersonDetail` — view + edit modes, inline closeness, where-we-met chip linking to `/events/{id}`, overflow menu with delete entry | `components/people/person-detail.tsx` |
| 2.13 | Replace `/people/[id]` placeholder with real detail page — wires `usePerson(useParams().id)`, three-state, handles not-found | `app/people/[id]/page.tsx` |
| 2.14 | Phase 2 tests: tag normalization round-trip, createPerson smoke (incl. ULID + lastContactAt set), useTagSuggestions ordering, deletePerson cascades touches | `test/db/people.test.ts`, `test/hooks/use-tag-suggestions.test.ts` |
| 2.15 | Local verification: `pnpm run build` green, `pnpm test` green, manual UAT on mobile + desktop viewport covering all 5 Phase 2 success criteria | (no new files) |

Plans 2.01–2.15 produce one commit each. Plans are sequential — most depend on the previous (UI components build bottom-up). Within plan 2.14 the two test files are added together in one commit.

## Detail per plan

### 2.01 — Install runtime form deps

`read_first`: `package.json`, `.planning/research/STACK.md` (zod v3 pin rationale)

`action`:
```bash
pnpm add react-hook-form@^7 zod@^3 @hookform/resolvers@^5
```

`acceptance_criteria`:
- `package.json` contains `"zod": "^3."` (NOT v4 — see CLAUDE.md pin)
- `package.json` contains `"react-hook-form": "^7."`
- `package.json` contains `"@hookform/resolvers": "^5."`
- `pnpm-lock.yaml` updated
- `pnpm install` exits 0

`commit`: `chore(02): add react-hook-form + zod v3 + resolvers`

---

### 2.02 — Add shadcn primitives

`read_first`: `components/ui/` (existing primitives), `components.json`, `02-UI-SPEC.md` §"Design System Additions"

`action`:
```bash
pnpm dlx shadcn@latest add sheet input label textarea form select badge alert-dialog sonner popover command
```

`acceptance_criteria`:
- `components/ui/sheet.tsx` exists and exports `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetTrigger`, `SheetClose`
- `components/ui/input.tsx`, `label.tsx`, `textarea.tsx`, `form.tsx`, `select.tsx`, `badge.tsx`, `alert-dialog.tsx`, `sonner.tsx`, `popover.tsx`, `command.tsx` all exist
- `pnpm run build` exits 0 (no leftover compile errors from missing peer deps)
- No edits to `globals.css` token blocks — shadcn-add must not touch `:root` if it already exists

`commit`: `chore(02): add shadcn primitives (sheet, form, badge, alert-dialog, sonner, popover, command, ...)`

---

### 2.03 — Wire `<Toaster />`

`read_first`: `app/layout.tsx`, `components/ui/sonner.tsx`

`action`:
- Import the shadcn `Toaster` (it's a client component shipped by `add sonner`) into `app/layout.tsx`.
- Render `<Toaster richColors closeButton position="bottom-right" />` after `<AppShell>` children (or wherever shadcn convention places it — usually outside the main shell). It is a client component; nesting it inside server `layout.tsx` is fine since shadcn's Toaster already wraps in `"use client"`.

`acceptance_criteria`:
- `app/layout.tsx` imports `Toaster` from `@/components/ui/sonner`
- `app/layout.tsx` renders `<Toaster />` once
- `pnpm run build` exits 0
- `grep -r "useTheme" components/ui/sonner.tsx` matches (next-themes integration intact — shadcn default)

`commit`: `feat(02): mount sonner Toaster in root layout`

---

### 2.04 — `useTagSuggestions` hook

`read_first`: `hooks/use-people.ts` (pattern), `lib/db/db.ts` (schema confirms `*tags` index)

`action`:
- Create `hooks/use-tag-suggestions.ts` exporting `useTagSuggestions(query: string, limit = 5): string[] | undefined`.
- `"use client"` at the top.
- Implementation: live-query `db.people.orderBy("tags").uniqueKeys()` (Dexie returns each unique multi-entry key once). Cast to `string[]`. Filter by `tag.startsWith(query.trim().toLowerCase())`. Slice to `limit`. Return undefined while live-query is loading (preserves three-state render contract).
- Empty `query` returns the first `limit` tags (alphabetical) — used when chip input is focused without typing yet.

`acceptance_criteria`:
- File starts with `"use client";`
- Default export OR named export `useTagSuggestions` exists
- TypeScript compiles (`pnpm tsc --noEmit` or `pnpm run build`)
- Hook returns `string[] | undefined` (NOT null; matches `useLiveQuery` semantics)
- Lowercase prefix match (e.g., query `"Des"` matches stored `"design"`)

`commit`: `feat(02): useTagSuggestions hook for tag autocomplete`

---

### 2.05 — `TagChipInput` component

`read_first`: `02-UI-SPEC.md` §"Tag Chip Input", `components/ui/{badge,input,popover,command}.tsx`, `hooks/use-tag-suggestions.ts`

`action`:
- Create `components/people/tag-chip-input.tsx`, client component.
- Props: `{ value: string[]; onChange: (next: string[]) => void; placeholder?: string; id?: string }`.
- Layout: bordered rounded container with `focus-within:ring-2 focus-within:ring-ring`. Inside: flex-wrap row of `<Badge variant="secondary">{tag} <X className="ml-1 size-3" /></Badge>` chips + a fluid `<input>` for typing.
- Keyboard:
  - Enter, comma, or Tab → commit current input value through `normalize(input)` and add via `onChange([...value, normalized])` if non-empty and not already present.
  - Backspace on empty input → drop last chip.
- Autocomplete:
  - Wraps a controlled shadcn `Popover` open state.
  - When focused or when input has 1+ chars, popover opens anchored to the container, showing `Command` + `CommandList` of suggestions from `useTagSuggestions(query)` filtered to exclude already-selected chips.
  - Last item: `Create "{query}"` when `query.trim() !== ""` and no exact existing match.
  - Arrow keys + Enter on a highlighted item commit that tag.
- Click chip's `×` removes that chip without touching focus.
- Normalize helper: `(t) => t.trim().toLowerCase()`. Drop empties. Dedupe via `Set`.

`acceptance_criteria`:
- `"use client";` at top of file
- Exports `TagChipInput` (named or default — pick named for consistency with Phase 1 components)
- `pnpm run build` exits 0
- Component handles Enter, comma, Tab, and Backspace as specified (covered by 2.14 if time permits — manual UAT otherwise)
- All chips render lowercase regardless of input casing
- No `console.log` left behind (CLAUDE.md: no demo-only hacks)

`commit`: `feat(02): TagChipInput with autocomplete + normalization`

---

### 2.06 — `ClosenessChip` segmented control

`read_first`: `02-UI-SPEC.md` §"Closeness segmented control", `lib/db/types.ts` (`Closeness` union: `"close" | "warm" | "cooling"`)

`action`:
- Create `components/people/closeness-chip.tsx`, client component.
- Props: `{ value: Closeness; onChange: (next: Closeness) => void; ariaLabel?: string }`.
- Layout: `<div role="radiogroup">` with three `<button role="radio" aria-checked>` children, each `h-9 flex-1`, inside a `border rounded-md overflow-hidden` shell. Active button: `bg-accent text-accent-foreground`. Inactive: `text-muted-foreground hover:bg-muted/50`.
- Labels (literal per REQUIREMENTS.md PPL-09): `★ close`, `🔥 warm`, `❄ cooling`.
- Keyboard: arrow-left/right move focus and selection; Space/Enter activate.

`acceptance_criteria`:
- `"use client";` at top
- Exports `ClosenessChip`
- Renders three buttons with `role="radio"` and `aria-checked={value === optionValue}`
- Contains the exact strings `★ close`, `🔥 warm`, `❄ cooling`
- `pnpm run build` exits 0

`commit`: `feat(02): ClosenessChip segmented radiogroup`

---

### 2.07 — `PersonForm` (shared add/edit)

`read_first`: `02-UI-SPEC.md` §"Add Person Flow", `lib/db/types.ts`, `lib/db/repositories/people.ts`, `hooks/use-events.ts` (for events dropdown), `components/people/{tag-chip-input,closeness-chip}.tsx`, `components/ui/{form,input,label,textarea,select}.tsx`

`action`:
- Create `lib/validators/person.ts` exporting a zod v3 schema:
  ```ts
  export const personFormSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    role: z.string().trim().optional(),
    company: z.string().trim().optional(),
    note: z.string().trim().optional(),
    tags: z.array(z.string()).default([]),
    eventMetId: z.string().optional(),
    closeness: z.enum(["close", "warm", "cooling"]).default("warm"),
  });
  export type PersonFormValues = z.infer<typeof personFormSchema>;
  ```
- Create `components/people/person-form.tsx`, client component.
- Props: `{ mode: "create" | "edit"; defaultValues?: PersonFormValues; onSubmit: (values: PersonFormValues) => Promise<void>; onCancel?: () => void; submitLabel?: string; }`.
- Uses `useForm({ resolver: zodResolver(personFormSchema), defaultValues })` from react-hook-form.
- Fields, in tab order: Name (autoFocus when `mode === "create"`), Role, Company, Tags (`TagChipInput` controlled), Note, Where you met (`Select` reading `useEvents()`).
- "Where you met" is hidden if `useEvents()` returns `[]` AND mode is "create" (no events to pick). In edit mode, always shows the field with the current value.
- In edit mode, closeness is OMITTED from this form — closeness is edited inline via `ClosenessChip` on the detail page (D-13). The form covers name/role/company/tags/note/eventMetId.
- Submit row: `<Button type="submit" disabled={isSubmitting || !nameNonEmpty}>{submitLabel ?? "Add person"}</Button>` and an optional `<Button variant="ghost" onClick={onCancel}>Cancel</Button>`.
- The autocomplete `Popover` inside `TagChipInput` must render correctly when this form is inside a `Sheet` (Z-index / portal). If it clips, pass `modal={false}` or render the popover content via shadcn's `PopoverContent collisionPadding={8}` — adjust during 2.05 implementation and re-test here.

`acceptance_criteria`:
- `lib/validators/person.ts` exports `personFormSchema` and `PersonFormValues`
- `components/people/person-form.tsx` starts with `"use client";`
- Submitting an empty name shows the validation error text exactly `Name is required`
- `pnpm run build` exits 0
- Form fires `onSubmit` with normalized values (zod's `.trim()` is applied)

`commit`: `feat(02): PersonForm + zod validator (shared add/edit)`

---

### 2.08 — Add Person Sheet + triggers + shell wiring

`read_first`: `components/shell/{app-shell,top-bar}.tsx`, `components/ui/sheet.tsx`, `components/people/person-form.tsx`, `lib/db/repositories/people.ts`

`action`:
- Create `components/people/add-person-context.tsx`: small React context exposing `{ isOpen, open, close }`. Provider holds the `useState`. Hook `useAddPerson()` consumes it. Keep dependency-free (no Zustand for one boolean).
- Create `components/people/add-person-sheet.tsx`: client component that consumes the context, renders `<Sheet open={isOpen} onOpenChange={...}>`, places `<SheetContent side="bottom" className="sm:max-w-md sm:rounded-l-lg" sideOverride="right">` — actually use two `SheetContent` variants by passing `side="bottom" sm:side="right"` via shadcn convention OR use `side="bottom"` on mobile and `side="right"` on `sm:` by conditionally rendering — shadcn `Sheet` accepts a single `side` prop, so the cleanest approach: pass `side` dynamically based on a `useMediaQuery` hook from shadcn registry or a small inline hook. Use `useMediaQuery("(min-width: 640px)")` and set `side={isDesktop ? "right" : "bottom"}`.
- Inside `SheetContent`: `SheetHeader` with title "Add a person" and description "Capture them while it's fresh.", then `<PersonForm mode="create" submitLabel="Add person" onSubmit={handleSubmit} onCancel={close} />`.
- `handleSubmit`:
  ```ts
  await createPerson({ name, role, company, tags, notes: note, eventMetId });
  toast.success(`Added ${name}`);
  close();
  ```
  Catch errors: `toast.error("Couldn't add — try again");` and keep sheet open.
- Create `components/people/add-person-fab.tsx`: client component, renders a fixed-position `<Button size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg fixed bottom-20 right-4 md:hidden z-40 ...">` with `<Plus />` icon and `aria-label="Add a person"`. On click → `useAddPerson().open()`.
- Create `components/people/add-person-button.tsx`: client component, `<Button onClick={open} className="hidden md:inline-flex">+ Add person</Button>`.
- `components/shell/app-shell.tsx`: wrap children in `<AddPersonProvider>`. Render `<AddPersonSheet />` and `<AddPersonFab />` inside the provider, at the shell level (so both list and detail can open the sheet).
- `components/shell/top-bar.tsx`: render `<AddPersonButton />` between app title and theme toggle on desktop (`md:` visible). Provider must wrap the TopBar.

`acceptance_criteria`:
- `components/people/add-person-{context,sheet,fab,button}.tsx` all exist and start with `"use client";`
- `components/shell/app-shell.tsx` imports `AddPersonProvider`, `AddPersonSheet`, `AddPersonFab` and renders them
- `components/shell/top-bar.tsx` imports `AddPersonButton` and renders it
- `grep -r "AddPersonProvider" components/shell/` returns at least 1 match
- `pnpm run build` exits 0
- Sheet appears bottom-up on `<640px`, drawer-right on `≥640px` (manual UAT — covered in 2.15)

`commit`: `feat(02): Add Person sheet + FAB + TopBar trigger`

---

### 2.09 — `PersonCard`

`read_first`: `02-UI-SPEC.md` §"PersonCard layout", `lib/db/types.ts`, `lib/utils.ts` (`cn`), `date-fns`

`action`:
- Create `components/people/person-card.tsx`, client component (uses `next/link`).
- Props: `{ person: Person }`.
- Layout:
  ```tsx
  <Link href={`/people/${person.id}`} className="block rounded-lg border bg-card hover:bg-muted/50 p-4 transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{person.name}</p>
        <p className="text-muted-foreground text-[13px] truncate">
          {[person.role, person.company].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <ClosenessBadge value={person.closeness} />
        <span className="text-muted-foreground text-[13px]">{lastSeenLabel(person.lastContactAt)}</span>
      </div>
    </div>
    {person.tags.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {person.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="secondary">{t}</Badge>
        ))}
        {person.tags.length > 3 && <Badge variant="secondary" className="text-muted-foreground">+{person.tags.length - 3}</Badge>}
      </div>
    )}
  </Link>
  ```
- `lastSeenLabel(ms)`: `formatDistanceToNow(new Date(ms), { addSuffix: false })` returning e.g. "3 days", then prefix `"Last seen "` and shorten unit ("d", "w", "mo") OR use the long form. Pick long form for clarity ("Last seen 3 days").
- `ClosenessBadge` is a small visual-only chip (NOT interactive on the list per UI-SPEC); rendered as `<Badge variant="outline">{label}</Badge>` where label is `★ close`, `🔥 warm`, or `❄ cooling`. Inline this component or export from `closeness-chip.tsx`.

`acceptance_criteria`:
- `components/people/person-card.tsx` exists and starts with `"use client";`
- Card is wrapped in `<Link href={…}>` so the whole row is clickable
- Tags row is hidden when `tags.length === 0`
- `pnpm run build` exits 0

`commit`: `feat(02): PersonCard list row`

---

### 2.10 — `/people` list page

`read_first`: `app/people/page.tsx` (placeholder), `hooks/use-people.ts`, `components/people/person-card.tsx`, `components/ui/skeleton.tsx`, `02-UI-SPEC.md` §"People List"

`action`:
- Rewrite `app/people/page.tsx`:
  ```tsx
  "use client";
  // imports...
  export default function PeoplePage() {
    const people = usePeople();
    return (
      <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <h1 className="text-2xl font-semibold">People</h1>
        <div className="mt-6">
          {people === undefined ? <PeopleListSkeleton /> :
           people.length === 0 ? <PeopleEmptyState /> :
           <ul className="space-y-2">{people.map(p => <li key={p.id}><PersonCard person={p} /></li>)}</ul>}
        </div>
      </main>
    );
  }
  ```
- Create `components/people/people-empty-state.tsx`:
  ```tsx
  "use client";
  // ...
  export function PeopleEmptyState() {
    const { open } = useAddPerson();
    return (
      <div className="rounded-lg border p-8 text-center">
        <h2 className="text-xl font-semibold">No people yet</h2>
        <p className="mt-1 text-muted-foreground">Add the first person you've met.</p>
        <Button className="mt-4" onClick={open}>+ Add person</Button>
      </div>
    );
  }
  ```
- Create `PeopleListSkeleton` inline in `app/people/page.tsx` or in a small `components/people/people-list-skeleton.tsx`. Renders 6 `<Skeleton className="h-[72px] w-full rounded-lg" />` rows in a `space-y-2` stack.

`acceptance_criteria`:
- `app/people/page.tsx` starts with `"use client";`
- Page renders three states: `undefined → skeleton`, `[] → empty`, `else → cards`
- Empty-state button calls `useAddPerson().open()`
- `grep "No people yet" app/people/page.tsx components/people/people-empty-state.tsx` matches
- `pnpm run build` exits 0

`commit`: `feat(02): People list page (skeleton + empty + cards)`

---

### 2.11 — `DeletePersonDialog`

`read_first`: `02-UI-SPEC.md` §"Delete UX", `components/ui/alert-dialog.tsx`, `lib/db/repositories/people.ts`

`action`:
- Create `components/people/delete-person-dialog.tsx`, client component.
- Props: `{ person: Person; open: boolean; onOpenChange: (open: boolean) => void; onDeleted: () => void }`.
- Renders shadcn `AlertDialog` with title `Delete {person.name}?`, description `This removes them and any touchpoints linked to them. This can't be undone.`, Cancel (default variant), and Delete (destructive variant).
- On Delete: call `await deletePerson(person.id);` then `toast.success(\`Deleted ${person.name}\`);` then `onDeleted();` (parent will route).

`acceptance_criteria`:
- File starts with `"use client";`
- Renders `AlertDialogContent` with the literal description string
- Delete button uses `variant="destructive"`
- `pnpm run build` exits 0

`commit`: `feat(02): DeletePersonDialog with cascade-aware confirmation`

---

### 2.12 — `PersonDetail`

`read_first`: `02-UI-SPEC.md` §"Person Detail", `hooks/use-people.ts`, `hooks/use-events.ts`, `lib/db/repositories/people.ts`, `components/people/{person-form,closeness-chip,delete-person-dialog,tag-chip-input}.tsx`, `components/ui/{dropdown-menu,button}.tsx`

`action`:
- Create `components/people/person-detail.tsx`, client component.
- Props: `{ person: Person }`.
- Local state: `const [editing, setEditing] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false);`
- Layout (view mode):
  - Header row: `<Link href="/people" className="text-sm text-muted-foreground">← People</Link>` on left; on right a flex row of `<Button onClick={() => setEditing(true)}>Edit</Button>` and a `<DropdownMenu>` triggered by `<Button variant="ghost" size="icon" aria-label="Person actions"><MoreVertical/></Button>` with one `DropdownMenuItem` `Delete person` (destructive class) that opens the delete dialog.
  - Name + role/company stacked under header.
  - `<ClosenessChip value={person.closeness} onChange={(c) => updatePerson(person.id, { closeness: c }).then(() => toast.success("Saved"))} ariaLabel="Closeness" />` — always interactive.
  - `Last seen {formatDistanceToNow(new Date(person.lastContactAt), { addSuffix: true })}` (e.g. `Last seen 3 days ago`).
  - When `person.eventMetId`, render `<EventMetChip eventMetId={person.eventMetId} />` — a small subcomponent that calls `useEvent(person.eventMetId)` and renders `<Link href={\`/events/${id}\`}><Badge variant="outline">Met at {event.name} ↗</Badge></Link>`. Hidden if the event has been deleted (`useEvent` returns null).
  - Tags row: `<Badge>` per tag if tags non-empty (in view mode); hidden otherwise.
  - Notes: paragraph; muted italic "No notes yet." if empty.
- Layout (edit mode):
  - Replaces the view body with `<PersonForm mode="edit" defaultValues={{name, role, company, note: notes, tags, eventMetId}} submitLabel="Save" onCancel={() => setEditing(false)} onSubmit={async (v) => { await updatePerson(person.id, { name: v.name, role: v.role, company: v.company, notes: v.note, tags: v.tags, eventMetId: v.eventMetId }); toast.success("Saved"); setEditing(false); }} />`.
  - Closeness chip remains visible above the form so the user can still toggle it.
- `<DeletePersonDialog person={person} open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={() => router.push("/people")} />`.

`acceptance_criteria`:
- File starts with `"use client";`
- Toggles between view and edit modes via local state
- ClosenessChip always renders (NOT inside the form)
- DropdownMenu with `Delete person` item exists
- `pnpm run build` exits 0

`commit`: `feat(02): PersonDetail view + edit + delete`

---

### 2.13 — `/people/[id]` detail page

`read_first`: `app/people/[id]/page.tsx` (placeholder), `app/people/[id]/layout.tsx` (must stay server with `generateStaticParams: () => []`), `hooks/use-people.ts`, `components/people/person-detail.tsx`

`action`:
- Rewrite `app/people/[id]/page.tsx`:
  ```tsx
  "use client";
  // imports...
  export default function PersonDetailPage() {
    const { id } = useParams<{ id: string }>();
    const person = usePerson(id);
    return (
      <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {person === undefined && <PersonDetailSkeleton />}
        {person === null && <NotFound id={id} />}
        {person && <PersonDetail person={person} />}
      </main>
    );
  }
  ```
- `NotFound` subcomponent (inline or in a separate file) shows the copy: `This person doesn't exist or was removed.` and a `← Back to people` Link.
- DO NOT touch `app/people/[id]/layout.tsx` (Phase 1's static-export shim).

`acceptance_criteria`:
- `app/people/[id]/page.tsx` starts with `"use client";`
- Imports `useParams` from `next/navigation` (NOT from `next/router`)
- Three-state render: `undefined → skeleton`, `null → not found`, `else → detail`
- `app/people/[id]/layout.tsx` UNCHANGED — `grep "generateStaticParams" app/people/[id]/layout.tsx` still matches
- `pnpm run build` exits 0 — the `/people/[id]` placeholder shell still emits under static export

`commit`: `feat(02): /people/[id] detail page with three-state render`

---

### 2.14 — Tests

`read_first`: `test/setup.ts`, `test/db/schema.test.ts` (Phase 1 pattern), `lib/db/repositories/people.ts`, `hooks/use-tag-suggestions.ts`

`action`:
- Create `test/db/people.test.ts` (Vitest, node env, `fake-indexeddb/auto` via `test/setup.ts`):
  - Test 1: `createPerson` normalizes tags (`["Design", " NYC ", "design"]` → stored as `["design", "nyc"]` deduped? Actually the repo currently does `.trim().toLowerCase().filter(Boolean)` but does NOT dedupe. Decide: the test asserts current behavior. If we WANT dedup, add it to `createPerson` first in this commit. Plan choice: ADD dedup to `createPerson` and `updatePerson` (a `Array.from(new Set(...))` after normalize) — it's a single-line addition matching CLAUDE.md "tags collapse into one canonical tag".
  - Test 2: `createPerson` sets `createdAt === lastContactAt`, both are recent timestamps, ID is a 26-char ULID string.
  - Test 3: `deletePerson` removes touches that reference the person (insert a touch with `personId`, then delete person, assert `db.touches.count() === 0`).
  - Test 4: `updatePerson` re-normalizes tags on patch.
- Create `test/hooks/use-tag-suggestions.test.ts`:
  - Hooks tests need React + `@testing-library/react` + `jsdom`. Phase 1 only configured node env. **Decision:** for Phase 2, keep tests at the repository layer where possible. Move the `useTagSuggestions` test to a **non-hook unit test** that exercises the underlying query logic, OR introduce jsdom. **Pick the leaner path:** rename to `test/lib/tag-suggestions.test.ts` and test the filter function (extract `filterTagSuggestions(allTags, query, limit)` from the hook into `lib/tags.ts`; the hook becomes a thin wrapper around it). Unit-test `filterTagSuggestions`. Cheap, fast, no jsdom needed.
- Update `test/db/people.test.ts` accordingly.

`acceptance_criteria`:
- `test/db/people.test.ts` exists with at least 4 tests
- `test/lib/tag-suggestions.test.ts` exists with at least 3 cases (prefix match, lowercase, dedupe/limit)
- `lib/tags.ts` exists exporting `filterTagSuggestions(allTags: string[], query: string, limit?: number): string[]`
- `hooks/use-tag-suggestions.ts` consumes `filterTagSuggestions`
- `lib/db/repositories/people.ts` dedupes tags via `Array.from(new Set(...))`
- `pnpm test` exits 0 with at least 11 passing tests (4 Phase 1 schema + 4 Phase 2 repo + 3 tag filter)

`commit`: `test(02): tag normalization, createPerson, cascade delete, tag-suggestions filter`

---

### 2.15 — Verification (UAT)

`read_first`: All Phase 2 success criteria in ROADMAP.md, all 9 PPL requirements in REQUIREMENTS.md

`action`:
Run the following checks. Each one maps to a Phase 2 success criterion or PPL requirement:

1. **PPL-01, PPL-02 (30s capture):** `pnpm dev`, open `/people`. Tap FAB on mobile viewport (≤375px). Fill `name=Sara Kim, role=Designer, tags=design,nyc, note=Loves typography`. Submit. Toast appears; sheet closes; card shows up at top. Stopwatch from FAB tap to toast must be < 30s for a competent typist. **Pass if green; record actual time.**
2. **PPL-04 (list):** With 3+ people added, verify list is sorted by recent activity (most-recently-touched at top — Phase 1's `usePeople` already does this). Each card shows name, role · company, closeness chip, "Last seen N…", up to 3 tags + overflow. Pass if all four card elements visible.
3. **PPL-05, PPL-06 (detail + edit):** Click a person → detail page. All fields visible. Click Edit → fields become inputs. Change role, save → toast "Saved", view mode shows new role.
4. **PPL-07 (delete + cascade):** From detail, overflow menu → Delete person → AlertDialog confirm. Click Delete → toast "Deleted {name}", routed to `/people`, deleted person no longer present. (Touch cascade is covered by 2.14 test 3.)
5. **PPL-08 (tag normalization + autocomplete):** Add a person with tag `Design`. Add another with tag `design`. Verify both render as `design` on their cards. Type `de` in the second person's tag input — autocomplete shows `design`. Tap it → chip commits.
6. **PPL-09 (closeness):** On detail page, tap each of the three closeness chips. Each tap is instant — no save button. Live-query rebroadcasts; chip visual updates immediately. Refresh page → state persisted.
7. **POL-04 / responsive (inherited):** Resize browser between 320px and 1440px. FAB visible <md; TopBar Add button visible ≥md. No horizontal scroll. Sheet slides up bottom <sm, slides right ≥sm.
8. **Build green:** `pnpm run build` exits 0. `pnpm test` exits 0 with all tests passing.
9. **No regressions:** `/`, `/events`, `/events/[id]` placeholders still render (Phase 1 shell intact). Theme toggle still works in both modes. No console errors in dev or build.

Document the run in a Phase 2 VERIFICATION.md (the verification skill writes this; or write inline in plan completion summary). Mark each check pass/fail with notes.

`acceptance_criteria`:
- `pnpm run build` exits 0
- `pnpm test` exits 0
- All 9 UAT items have a pass marker
- A `VERIFICATION.md` exists in `.planning/phases/02-people/` with the results

`commit`: `docs(02): verification report` (only if VERIFICATION.md is committed by this step; otherwise commit happens via the verify skill)

---

## Wave / dependency model

All plans are sequential, no parallel waves:

- 2.01 → 2.02 (deps before components)
- 2.02 → 2.03..2.06 (primitives + Toaster before features)
- 2.04 → 2.05 (hook before component that consumes it)
- 2.05, 2.06 → 2.07 (form depends on TagChipInput + ClosenessChip via shared parent — actually ClosenessChip is NOT in form per D-13, but consistency: 2.07 only depends on 2.05 + the validator)
- 2.07 → 2.08 (sheet uses form)
- 2.07, 2.09 → 2.10 (list uses cards; empty state uses AddPerson context which is set up by 2.08 — so 2.10 also depends on 2.08)
- 2.11, 2.12 require 2.06, 2.07, and 2.09's `ClosenessBadge` export
- 2.13 → 2.12
- 2.14 can run after 2.04 (filter test), 2.13 (final integration)
- 2.15 last

## Verification (UAT criteria, summary)

(See plan 2.15 for the full list — each item directly maps to one of the 5 ROADMAP.md Phase 2 success criteria or one of the 9 PPL requirements.)

## must_haves (for goal-backward verification)

- Floating "+" reachable from every screen (mobile FAB and/or desktop TopBar button) — PPL-01
- Name-only required Add flow that closes under 30s — PPL-01, PPL-02
- People list sorted by recent activity with closeness chip on each card — PPL-04, PPL-09
- Detail page with all stored fields + tag display + where-we-met link — PPL-05
- Edit toggle that lets every field be modified — PPL-06
- Delete with confirm dialog and cascade-cleanup of touchpoints — PPL-07
- Tags normalized to trim+lowercase and deduped on save — PPL-08
- Autocomplete suggesting existing tags as the user types — PPL-08
- Closeness chip editable inline from the detail page (not gated by Edit mode) — PPL-09
- `pnpm run build` green; `pnpm test` green — no regressions to Phase 1 shell

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Tag autocomplete `Popover` clips inside `Sheet` (z-index / portal) | shadcn `Popover` uses portal by default — should be fine. If it clips, render via `PopoverContent` with `collisionPadding` and verify z-index. Covered in plan 2.07. |
| FAB overlaps BottomNav on iOS Safari with home indicator | FAB uses `bottom-20` (80px) which clears `BottomNav h-16` + safe-area. Verify on iPhone-mode dev tools. |
| Sheet bottom variant doesn't slide-up on mobile | shadcn `Sheet` `side="bottom"` handles this. Falling back: use `<Drawer>` from vaul if shadcn primitive misbehaves — but try shadcn first. |
| `useEvents()` is empty in Phase 2 (no events exist yet) | Where-we-met dropdown shows "No events yet" placeholder. Field is functional but typically unused until Phase 3. Smart auto-default lands in Phase 3 (EVT-07). |
| `next/dynamic` not needed (no SSR-only deps) | Confirm — `next-themes`, `react-hook-form`, `dexie-react-hooks` all client-safe under the `"use client"` boundary. |
| Hot reload breaks Dexie connection mid-add | Phase 1 already shipped the `globalThis` singleton; no change needed here. |
| Tag chip Enter swallows form Submit | `TagChipInput` intercepts Enter only when its `<input>` is focused with non-empty value; submit Enter from any other field still works. Manual UAT verifies. |
| Bottom Sheet keyboard appearance on mobile pushes form below FAB | FAB hides while Sheet is open OR FAB has `data-state-aware` visibility (`pointer-events-none opacity-0 when sheet open`). Simpler: hide FAB whenever `useAddPerson().isOpen` is true. |

## Deferred (out of Phase 2)

- Closeness/tag filter chips on list — Phase 4 (SRC-03)
- Global search input — Phase 4 (SRC-01)
- Smart event-met default — Phase 3 (EVT-07)
- Touchpoint UI / follow-up editor — v2 (TCH-01..06)
- Per-route `loading.tsx` skeletons — Phase 4 polish (POL-01)
- Comprehensive component tests (only repo/util smoke in Phase 2) — Phase 4 polish
- Bulk multi-select operations — v2 (PRD-04)
- Master-detail layout — v2 (PRD-02)
