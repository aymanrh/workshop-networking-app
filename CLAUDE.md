<!-- GSD:project-start source:PROJECT.md -->
## Project

**Networking App** — a local-first personal networking / mini-CRM web app for working professionals. Track the people you meet, the events where you met them, the notes that matter, and the follow-ups you keep forgetting.

This is also the demo project for a 2-hour hands-on workshop teaching the GSD (spec-driven AI development) framework with Claude Code. The codebase serves three audiences at once: pre-built reference, live-built artifact during the session, and forkable starter for attendees to extend.

**Core value:** Adding a new person right after a meetup takes under 30 seconds and feels effortless — capture is so frictionless that you actually do it.

**Workshop date:** 2026-05-30. Reference: https://aymanrh.github.io/workshop-starter-kit-30-05-25/

**Three audiences (constraint):** Every commit, every file, every abstraction will be read by workshop attendees forking the repo. No clever-but-opaque code, no demo-only shortcuts that don't generalize.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack default) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) + shadcn/ui (`new-york` style)
- **Persistence:** Dexie 4.4 (IndexedDB wrapper) + `dexie-react-hooks` for live queries — **client-only**
- **Forms:** react-hook-form 7 + **zod v3 pinned** (NOT v4 — resolver compatibility issue) + `@hookform/resolvers` 5
- **Icons:** lucide-react
- **Theming:** `next-themes` for no-FOUC dark mode
- **State:** `useLiveQuery` against Dexie for reads + functional repository fns for writes. Zustand only for cross-screen UI state if needed. No Redux.
- **Dates:** date-fns 4.x
- **Animation:** `motion` package with `LazyMotion` + `m` (4.6KB vs 34KB full framer-motion)
- **Testing:** Vitest 3 + React Testing Library + fake-indexeddb (`/auto`) for unit; Playwright 1.50 for 1-2 smoke E2Es only
- **Backup:** `dexie-export-import` for JSON round-trip
- **Lint/format:** ESLint flat config + Prettier
- **Package manager:** pnpm primary, **npm fallback documented** (workshop forkers may only have npm)
- **Deploy:** `output: "export"` static export → GitHub Pages, Vercel, or local — **no env vars or API keys**

**Out of stack (deliberate):** PWA (`next-pwa` is webpack-only, conflicts with Next 16 Turbopack — Serwist deferred to v2). Server components for any data-touching page. Auth, backends, OAuth, external APIs.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- **Client/server boundary:** `app/layout.tsx` stays server (shell, fonts, theme). Every page that touches Dexie is `"use client"`.
- **Three-state render:** `useLiveQuery()` returning `undefined` → skeleton, `[]` → empty state, else → data. Treat undefined and empty as distinct project-wide.
- **Reads vs writes:** Reads via `useLiveQuery` hooks (`usePeople`, `usePerson(id)`). Writes via functional repositories (`createPerson`, `updatePerson`, `deletePerson` — cascade where needed).
- **IDs:** ULIDs, not auto-increment.
- **Tags:** Always `.trim().toLowerCase()` on save. Autocomplete from existing tags. No tag management screen in v1.
- **Schema migrations:** Dexie schema v1 is locked at first run with all eventual fields pre-declared (`attendees: string[]`, `*tags`, `lastContactAt`, `followUpAt` multi-entry indexes). Subsequent versions additive-only. Never edit `version(1).stores()` after first run.
- **Static export gotchas:** Dynamic `[id]` pages use `generateStaticParams` returning `[]` + client-side `useParams()` for ID lookup. Set `trailingSlash: true`, `images.unoptimized: true`, `basePath`/`assetPrefix` for GH Pages, ship `.nojekyll`.
- **Persistence:** Call `navigator.storage.persist()` after first successful write to defend against Safari ITP eviction.
- **Viewport:** Use `100dvh`, not `100vh`. Honor safe-area insets.
- **No demo-only hacks:** Every `// FIXME — demo only`, commented-out guard, or debug `console.log` is a teaching liability. Treat the codebase as the workshop artifact.
- **Closeness:** Manual 3-tier enum (`close` / `warm` / `cooling`) — **no auto-decay** in v1. Display "last seen N days ago" as a separate factual indicator.
- **Follow-ups:** Fixed-date only in v1. No recurring cadences.
- **`event-met` default:** When creating a person, pre-fill the most-recently-created event as where-we-met (highest-leverage UX decision).
- **Comments:** Default to no comments. Add only when the *why* is non-obvious (a constraint, an invariant, a workaround). Don't explain *what*.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Client-only SPA. Next.js is a build-time bundler and router; all runtime data lives in IndexedDB on the user's device. No SSR for data, no API routes, no backend.

**Folder layout (target):**
```
app/                         routes only (page.tsx / layout.tsx / loading.tsx)
  layout.tsx                 server, shell+fonts+theme provider
  page.tsx                   Home dashboard ("use client")
  people/
    page.tsx                 list ("use client")
    [id]/page.tsx            detail ("use client", uses useParams)
    [id]/layout.tsx          server, exports generateStaticParams() => []
  events/                    same pattern as people/
  settings/page.tsx
components/
  ui/                        shadcn primitives
  shell/                     AppShell, Sidebar, BottomNav, TopBar
  people/, events/, touches/ feature components
  first-run/                 seed-data prompt
hooks/                       usePeople, usePerson, useFollowUpsToday, useEvents
lib/
  db/                        Dexie schema, singleton client, repositories
  seed/                      seed data + idempotent loadSeed()
  date/, id/ (ULID), utils/
types/
test/                        Vitest setup, fake-indexeddb auto-import
```

**Data flow:** UI → `useLiveQuery` (read) or repository fn (write) → Dexie → IndexedDB. Writes invalidate live queries automatically.

**Phase order (5 phases, coarse granularity):**
1. **Foundation & Static-Export Spine** — scaffolding, Dexie schema v1 (all indexes pre-declared), shell, dark mode, dynamic `[id]` route proven, first GH Pages deploy
2. **People** — full CRUD, tag chip input with normalization, closeness chip, 30-second capture flow
3. **Events & Linking** — events CRUD, attendees picker, `event-met` smart default
4. **Touchpoints, Follow-ups & Home Dashboard** — timeline, follow-up dates, Home dashboard with counts/today/upcoming
5. **Search, Settings, Seed Data, Polish & Ship** — global search, JSON export/import, seed data, README, GH Pages + Vercel deploy
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
