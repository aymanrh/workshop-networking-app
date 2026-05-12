# Networking App

A local-first personal networking / mini-CRM web app for working professionals — track the people you meet, the events where you met them, the notes that matter.

Built as the demo project for a hands-on workshop teaching the GSD (spec-driven AI development) framework with Claude Code.

> **Core value:** Adding a new person right after a meetup takes under 30 seconds and feels effortless.

## Status

Phase 1 (Foundation & Static-Export Spine) — shell, Dexie schema v1, dynamic `[id]` route proven, GitHub Pages deploy wired. People / Events / Search ship in later phases.

## Stack

- **Next.js 16** App Router + Turbopack (static export)
- **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui** (`new-york` preset)
- **Dexie 4** + `dexie-react-hooks` for IndexedDB persistence
- **next-themes** for no-FOUC dark mode
- **Vitest 3** + `fake-indexeddb` for unit tests

No backend. No environment variables. No API keys. All data lives in the user's browser via IndexedDB.

## Run locally

```bash
pnpm install
pnpm dev
```

`npm install && npm run dev` also works — `packageManager` pins pnpm but everything is npm-compatible.

Open <http://localhost:3000>.

## Build

```bash
pnpm run build
```

Outputs a fully static site to `out/`. Serve any way you like (`npx serve out`, GitHub Pages, Vercel, S3 static hosting, etc.).

## Test

```bash
pnpm test          # one shot
pnpm test:watch    # watch mode
```

Phase 1 ships one smoke test (`test/db/schema.test.ts`) that opens the Dexie schema under `fake-indexeddb`, inserts + queries each store, and verifies the multi-entry index works. More tests land alongside features in later phases.

## Deploy

### GitHub Pages

`.github/workflows/deploy.yml` builds the static export with `GITHUB_PAGES=true` and uploads `out/` via `actions/deploy-pages@v4` on every push to `main`. Configure Pages source to "GitHub Actions" in repo settings; the next push deploys to `https://<owner>.github.io/<repo>/`.

If your repo name is not `ws`, edit `repo` in `next.config.ts`.

### Vercel

Connect the repo in Vercel — no env vars, no config. Vercel builds without `GITHUB_PAGES`, so `basePath`/`assetPrefix` stay empty and the app serves from the root.

### Local

`pnpm run build && npx serve out` for a production-style preview.

## Workshop branch arc

This repo doubles as the workshop demo. Branches:

- `00-empty` — empty starter, no `.planning/`
- `01-planning` — `.planning/` artifacts (PROJECT, REQUIREMENTS, ROADMAP) only
- `02-discussion` — Phase 1 CONTEXT, UI-SPEC, PLAN added
- `03-milestone` — full v1 shipped

Workshop reference: <https://aymanrh.github.io/workshop-starter-kit-30-05-25/>

## Project layout

```
app/                       Next.js App Router routes
  layout.tsx               Server layout, fonts, ThemeProvider, AppShell
  page.tsx                 Home
  people/{page,[id]/...}   People list + detail
  events/{page,[id]/...}   Events list + detail
components/
  shell/                   AppShell, Sidebar, BottomNav, TopBar, ThemeToggle
  ui/                      shadcn primitives (button, dropdown-menu, separator, skeleton)
  theme-provider.tsx       next-themes wrapper
hooks/                     useLiveQuery wrappers for each table
lib/
  db/                      Dexie schema, singleton, repositories
  id.ts                    ULID wrapper
  utils.ts                 cn() helper
test/
  setup.ts                 fake-indexeddb registration
  db/schema.test.ts        Phase 1 smoke
.planning/                 GSD workflow artifacts (PROJECT, REQUIREMENTS, ROADMAP, phases/)
```

## License

MIT.
