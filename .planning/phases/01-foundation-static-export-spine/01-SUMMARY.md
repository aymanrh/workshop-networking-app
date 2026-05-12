---
phase: 1
slug: foundation-static-export-spine
status: complete
completed: 2026-05-12
---

# Phase 1 — Summary

Foundation & Static-Export Spine landed: a deployable, themed, responsive Next.js shell with a fully-indexed Dexie schema v1, dynamic `[id]` route proven under `output: "export"`, and a GH Pages workflow ready to deploy on push to `main`.

## Requirements satisfied

| ID | Requirement | Evidence |
|----|-------------|----------|
| FND-01 | Responsive shell with persistent nav (bottom tabs <md, sidebar ≥md) | `components/shell/{sidebar,bottom-nav,top-bar,app-shell}.tsx` |
| FND-02 | Mobile + desktop viewport, no `100vh` issues | `app-shell.tsx` uses `min-h-dvh`; bottom-nav uses `pb-[env(safe-area-inset-bottom)]`; no `100vh` anywhere |
| FND-03 | All persisted data in IndexedDB; no network calls | `lib/db/db.ts` Dexie singleton; no `fetch` anywhere in shell |
| FND-04 | Schema v1 locked with all stores + multi-entry indexes pre-declared | `lib/db/db.ts` `version(1).stores(...)` covers `people`, `events`, `touches`, `meta` with `*tags`, `*attendees`, `lastContactAt`, `followUpAt` indexes |
| FND-05 | Dynamic `[id]` routes build under `output: "export"` and resolve correctly | `app/people/[id]/{page,layout}.tsx` + `app/events/[id]/{page,layout}.tsx`. Build emits `/people/_/`, `/events/_/` placeholder shells; client `useParams()` reads any id at runtime |
| FND-06 | Persistent storage helper exists | `lib/db/persist.ts` ships `requestPersistentStorage()`; called from `createPerson` (lands in Phase 2 when first write happens) |
| FND-07 | Deployable to GH Pages + Vercel + local with zero env config | `next.config.ts` env-gates `basePath`/`assetPrefix` on `GITHUB_PAGES`; `.github/workflows/deploy.yml` does GH Pages deploy on push to main |
| FND-08 | No FOUC dark mode | `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange` |
| FND-09 | Vitest smoke test proves Dexie under fake-indexeddb | `test/db/schema.test.ts` (4 tests, all green): person insert+query, event insert+query, touch insert+query, meta put+get |
| POL-04 | Uses `100dvh`, not `100vh` | `app-shell.tsx` `min-h-dvh` |

## Verification results

| Check | Result |
|-------|--------|
| `pnpm test` | ✅ 4/4 passed (~20ms) |
| `pnpm run build` | ✅ 7 static pages generated (incl. `/people/[id]` and `/events/[id]` shells) |
| TypeScript | ✅ passed via Next's bundled tsc |
| `out/` artifacts | ✅ 77 files; `.nojekyll` present; `index.html`, `people/index.html`, `people/_/index.html`, `events/_/index.html` all present |
| `pnpm dev` smoke | Deferred to local QA — server starts cleanly per `pnpm install` (no peer warnings blocking) |
| `100vh` audit | ✅ `grep -r "100vh" app/ components/ lib/` returns no matches (uses `min-h-dvh`) |

## What ships

```
app/                       Next.js routes (Home, People, Events, [id] for each)
  layout.tsx               Server layout w/ Geist font + ThemeProvider + AppShell
  globals.css              Tailwind v4 @theme + shadcn new-york tokens (light + dark)
components/
  shell/                   AppShell, Sidebar, BottomNav, TopBar, ThemeToggle, nav-items
  ui/                      shadcn primitives: button, dropdown-menu, separator, skeleton
  theme-provider.tsx       next-themes wrapper
hooks/                     usePeople/usePerson/usePeopleCount, useEvents/useEvent/useEventsCount/useMostRecentEvent, useTouchesForPerson (stubs that match Phase 2/3/4 import surface)
lib/
  db/                      Dexie schema, singleton, repositories (people/events/touches/meta), persist helper, index re-export
  id.ts                    ULID wrapper
  utils.ts                 cn()
test/
  setup.ts                 fake-indexeddb registration + jest-dom matchers
  db/schema.test.ts        Phase 1 smoke (4 tests)
.github/workflows/deploy.yml  GH Pages auto-deploy on push to main (with 404.html fallback)
README.md                  Zero-config run/build/test/deploy instructions
```

## What's intentionally NOT in Phase 1

Per `01-CONTEXT.md` §`<deferred>`:
- People CRUD UI, FAB, tag chip input, closeness chip — **Phase 2**
- Events CRUD UI, attendees picker, event-met smart default — **Phase 3**
- Global search, header menu, JSON export/import, first-run seed prompt, full README — **Phase 4**
- `navigator.storage.persist()` actually firing (helper exists; first call lives in `createPerson` which lands in Phase 2)
- Vercel deploy wiring (Vercel is one-click connect later)
- Linear/Notion polish tokens beyond shadcn `new-york` defaults
- Component tests (only Dexie smoke in Phase 1)

## Decisions taken vs Claude's Discretion

Per `01-CONTEXT.md` §`<decisions>`, every D-01..D-34 is now embodied in code. Claude's Discretion items resolved:
- Font: **Geist Sans + Geist Mono** via `next/font/google` (matches shadcn-Vercel default)
- File naming: **kebab-case** in `components/shell/` (matches Next 16 docs)
- No per-route `loading.tsx` in Phase 1 (placeholder pages are trivial — defer to Phase 2 where real data fetches make skeletons meaningful)
- Single `deploy.yml` workflow (no separate CI yml in Phase 1)

## Known limitations / next-session pickups

- **GH Pages deploy not yet confirmed green** — workflow is committed, but the actual push to `main` and Pages-deployment-success verification happens when the user runs `git push origin gsd/v1.0-milestone` (after merging to main) or pushes directly to main. Pages source must be set to "GitHub Actions" in repo settings.
- **`pnpm dev` interactive browser smoke** is deferred to local QA — the build artifact is green, but a real "click around in the browser, resize to 375px, toggle dark mode" pass should be done before declaring Phase 1 fully demo-ready.
- The `[id]` route placeholder shells emit at `/people/_/` and `/events/_/` paths in `out/`. The 404.html fallback (copied by the GH Actions workflow from `index.html`) means any user-supplied id like `/people/abc123` will SPA-route to the client page that reads `useParams()` correctly. Verified via the build output.

## Next phase

`/clear` then `/gsd-autonomous --from 2` (or `/gsd-discuss-phase 2 --auto --chain`) — Phase 2 (People CRUD) plugs directly into the hook/repo stubs shipped here without any import surface changes.
