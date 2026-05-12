# Research Summary: Networking App

**Domain:** Personal CRM / networking web app (workshop demo)
**Researched:** 2026-05-12
**Overall confidence:** HIGH

## Executive Summary

Research strongly confirms the assumptions encoded in PROJECT.md — the stack is right, the scope is right, and the constraints are coherent. The Next.js 16 (App Router) + Tailwind v4 + shadcn/ui + Dexie + IndexedDB combination is the dominant modern web stack for 2026 and is exactly what a fork-friendly workshop demo wants. None of the locked scope decisions (no auth, no integrations, no AI, no PWA in v1) need to be reopened.

What research did add is **precision around the dangerous edges**. There are three places this project can quietly fail despite a clean codebase: (1) Next.js static export and dynamic `[id]` routes are a known trap that breaks GitHub Pages but works fine locally and on Vercel — discoverable only by running a real GH Pages build on day 1; (2) IndexedDB is "best-effort" storage on Safari and incognito contexts, so a workshop attendee's data can evaporate between sessions unless `navigator.storage.persist()` is called and Export/Import exists; (3) Dexie + SSR is a singleton-and-hydration hazard that needs the `"use client"` boundary and `useLiveQuery`'s three-state render pattern locked early. None of these are blockers — they're all known, all solvable, and all need to be confronted in Phase 1 rather than discovered at deploy time.

On the feature side, the category is small and opinionated — Dex, Clay/Mesh, Monica, Folk, UpHabit, Cardhop, Covve all converge on the same five primitives (contacts + notes + tags + reminders + timeline). Our v1 scope maps almost perfectly onto the table-stakes set, plus two genuinely differentiating wins: **closeness as a first-class glanceable state (star/fire/snowflake)** and **event-as-container-for-people** (which makes the 30-second capture promise feasible by defaulting `event-met` to the most recently created event). Everything else worth deferring — auto-decay, recurring cadences, smart suggestions, gamification — is already correctly excluded.

Architecturally, the proposed five-phase ordering (Foundation → People → Events+Linking → Touchpoints+Follow-ups → Polish/Search/Seed/Deploy) is sound, with one important refinement: GitHub Pages deployment should be validated at the **end of Phase 1**, not deferred to Phase 5. The single biggest risk to the 2.5-week timeline is discovering the dynamic-route static-export trap during the final deploy.

## Key Findings

**Stack (one-liner):** Next.js 16 (App Router, `output: "export"`) + React 19 + TypeScript 5 + Tailwind v4 + shadcn/ui + Dexie 4.4 + `dexie-react-hooks`, with react-hook-form + zod v3 (pinned), Vitest + fake-indexeddb, deployed to GitHub Pages and Vercel without env vars.

**Architecture (one-liner):** Client-only SPA — Next.js as a build-time bundler/router, all data flowing through `useLiveQuery` against a Dexie singleton, writes funneled through functional repositories, schema versioned and additive-only.

**Features (one-liner):** Table-stakes personal-CRM (people, notes, tags, reminders, timeline) wrapped around two differentiators (3-tier closeness state and event-as-container) and a 30-second quick-capture flow as the headline UX moment.

**Critical pitfall (one-liner):** Dynamic `/people/[id]` route under `output: "export"` will fail the GitHub Pages build with a `generateStaticParams` error — must be solved on day 1 with an empty-array `generateStaticParams` + client-side `useParams`, not deferred.

## Non-Obvious Wins

1. **Defaulting `event-met` to the most-recently-created event** is what makes the 30-second capture promise actually achievable. The user's mental flow ("just got back from the meetup, now adding the people") aligns perfectly with this default and removes the most expensive form field. Single highest-leverage UX decision in the project.
2. **Manual closeness with no auto-decay looks better in a workshop demo than auto-decay.** Auto-decay needs tuned thresholds and weeks of data to feel right; seed data with hand-picked variety tells a richer story in 90 seconds than any algorithm could. Defer auto-decay entirely.
3. **Schema v1 should pre-declare `attendees: string[]` and `*tags` multiEntry indexes from day 1**, even though Phases 3 and 4 are the ones that use them. Zero schema migrations needed during the 2.5-week build — the most common cause of mid-project data loss disappears.
4. **`useLiveQuery` returning `undefined` (loading) vs `[]` (empty) must be treated as distinct states project-wide.** Three-state render (`undefined` → skeleton, `length === 0` → empty state, else → list) is a one-line convention that prevents empty-state flicker on every page navigation.
5. **Pin `zod@^3.25` explicitly.** Zod v4 has documented branded-type compatibility issues with `@hookform/resolvers` (issues #813, #842, #12829) — not worth fighting in a 2.5-week workshop project.
6. **`next-pwa` is webpack-bound and breaks Next 16's Turbopack default.** PWA must be deferred to v2 (use Serwist if added). Locked decision in PROJECT.md is now even more justified.
7. **`navigator.storage.persist()` after first write costs ~5 lines of code** and turns IndexedDB from "browser may evict" to "browser must explicitly ask before evicting" — cheapest defense against Safari ITP 7-day eviction.

## Roadmap Implications

### Suggested Phase Structure

Architecture proposed 5 phases. Confirmed and refined here:

1. **Phase 1: Foundation & Static-Export Spine** — boring scaffolding that locks the riskiest decisions
   - Builds: Next.js 16 + Tailwind v4 + shadcn/ui init, design tokens (Linear/Notion vibe), `AppShell`/`Sidebar`/`BottomNav`/`TopBar`, empty routes for all six sections, **Dexie schema v1 fully pre-declared** (people, events, touches, meta with `*tags`, `*attendees`, `lastContactAt`, `followUpAt` indexes), client-only `db.ts` with HMR-safe singleton, `next.config.ts` with `output: "export"` + `basePath`/`assetPrefix` + `trailingSlash: true` + `images.unoptimized`, `[id]` route pattern proven (empty `generateStaticParams` + client `useParams`), `navigator.storage.persist()` wired, `100dvh` shell, `next-themes` no-FOUC dark mode, **first deploy to GitHub Pages**, fake-indexeddb + Vitest setup, one passing smoke test.
   - Addresses pitfalls: dynamic-route static-export trap, Dexie+SSR hydration, schema-churn data loss, `100vh` iOS bug, GH Pages 404/basePath, dark-mode FOUC, HMR-Dexie singleton, skipping tests.
   - Enables: every subsequent phase plugs into a deployed, tested shell.

2. **Phase 2: People CRUD** — the keystone entity end-to-end
   - Builds: `createPerson`/`updatePerson`/`deletePerson` repos, `PersonForm` (RHF + zod v3, dialog on desktop / full-route on mobile with `100dvh` + safe-area), `usePeople()` / `usePerson(id)` hooks, People list with three-state render, tag chip input with **lowercase-trim normalization + autocomplete on existing tags**, `ClosenessChip` first-class on every card, Person detail (notes, tags, closeness, event-met placeholder), empty/loading/error states.
   - Addresses pitfalls: tag explosion, stale form state on dialog reopen, `useLiveQuery` undefined-flicker, hover-stuck-on-tap.
   - Enables: the headline 30-second capture demo lands here.

3. **Phase 3: Events & Linking** — the cross-entity story that makes it feel like a CRM
   - Builds: Events CRUD, `EventForm`, Events list (upcoming/past split), Event detail with attendees query, `AttendeePicker` multi-select, **`event-met` field defaulted to most-recent event** (the leverage point), "Add another person" loop from event page for rhythmic bulk capture, Person detail shows linked event.
   - Addresses pitfalls: schema churn (none — pre-declared in P1).
   - Enables: workshop's "added 4 people from one event in 60 seconds" moment.

4. **Phase 4: Touchpoints, Follow-ups & Closeness** — the "nudges" loop
   - Builds: `Touch` writes + `TouchTimeline` on Person detail (append-with-timestamp), `followUpAt` field + date picker, **`useFollowUpsToday()` hook**, Home dashboard with counts + today's follow-ups + upcoming events, mark-follow-up-done (delete the date), closeness state transitions, "last seen N days ago" factual indicator (no auto-state-change).
   - Addresses pitfalls: closeness staleness (mitigated via demo data variety + factual last-contact display), notification-permission silent failure (in-app dashboard is primary surface, no browser push), bottom-nav-blocking-keyboard.
   - Enables: validates "CRM that nudges you" value prop.

5. **Phase 5: Search, Seed, Settings, Polish, Ship** — workshop-ready
   - Builds: global search (name boosted > tags > notes, debounced 250ms, prefix queries via lowercase index), Settings page (theme toggle, reset DB, **JSON Export/Import via `dexie-export-import`**, manual seed reload), first-run dialog reading from `meta` store with **idempotent transactional `loadSeed()`** (plausible diverse names/roles/events, varied closeness/follow-ups), Home dashboard final layout, bundle audit, GH Pages + Vercel deploy verified, README for forkers.
   - Addresses pitfalls: backup theatre (round-trip export/import), cringe seed data, partial seeding duplicates, bundle bloat from barrel imports, time-sink theming, "one more feature" creep.
   - Enables: ship on 2026-05-30.

### Phase Ordering Rationale

- **Risk front-loaded into Phase 1.** Static-export routing, basePath/assetPrefix, Dexie+SSR, and `100dvh` are all production-deployment hazards that masquerade as fine in `next dev`. Deploying hello-world to GH Pages at end of P1 catches every one of them while there's still 2 weeks of slack. **Single most important ordering decision.**
- **People before Events.** Person is the primary entity; Events without People is meaningless.
- **Linking after both exist.** Pre-declaring `attendees: string[]` in P1's schema means P3 needs zero migration.
- **Touchpoints and follow-ups together.** They share the Person-detail surface and the Home-dashboard widget.
- **Search/seed/polish last.** Search needs all entities; seed-data variety needs the data model locked; polish must come after features.
- **Demo arc:** every phase ends with something showable. P1: "real app on phone + 27-inch monitor." P2: 30-second capture moment. P3: event-bulk-add rhythm. P4: dashboard nudges. P5: polished, seeded, deployed product.

### Research Flags for Phases

| Phase | Needs deeper research? | Why |
|---|---|---|
| P1 | Light — 10-min spike to confirm empty-`generateStaticParams` + client-`useParams` in Next 16.2 | Pattern is documented but Next.js dynamic-route + static-export has been a moving target |
| P2 | No | RHF + zod v3 + shadcn Form is most-trodden path in 2026 |
| P3 | No | Many-to-one Person→Event with `attendees: string[]` is straightforward |
| P4 | Light — decide manual-vs-computed closeness during phase planning | Both options work; manual simpler, computed more honest |
| P5 | Light — confirm `dexie-export-import` API for round-trip schema | Library is the right choice but pin exact version |

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | Cross-verified against Context7 official docs + npm + May 2026 community guides. Every version pin has documented reason. |
| Features | HIGH | Category is small/mature; vendor pages + 8+ independent 2025-2026 reviews converge on same five primitives. Confidence on differentiator specifics (Mesh's exact closeness algorithm) is MEDIUM — but we're not copying their algorithm. |
| Architecture | HIGH | Patterns sourced from official Next.js 15/16 docs, Dexie docs, shadcn docs. The `output: "export"` + client-rendered `[id]` pattern is community-confirmed. |
| Pitfalls | HIGH | Each pitfall sourced to official doc, issue tracker, or well-cited community write-up. Severity ratings defensible. |

## Decisions Locked by Research (Add to PROJECT.md Key Decisions)

| Decision | Rationale |
|---|---|
| Pin `zod@^3.25` — do NOT use zod v4 | Documented branded-type compatibility issues with `@hookform/resolvers` (#813, #842, #12829) |
| Skip PWA in v1 (no `next-pwa`, no Serwist) | `next-pwa` is webpack-only and breaks Next 16's Turbopack default; Serwist adds 1-2 days for no value-prop movement |
| `[id]` dynamic routes use `generateStaticParams` returning `[]` + client `useParams` | Only viable pattern for user-generated IDs under `output: "export"` |
| All Dexie access is client-only; reads via `useLiveQuery`, writes via repositories | Avoids SSR `indexedDB is not defined`; eliminates Redux/Zustand from v1 |
| `navigator.storage.persist()` called after first write | Cheapest defense against Safari ITP 7-day eviction |
| Schema v1 locked before any seed data; subsequent versions additive-only | Dexie's declarative versioning is unforgiving; renaming/dropping fields without `.upgrade()` silently loses data |
| JSON Export/Import via `dexie-export-import` is required, not optional | Without round-trip backup, "Export" is backup theatre |
| Tag normalization on write: `.trim().toLowerCase()` + autocomplete on existing | Tag explosion is documented category problem; covers 80% case cheaply |
| Manual closeness with no auto-decay in v1 | Auto-decay needs tuned thresholds + enough data to feel honest; in fresh demo it looks broken |
| Fixed-date follow-ups only; no recurring cadences in v1 | Recurring adds scheduler concept (compute-next, cancel UI) — 2-3 extra screens; clean v2 path |
| `event-met` defaults to most-recently-created event | Highest-leverage decision for 30-second-capture promise |
| Use `100dvh`, not `100vh` | Avoids iOS Safari bottom-nav-under-home-bar bug |
| First deploy to GitHub Pages happens at end of Phase 1 | Validates dynamic-route, basePath, assetPrefix, trailingSlash, `images.unoptimized` while there's still slack |

## Open Questions / Gaps

1. **Workshop deploy target for live demo:** GH Pages or Vercel? Both should work. Default: ship both, demo from whichever loads fastest on venue Wi-Fi.
2. **Closeness in P4 — manual or computed-from-last-contact?** Research recommends manual + visible "N days ago" as separate factual indicator. Worth a 15-min discussion during P4 planning.
3. **Cmd+K command palette — v1 or stretch?** Research says stretch only; polished workshop moment if time permits in P5.
4. **Master-detail desktop People page at `lg:` breakpoint — v1 or v2?** Research says stacked navigation sufficient for v1; master-detail is P5 polish only if all required scope is green.
5. **Seed-data specifics:** PROJECT.md mentions Sara Kim, Kareem Tate, Mason Lee. Other 5-9 names + events + closeness distribution need drafting in P5 — worst possible time to make this up is workshop morning.
6. **Concrete demo script:** the 30-second-capture story is unfalsifiable until rehearsed. Plan to rehearse adding 3 specific pre-memorized people during P5.

## Workshop-Specific Implications

- **No demo-only hacks anywhere.** Every `// FIXME — demo only`, every commented-out guard, every debug `console.log` is a teaching liability. Code-review gate at every phase commit.
- **`packageManager` field + npm fallback in README.** Many attendees have only npm. pnpm is author preference; `npm install && npm run dev` must work. Pin Node via `.nvmrc` + `engines`.
- **Use `turbopack` for dev** to keep cold-start time down on attendees' machines. Document the cold-start expectation in README.
- **Lock teaching branches a week before workshop.** Scratch branch for last-minute fixes; cherry-pick only after. The `00-empty` → `01-planning` → `02-discussion` → `03-milestone` branch arc is itself a teaching artifact.
- **Demo in a fresh Chrome profile (or incognito with IndexedDB enabled).** Privacy extensions on facilitator's main browser can silently block IndexedDB.
- **Test first-run flow on a clean profile the morning of the workshop.** First impressions are unforgiving; seed-data prompt is the first thing every attendee will see when they fork.
- **Plan demo viewport switches deliberately.** Devtools "iPhone 14 Pro" for mobile segment, "Responsive — desktop" for master-detail moment. Pre-zoom for back-row readability.
- **The codebase is a teaching asset.** Every abstraction must justify itself to a forking attendee, not just to the facilitator.
