# Networking App

A local-first personal networking / mini-CRM for working professionals — track the people you meet, the events where you met them, the notes that matter, and the follow-ups you keep forgetting.

> **Core value:** adding a new person right after a meetup takes under 30 seconds and feels effortless.

This repo is the demo project for a 2-hour hands-on workshop teaching the **GSD** (spec-driven AI development) framework with **Claude Code**. The codebase is intentionally readable, conventional, and forkable — every commit, every file is something a workshop attendee should be able to extend.

---

## Features (v1)

- **People** — create / view / edit / delete with closeness (★ close / 🔥 warm / ❄ cooling), tags, role, notes, where-we-met
- **Events** — Upcoming + Past, attendees picker, "Add another person" rhythmic loop, smart event-met default
- **Search** — global search across people by name (prefix-boosted), tag, role, notes — debounced, filter by closeness + tag
- **Local-first** — all data in IndexedDB (Dexie). No accounts, no backend, no API keys.
- **JSON export / import** — round-trip backup via header menu
- **Seed data** — 8 plausible people + 4 events on first run (opt-in)
- **Responsive** — mobile bottom-nav + FAB; desktop sidebar + persistent search
- **Dark mode** — no FOUC, system-aware
- **Static export** — deploys to GitHub Pages, Vercel, or any static host

## Stack

- **Next.js 16** (App Router, Turbopack, `output: "export"`)
- **TypeScript 5** + **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (`new-york` preset)
- **Dexie 4** + `dexie-react-hooks` for IndexedDB live queries
- **react-hook-form 7** + **zod 3** for forms
- **`dexie-export-import`** for JSON round-trip
- **`date-fns`** for date formatting
- **`next-themes`** for no-FOUC dark mode
- **Vitest 3** + `fake-indexeddb` for unit tests; **Playwright 1** (optional) for a smoke E2E
- **`lucide-react`** + ULID + sonner for icons, ids, and toasts

No backend. No environment variables. No API keys. The whole app runs in the user's browser.

## Run locally

```bash
pnpm install
pnpm dev
```

`npm install && npm run dev` works too — `packageManager` pins pnpm, but every command is npm-compatible.

Open <http://localhost:3000>.

## Build

```bash
pnpm run build
```

Produces a fully static site under `out/`. Serve any way you like:

```bash
npx serve out
```

## Test

```bash
pnpm test          # one shot
pnpm test:watch    # watch mode
```

Tests live in `test/`:
- `test/db/schema.test.ts` — Dexie v1 schema smoke
- `test/db/people.test.ts`, `test/db/events.test.ts` — repository tests
- `test/lib/tags.test.ts`, `test/lib/search.test.ts` — pure-function tests

### Smoke E2E (optional)

```bash
pnpm exec playwright install   # first time only
pnpm e2e
```

One Playwright test in `e2e/smoke.spec.ts` covers Add Person → list update. Not wired to CI.

## Deploy

### GitHub Pages (automatic)

`.github/workflows/deploy.yml` builds with `GITHUB_PAGES=true` and uploads `out/` via `actions/deploy-pages@v4` on every push to `main`. In repo settings: **Settings → Pages → Source: GitHub Actions**. The next push deploys to `https://<owner>.github.io/<repo>/`.

If your repo name isn't `workshop-networking-app`, edit `repo` in `next.config.ts`.

### Vercel (one-click)

Connect the repo in Vercel — no env vars, no config. Vercel builds without `GITHUB_PAGES`, so `basePath` / `assetPrefix` stay empty and the app serves from `/`.

### Local production preview

```bash
pnpm run build && npx serve out
```

## Workshop branch arc

This repo doubles as a workshop artifact. Each branch is a snapshot at a specific lesson stage:

- `00-empty` — empty starter, no `.planning/`
- `01-planning` — `.planning/` artifacts (PROJECT, REQUIREMENTS, ROADMAP) only
- `02-discussion` — Phase 1 CONTEXT, UI-SPEC, PLAN added
- `03-milestone` — full v1 shipped

The `gsd/v1.0-milestone` branch contains the active development of v1.

## Project layout

```
app/                          Next.js routes (all client components when data-touching)
  layout.tsx                  Server layout: fonts, ThemeProvider, AppShell, Toaster
  page.tsx                    Home (seed prompt / counts)
  people/{page,[id]}.tsx      People list + detail
  events/{page,[id]}.tsx      Events list + detail
components/
  shell/                      AppShell, Sidebar, BottomNav, TopBar, HeaderMenu, RouteAware*
  people/                     PersonCard, PersonForm, AddPersonSheet, ClosenessChip, TagChipInput, ...
  events/                     EventCard, EventForm, AddEventSheet, StatusChip, AttendeesPicker, ...
  search/                     SearchInput + Popover + Filters + ResultRow
  home/                       SeedPromptCard, HomeCounts
  io/                         ImportConfirmDialog
  ui/                         shadcn primitives
  theme-provider.tsx          next-themes wrapper
hooks/                        useLiveQuery wrappers, useDebouncedValue, useFirstRunState, ...
lib/
  db/                         Dexie schema (v1 locked), singleton, repositories per entity
  io/                         export/import wrapping dexie-export-import
  seed/                       seed dataset + idempotent loader
  validators/                 zod schemas for forms
  tags.ts, search.ts          pure functions, easy to unit test
  id.ts                       ULID wrapper
  utils.ts                    cn() helper
test/                         Vitest setup + tests
e2e/                          Playwright smoke (optional)
.planning/                    GSD workflow artifacts (PROJECT, REQUIREMENTS, ROADMAP, phases/)
```

## Fork & extend

The codebase is structured so you can add a new entity in roughly the time it takes to read this README:

1. **Schema** — add a store to `lib/db/db.ts`'s `version(1)` (NEVER edit an existing version — append a new version with `.upgrade()`)
2. **Types** — add the entity interface in `lib/db/types.ts`
3. **Repository** — add `lib/db/repositories/<entity>.ts` with `create*`, `update*`, `delete*` functions; normalize input here
4. **Live-query hooks** — add `hooks/use-<entity>.ts` returning `Entity[] | undefined` (three-state render)
5. **Form validator** — add `lib/validators/<entity>.ts` with a zod schema
6. **UI components** — mirror an existing entity folder: `EntityCard`, `EntityForm`, `AddEntitySheet`, `AddEntityProvider`, `AddEntityFab`, `AddEntityButton`, `EntityDetail`, `DeleteEntityDialog`
7. **Routes** — `app/<entity>/page.tsx` (list) and `app/<entity>/[id]/page.tsx` (detail), with a sibling `[id]/layout.tsx` exporting `generateStaticParams: () => [{ id: "_" }]` for static export
8. **Shell wiring** — extend `RouteAwareFab` / `RouteAwareAddButton` to your route
9. **Test** — add `test/db/<entity>.test.ts` for the repo

`CLAUDE.md` lists the conventions one level deeper — read it before extending.

## GSD framework

This project is built with [GSD](https://github.com/aymanrh/get-shit-done) — a spec-driven workflow for AI-assisted development using Claude Code. Each phase has:

- **CONTEXT.md** — captured decisions (smart-discuss output)
- **UI-SPEC.md** — design contract (colors, copy, interactions)
- **PLAN.md** — atomic sub-plans with acceptance criteria
- **SUMMARY.md** — what shipped
- **VERIFICATION.md** — automated + human UAT

Browse `.planning/phases/` to see how each phase of this app was conceived, planned, executed, and verified.

## License

MIT.
