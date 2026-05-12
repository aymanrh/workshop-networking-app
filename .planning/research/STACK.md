# Stack Research

**Domain:** Single-user personal CRM / contact-and-event memory web app (NetMemory)
**Researched:** 2026-05-12
**Confidence:** HIGH (versions and ecosystem stance verified against official sources and 2026-current comparisons; only "what the user will choose" is the residual uncertainty)

---

## TL;DR — Prescriptive Stack

| Layer | Pick | Version (May 2026) |
|---|---|---|
| Framework | **Next.js (App Router)** | 16.2.x (16.2.6 LTS line) |
| UI runtime | **React** | 19.2 |
| Styling | **Tailwind CSS v4** | 4.3.x |
| Components | **shadcn/ui** (Tailwind v4 build) | latest CLI |
| Language | **TypeScript** | 5.7+ |
| Forms | **React Hook Form + Zod v4** | RHF 7.x, Zod 4.x |
| ORM | **Drizzle ORM** | 1.0.0-rc.1 (pin RC; promote to 1.0 stable on release) |
| Database | **Postgres** (Neon serverless) | Postgres 17 on Neon |
| Search | **Postgres `pg_trgm` (trigram) + `tsvector` FTS** — both, layered | built into Postgres 17 |
| Auth | **Better Auth** | 1.x (stable) |
| Hosting (app) | **Vercel Hobby** | n/a |
| Hosting (db) | **Neon Free → Launch ($5/mo if needed)** | n/a |
| Email (magic link / export) | **Resend** | latest |
| Validation/parsing | **Zod v4** | 4.x |
| Date/time | **date-fns** (tree-shakeable) | 4.x |
| Tests | **Vitest** + **Playwright** | Vitest 2.x, Playwright 1.5x |
| Lint/format | **Biome** (preferred) or ESLint + Prettier | Biome 2.x |
| Error monitoring | **Sentry** (free tier) | latest |

> One-line rationale: **Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + Drizzle + Neon Postgres + Better Auth on Vercel Hobby** is the 2026-current "default" full-stack for a TypeScript-first solo developer who wants mobile-friendly responsive web, free hosting, and exportable data — with Postgres `pg_trgm` doing the heavy lifting for typo-tolerant name/tag search.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|---|---|---|---|
| **Next.js** (App Router) | 16.2.x | Full-stack web framework: routing, RSC, server actions, edge/node runtimes | Largest TypeScript ecosystem in 2026, first-party fit for Vercel Hobby (zero-friction deploy, generous free tier), server actions remove most need for a separate API layer, App Router is now the only actively invested-in router. Next.js 16 stabilises Turbopack, the React Compiler, and `cacheLife`/`cacheTag`. **HIGH confidence.** |
| **React** | 19.2 | UI runtime | Required by Next.js 16; brings View Transitions (useful for the "planned → attended → memory" event lifecycle animations), `useEffectEvent`, and Activity components. Compiler auto-memoizes — meaningful for list-heavy CRM views. **HIGH confidence.** |
| **TypeScript** | 5.7+ | Type safety end-to-end | Non-negotiable in 2026. Drizzle, Zod, Next.js, Better Auth, shadcn all assume TS-first. **HIGH confidence.** |
| **Tailwind CSS** | 4.3.x | Styling | v4 is CSS-first config, ~5× faster builds, 100× faster incremental rebuilds. shadcn/ui ships first-class Tailwind v4 components. Mobile-first responsive utilities are the fastest way to nail the "30-second mobile capture" UX. **HIGH confidence.** |
| **shadcn/ui** | latest CLI (Tailwind v4 build) | Copy-paste component library (forms, dialogs, command palette, combobox, sheet, drawer) | Dominant React UI stack in 2026. Owns the components (no runtime dep churn). Has every primitive needed for a CRM: `Command` (⌘K palette for fast contact lookup), `Combobox` (tag picker), `Sheet`/`Drawer` (mobile-first contact detail), `Form` (RHF + Zod wired in). **HIGH confidence.** |
| **Drizzle ORM** | 1.0.0-rc.1 (May 2026) | Type-safe SQL ORM | Code-first TypeScript schema, generates raw SQL with ~zero overhead, ~5KB runtime (vs Prisma's ~1.6MB even post-Rust-removal). Passed Prisma in weekly downloads in late 2025 — ecosystem default for new TypeScript projects in 2026. Plays nicely with Neon (HTTP + WebSocket drivers). Drizzle Kit handles migrations; Drizzle Studio gives a free admin GUI. **HIGH confidence.** Pin to `1.0.0-rc.1` and bump to `1.0.0` on stable release (expected weeks away). |
| **Postgres** (Neon) | Postgres 17 | Primary datastore | Neon = serverless Postgres with **scale-to-zero** (you literally pay $0 when idle on Hobby) and 0.5 GB storage on Free. Postgres gives us `tsvector` FTS **and** `pg_trgm` fuzzy matching in one engine — exactly what name/tag/event search needs. Upgrade path to multi-user later is trivial. **HIGH confidence.** |
| **Better Auth** | 1.x | Authentication library | TypeScript-first, framework-agnostic, ships with email/password, magic link, **passkeys** (WebAuthn), and 2FA as first-class plugins. Fastest-growing auth library in 2026 (50K → 500K weekly downloads in 12 months). Stores sessions in *our* Postgres via Drizzle adapter — no third-party auth vendor lock-in, satisfies the "no third-party logins required, exportable data" constraint. Next.js 16 compatible (the only adjustment is `middleware → proxy`). **HIGH confidence.** |
| **Zod** | 4.x | Runtime schema validation + TS type inference | De facto standard for Next.js server action validation; Zod v4 is ~4× faster than v3 and is what `@hookform/resolvers/zod` is built around. **HIGH confidence.** |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| **React Hook Form** | 7.x | Form state + validation orchestration | Every form (contact capture, event creation, tag editing) — pairs with Zod via `@hookform/resolvers/zod` and shadcn's `<Form>` primitive |
| **@hookform/resolvers** | latest | Bridge between RHF and Zod | Always, paired with RHF |
| **Drizzle Kit** | matches Drizzle | Schema migrations, `drizzle-kit push`, `drizzle-kit studio` | Schema changes, local dev, debugging data |
| **Better Auth Drizzle adapter** | latest | Persist Better Auth sessions/users in our Postgres | Always — keeps auth data inside our exportable DB |
| **`postgres`** (postgres.js) or **`@neondatabase/serverless`** | latest | DB driver | `@neondatabase/serverless` for Edge/HTTP fetch routes; `postgres` for Node runtime routes. Drizzle supports both. |
| **`pg_trgm`** | built-in PG extension | Fuzzy name/tag matching with `%` operator + GIN index | Day 1 — primary search engine for contact names, company, tags |
| **`tsvector` + `to_tsquery`** | built-in PG | Word-level full-text search for long-form notes | Day 1 — secondary search engine for "how we met" and free-form notes |
| **date-fns** | 4.x | Date manipulation, formatting, "staleness" calculations | Event lifecycle (planned/attended), "haven't talked to X in 90 days" view |
| **Resend** | latest SDK | Transactional email | Magic-link auth, "share contact/event externally" feature, future v2 reminder emails |
| **next-safe-action** | latest | Typed server actions with built-in Zod validation, auth checks, error handling | Wraps every mutating server action (create contact, mark event attended, etc.) |
| **nuqs** | latest | Type-safe URL search params (`?q=foo&tag=bar&event=42`) | Filter/search UI — keeps state in URL so search is shareable and back-button works |
| **TanStack Query** | 5.x | Client-side cache for any data not handled by RSC | Optional — only for sections with rapid client-side mutation (e.g., command palette typeahead). Most pages can use RSC + server actions and skip this. |
| **Sentry** | latest | Error monitoring | Day 1 — solo dev cannot afford to miss errors; free tier ample |
| **PostHog** (self-hosted-optional) or **Plausible** | latest | Usage analytics (your own) | Optional, for "which views do I actually use" introspection |

### Development Tools

| Tool | Purpose | Notes |
|---|---|---|
| **pnpm** | Package manager | Faster, disk-efficient; Next.js + Vercel both support it natively |
| **Biome** | Lint + format in one binary | Replaces ESLint + Prettier; ~25× faster; zero-config for TypeScript/React projects in 2026 |
| **Vitest** | Unit + integration tests | Vite-native, fast, works with Drizzle in-memory PGlite for DB tests |
| **Playwright** | E2E + mobile-viewport tests | Critical — the capture UX *must* work on a phone browser. Playwright's mobile emulation catches this. |
| **PGlite** (in-memory Postgres) | DB unit tests | Run real Postgres queries in-process for tests; supports `pg_trgm` |
| **Drizzle Studio** | DB GUI | Free, runs locally via `drizzle-kit studio` |
| **GitHub Actions** | CI | Free for personal projects; runs Biome + Vitest + Playwright on every PR |

---

## Installation

```bash
# Bootstrap (Next.js 16 with App Router, TS, Tailwind v4 — the default template)
pnpm create next-app@latest netmemory --typescript --tailwind --app --use-pnpm

cd netmemory

# Components
pnpm dlx shadcn@latest init        # picks Tailwind v4 automatically
pnpm dlx shadcn@latest add button card dialog drawer sheet form input textarea \
  command combobox badge avatar dropdown-menu popover calendar select tabs sonner

# Database + ORM
pnpm add drizzle-orm @neondatabase/serverless postgres
pnpm add -D drizzle-kit

# Auth
pnpm add better-auth
# (Better Auth uses the same Drizzle instance — no extra adapter package)

# Forms + validation
pnpm add react-hook-form @hookform/resolvers zod
pnpm add next-safe-action nuqs

# Utilities
pnpm add date-fns
pnpm add resend                    # transactional email (magic link, exports)

# Observability
pnpm add @sentry/nextjs

# Dev
pnpm add -D @biomejs/biome vitest @vitest/ui playwright @playwright/test \
  @electric-sql/pglite
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| **Next.js 16** | **SvelteKit 2** | If the user disliked React or wanted smallest possible bundles. Honest tradeoff: SvelteKit ships smaller (~50%) and has a more delightful DX, but the React/Next ecosystem (shadcn, Better Auth Next adapter, Drizzle examples, Vercel zero-config) is 5× bigger in 2026 — for a solo dev on tight time, ecosystem density wins. |
| **Next.js 16** | **Remix / React Router v7** | If form-heavy and you want pure web-standards (no RSC mental model). Viable — but Vercel/Next.js is still the safer, more documented default in 2026. |
| **Next.js 16** | **Astro** | If 80%+ of pages were static content. Not the case here — NetMemory is interactive throughout. |
| **Postgres (Neon)** | **SQLite (Turso / libSQL)** | Truly single-user with no sync needs and a hard zero-cost ceiling. Trade-off: SQLite FTS5 is excellent, but giving up Postgres means giving up `pg_trgm` (best-in-class fuzzy match for names) and complicates the v2 multi-user migration. Neon Free is free enough that this trade isn't worth it. |
| **Postgres (Neon)** | **Supabase** | If you wanted auth + storage + realtime in one bundle. Trade-off: more vendor lock-in, doesn't scale-to-zero on free tier, and we already have Better Auth covering auth. Supabase Storage becomes attractive for **v3 photo uploads** — flag this as a re-evaluation point. |
| **Drizzle** | **Prisma 7** | If the user prefers a schema DSL and a polished visual GUI (Prisma Studio is more mature). Prisma 7 dropped its Rust engine and is much lighter now, but Drizzle still wins on edge-runtime fit, bundle size, and SQL transparency — important for a Postgres-FTS-heavy app where you'll be writing raw SQL fragments anyway. |
| **Better Auth** | **Auth.js (NextAuth) v5** | If you already know NextAuth or need an OAuth provider that Better Auth's plugin catalogue lacks. NextAuth still has the larger install base, but Better Auth's TypeScript-first design and built-in passkey/2FA plugins are a better match for a privacy-sensitive personal app. |
| **Better Auth** | **Lucia** | Don't — Lucia entered maintenance mode in late 2025. |
| **Vercel Hobby** | **Railway ($5/mo)** | If you outgrow Vercel Hobby's commercial-use ban (you won't — this is personal) or want the DB + app on one bill. |
| **Vercel Hobby** | **Fly.io** | If you want a long-running Node process (e.g., heavy background jobs). Not needed for v1; Vercel's serverless model is a better fit. |
| **Vercel Hobby** | **Cloudflare Pages + Workers** | Cheapest at scale, but Next.js 16 on Cloudflare still has rough edges around RSC streaming. Revisit later. |
| **Resend** | **AWS SES / Postmark** | Cheaper at high volume; Resend is dramatically easier for a solo dev at this volume (~free) |
| **Sentry** | **Better Stack / Highlight.io** | Sentry's free tier is enough; either alternative is fine |
| **Biome** | **ESLint + Prettier** | If a future contributor is more comfortable with ESLint plugins. Biome is faster and good enough in 2026. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|---|---|---|
| **Next.js Pages Router** | In maintenance — all new features land in App Router | App Router (`app/` directory) |
| **CRA (Create React App)** | Officially deprecated since 2023 | Next.js or Vite + React Router |
| **Prisma <5** | Old Rust engine, large bundle, no edge support | Drizzle 1.x, or Prisma 7 if you want Prisma DX |
| **Lucia Auth** | Maintenance mode since 2025 | Better Auth |
| **NextAuth v4** | Superseded by v5 / Auth.js; v5 itself is being out-paced by Better Auth | Better Auth (or Auth.js v5 if NextAuth muscle memory matters) |
| **TypeORM, Sequelize** | Decoder-ring DX, weak TS inference, slower | Drizzle |
| **MongoDB / Firebase Firestore** | Schemaless makes the "rich, durable context" promise harder, and the data export story is worse | Postgres |
| **Vercel Postgres (legacy)** | Vercel pushed users to Neon in 2024–25 | Neon directly |
| **`pages/api` route handlers for mutations** | Replaced by server actions + `next-safe-action` | Server actions wrapped in `next-safe-action` |
| **JWT-in-localStorage auth rolled by hand** | XSS exposure for sensitive personal data | Better Auth with httpOnly cookies |
| **Heroku free tier** | No longer exists; paid tier is overkill here | Vercel Hobby + Neon |
| **`like '%foo%'` queries on contacts** | Sequential scan; gets slow even at modest scale; no typo tolerance | `pg_trgm` GIN index with `%` operator (similarity) |
| **Pinecone / Weaviate for fuzzy contact search** | Massive overkill at one-user scale, extra service to host | Postgres `pg_trgm` + `tsvector` |
| **Tailwind v3** | v4 is stable and ~5× faster; shadcn now defaults to v4 | Tailwind v4 |
| **CSS-in-JS (styled-components, Emotion)** | RSC-incompatible without workarounds; community moved to Tailwind/zero-runtime | Tailwind v4 |
| **Day.js / Moment** | Moment is in maintenance; Day.js is fine but date-fns tree-shakes better and pairs well with Zod schemas | date-fns 4.x |

---

## Search Strategy — The Make-or-Break Bit

This is core to the product ("browse contacts by name search, by event, and by tag/company filter"), so it deserves its own section.

**Recommended approach: layered, single-Postgres, no external search service.**

1. **`pg_trgm` (trigram) GIN index** on:
   - `contacts.name`
   - `contacts.company`
   - `contacts.role`
   - `tags.name`
   - `events.name`

   Use the `%` similarity operator (default 0.3 threshold, tunable). This handles **typos and partial matches** — "Aymn" finds "Ayman", "Goog" finds "Google". This is the **primary** search index for fast typeahead.

2. **`tsvector` full-text index** on:
   - `contacts.notes` (long-form "how we met" + free-form text)
   - `events.notes` (event memories)

   Combined with `to_tsquery` and `ts_rank` for relevance scoring. This handles **word-level semantic search** with stemming and stopword removal — "talked about React" matches "we discussed React frameworks".

3. **Generated column** on contacts: `search_blob tsvector GENERATED ALWAYS AS (...) STORED` that concatenates name + company + tags + notes with weights (A=name, B=company/role, C=tags, D=notes). One indexed column, one query, ranked results.

4. **Tag/company filtering** is plain Postgres `WHERE tag_id IN (...)` with a B-tree index — no FTS needed.

5. **Staleness view** ("contacts I haven't talked to in N days") is a SQL query against `last_interaction_at` with a B-tree index — no FTS needed.

Reasoning:
- Both `pg_trgm` and `tsvector` are built into every modern Postgres (Neon's Postgres 17 has them).
- Zero additional infra cost or operational complexity.
- The user explicitly said "modest scale, single user" — at this scale, Postgres FTS is fastest to ship, cheapest to run, and easiest to debug.
- Drizzle supports raw SQL fragments for the GIN index DDL and the `%` / `@@` operators in queries via `sql\`...\``.
- A future scale-out to Meilisearch / Typesense is a clean, contained migration if ever needed — but it won't be needed for this product.

**Anti-pattern:** Starting with Algolia / Meilisearch / Typesense. Per-record fees (Algolia) or extra service to host (Meilisearch) for a one-user app is waste.

---

## Single-User, Cheap-Hosting Fit (explicit)

| Concern | How the stack addresses it |
|---|---|
| **Cost ceiling: $0/mo if possible** | Vercel Hobby (free, no time limit) + Neon Free (free, scale-to-zero — $0 when idle) + Resend Free (3K emails/mo) + Sentry Free + Better Auth (self-hosted, no vendor) = **$0/mo expected.** Worst-case if Neon Free is outgrown: $5/mo on Neon Launch. |
| **No public sign-up / single user** | Better Auth configured with a single seed user in `users` table; sign-up route disabled in the auth config. Magic-link from your own email address only. |
| **Mobile-friendly capture in <30s** | Tailwind v4 responsive utilities + shadcn `Drawer` (bottom-sheet on mobile) + RHF + server action = mobile form that submits in one tap. No SPA boot — RSC streaming is fast on 4G. |
| **Sensitive personal data** | TLS terminated at Vercel + Neon. Auth data and session tokens live in *your* Postgres (Better Auth), not a third-party vendor. Data export = `pg_dump` from Neon or a `/export` server action that streams JSON. |
| **Exportable any time** | Postgres is the most portable DB on Earth. Add `/export` server action returning JSON of all tables; for hard escape, `pg_dump --no-owner --no-acl` from Neon CLI. |
| **Single cloud account I own** | All three (Vercel, Neon, Resend, Sentry) are accounts you sign up for once and own. No team / billing fan-out. |
| **No third-party data sharing** | No analytics SDK on the client by default. Sentry can be configured to redact PII. Better Auth has zero external calls. |
| **Future v3 photo uploads must not be precluded** | Two paths kept open: **(a)** Vercel Blob (cheap, S3-backed, native Next.js integration) or **(b)** Supabase Storage (if you migrate Postgres there later). Both are drop-in additions; the v1 schema simply reserves a nullable `avatar_url` column. |
| **Could become a real tool for others** | Multi-tenant migration path is clean: Better Auth supports orgs/users natively; Drizzle schema just needs an `owner_id` column on contacts/events/tags; no rewrite. |

---

## Stack Patterns by Variant

**If the user later wants strict zero-cost forever:**
- Swap Neon → SQLite + Turso (5 GB free) — but lose `pg_trgm` (FTS5 covers it, not as good for fuzzy name match).
- Swap Vercel → Cloudflare Pages (no Hobby commercial-use clause).

**If the user wants to host on their own server (e.g., a Mini-PC at home):**
- Swap Vercel → self-hosted Next.js (`next start`) behind Caddy.
- Swap Neon → local Postgres 17 in Docker.
- Same code, no app changes — that's the point of using portable defaults.

**If multi-user lands in v4+:**
- Better Auth → enable org plugin.
- Drizzle schema → add `owner_id` to row-level scoped tables.
- Postgres → add Row Level Security policies as defence-in-depth.

**If photo uploads land in v3:**
- Add Vercel Blob (`@vercel/blob`) — done. No backend changes.

---

## Version Compatibility (verified May 2026)

| Package | Compatible With | Notes |
|---|---|---|
| Next.js 16.2.x | React 19.2, Tailwind v4, Node 20+ | App Router only path forward. Turbopack default in dev *and* build. |
| React 19.2 | Next.js 16, shadcn/ui, RHF 7.x | React Compiler stable; works with Next.js out of the box. |
| Tailwind v4.3 | shadcn/ui (latest CLI), Next.js 16 | shadcn CLI auto-detects v4. Existing shadcn v3 projects need migration. |
| Drizzle 1.0.0-rc.1 | Postgres 12+, Node 18+, Bun, Cloudflare Workers | Pin to RC; cut to stable when 1.0.0 releases. RC.1 introduced casing API breaking change. |
| Better Auth 1.x | Next.js 13–16 (App Router), Drizzle adapter | Next.js 16: rename `middleware.ts` → `proxy.ts` as Next.js renamed the concept. |
| Zod v4 | RHF 7 via `@hookform/resolvers@^4`, Next.js server actions | v4 is ~4× faster than v3; migration is ~1 day. |
| Neon Postgres 17 | `pg_trgm`, `tsvector`, Drizzle `@neondatabase/serverless` and `postgres.js` | Scale-to-zero ~5 min idle on Free tier. Cold start ~300ms. |

---

## Open Risks / Things to Re-check Before Phase 1

- **Drizzle 1.0 stable timing.** Currently on RC.1 (April 30, 2026). If 1.0.0 isn't out by phase 1 kickoff, pin RC.1 — risk is low (RC means API frozen). **MEDIUM confidence on stable timing; HIGH confidence on functional fitness.**
- **Vercel Hobby commercial-use clause.** Personal projects are fine. If NetMemory ever becomes a paid product for others, plan to move to Vercel Pro ($20/mo) or Railway.
- **Neon cold-start latency.** ~300ms on free tier from cold. The capture UX is mostly write-heavy and tolerates this; lookup typeahead might want a warm-keep-alive ping. Address in execution phase, not now.
- **Better Auth API churn.** Library is young (just hit 1.0 in 2026). Pin a minor version and review on each upgrade. **MEDIUM confidence on long-term API stability.**

---

## Sources

- [Next.js 16 release notes](https://nextjs.org/blog/next-16) — verified App Router stability, Turbopack default, React 19.2 integration (HIGH)
- [Next.js 16.2](https://nextjs.org/blog/next-16-2) — confirmed 16.2 line is current stable May 2026 (HIGH)
- [Next.js EOL data](https://eosl.date/eol/product/nextjs/) — confirmed 16.2.6 LTS released May 2026 (HIGH)
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) — verified v4 stable (HIGH)
- [Tailwind 4.2 release](https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/) — confirmed 4.2/4.3 current (HIGH)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — verified first-class Tailwind v4 support (HIGH)
- [Drizzle ORM v1.0.0-rc.1 release](https://orm.drizzle.team/docs/latest-releases) — verified release candidate status May 2026 (HIGH)
- [Drizzle vs Prisma 2026 comparisons](https://encore.dev/articles/drizzle-vs-prisma) — verified ecosystem shift to Drizzle as default (MEDIUM, multiple sources agree)
- [Prisma 7 release info](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — verified Rust-engine removal (MEDIUM)
- [Better Auth docs](https://better-auth.com/docs/installation) — verified Next.js 16 support, passkey/magic-link plugins (HIGH)
- [Better Auth vs alternatives 2026](https://trybuildpilot.com/625-better-auth-vs-lucia-vs-nextauth-2026) — verified Lucia's maintenance mode, Better Auth growth (MEDIUM, corroborated by multiple sources)
- [Neon pricing 2026](https://neon.com/pricing) — verified free tier limits (100 CU-hours, 0.5 GB, scale-to-zero) (HIGH)
- [Neon free tier breakdown](https://checkthat.ai/brands/neon/pricing) — corroborated free tier details (MEDIUM)
- [Vercel Hobby tier details](https://agentdeals.dev/hosting-free-tier-comparison-2026) — verified Hobby plan terms (MEDIUM)
- [Zod v4 vs Valibot 2026 benchmark](https://dev.to/whoffagents/zod-v4-vs-valibot-runtime-validation-in-2026-i-benchmarked-both-3jnc) — verified Zod v4 perf gains, ecosystem dominance (MEDIUM)
- [Postgres pg_trgm docs](https://www.postgresql.org/docs/current/pgtrgm.html) — verified trigram operator and GIN index support (HIGH)
- [Postgres FTS vs pg_trgm comparison](https://www.aapelivuorinen.com/blog/2021/02/24/postgres-text-search/) — verified the layered approach is standard (HIGH)
- [SQLite FTS5 vs Postgres FTS comparison](https://supabase.com/blog/postgres-full-text-search-vs-the-rest) — informed the search-strategy decision (MEDIUM)

---

*Stack research for: single-user personal CRM ("NetMemory")*
*Researched: 2026-05-12*
*Confidence: HIGH on framework, ORM, DB, auth, hosting picks. MEDIUM on Drizzle 1.0 GA timing and Better Auth long-term API stability — both have clear mitigations.*
