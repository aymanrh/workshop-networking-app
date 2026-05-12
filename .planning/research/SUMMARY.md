# Project Research Summary

**Project:** NetMemory
**Domain:** Single-user personal CRM / contact-and-event memory web app (mobile-friendly)
**Researched:** 2026-05-12
**Confidence:** HIGH

## Executive Summary

NetMemory is a single-user personal CRM that treats both people and events as first-class, rich-context entities, and lives or dies by one user-experience moment: capturing a contact on a phone in under 30 seconds. The research across stack, features, architecture, and pitfalls converges on a "boring, durable, mobile-first monolith" - every reviewed competitor (Monica, Dex, Clay, Cloze) has been hurt by capture friction, mobile neglect, or schema over-engineering, and the most successful pattern is a thin web app with a normalized Postgres core and a deliberately small v1 feature set.

The recommended approach is a Next.js 16 (App Router) + React 19 monolith on Vercel Hobby, with Drizzle ORM over a Neon serverless Postgres database (free tier, scale-to-zero), Better Auth for self-contained single-user authentication, Tailwind v4 + shadcn/ui for a mobile-first responsive UI, and Postgres-native `pg_trgm` + `tsvector` for search - no external search service, no third-party logins, no native mobile app. Server actions wrapped in `next-safe-action` keep routes thin; a small `server/services/` layer holds business logic and lifecycle transitions. Cost target: $0/month on free tiers; data portability target: full JSON dump that round-trips cleanly.

The largest risks are not technical - they are behavioural and product-shaped. Capture friction, mobile-as-afterthought, and schema sprawl have killed nearly every comparable product, and the solo-developer abandonment pattern compounds them all. Mitigation requires shipping a real Phase-1 (capture + mobile + auth + export + backup) within 2-4 weeks, building search with Postgres FTS from day one (never plain LIKE-wildcard scans), keeping the v1 schema to ~five entities (People, Events, EventAttendance, Tags, Notes), and treating staleness as a pull-only view with snooze/exclude - no push notifications in v1.

## Key Findings

### Recommended Stack

The 2026-current TypeScript-first full-stack default for a solo developer wanting mobile-friendly web, free hosting, and exportable data. A single Postgres database does double duty for OLTP and search via `pg_trgm` (fuzzy name match) layered with `tsvector` GIN FTS (note semantic search) - no external search service, no per-record fees. Better Auth keeps session data inside the user's own Postgres so the "no third-party data sharing" constraint holds end-to-end.

**Core technologies:**
- **Next.js 16.2.x (App Router) + React 19.2** - Server actions remove most of the API boilerplate; Vercel Hobby gives zero-friction deploy on the free tier
- **TypeScript 5.7+** - Non-negotiable; every other library in the stack assumes it
- **Tailwind v4 + shadcn/ui** - Mobile-first responsive utilities + drawer/sheet/command primitives are the fastest path to the sub-30s capture UX
- **Drizzle ORM 1.x + Neon Postgres 17** - Type-safe SQL, edge-friendly, scale-to-zero free tier; portable schema for any future self-host migration
- **Better Auth 1.x** - TypeScript-first auth with passkeys / magic link built in; sessions persisted to our own Postgres
- **Zod v4 + React Hook Form + next-safe-action** - End-to-end validation from form to server action to database
- **Postgres `pg_trgm` + `tsvector`** - Layered fuzzy + full-text search; zero additional infrastructure
- **Resend + Sentry (free tiers)** - Transactional email for magic-link auth and exports; error monitoring with PII scrubbing
- **Vitest + Playwright + PGlite** - Unit + mobile-viewport E2E + in-process Postgres for tests

Confidence on framework / ORM / DB / auth picks is HIGH; the only medium-confidence items are Drizzle 1.0 GA timing (currently RC.1 - pin until stable releases) and Better Auth long-term API stability (young library; pin minor versions). See STACK.md for the full version matrix and alternatives.

### Expected Features

**Must have (table stakes - missing any of these makes the product feel broken):**
- Single-user authentication (magic link or passkey; no public sign-up)
- Contact CRUD with name, company/role, free-form notes, tags
- Event CRUD with date, location, lifecycle state (planned / attended / memory)
- Contact <-> Event linkage with "how we met" context (the central edge that delivers the Core Value)
- Notes as timestamped append-only entries on contacts
- Text search across name + notes + company (fuzzy + word-level)
- Filter / browse by tag, company, event
- Mobile-responsive capture UX with sub-30s creation flow
- Full data export (JSON + CSV) preserving relational structure
- HTTPS + encryption-in-transit

**Should have (differentiators - competitive whitespace):**
- Event-as-lifecycle entity (planned -> attended -> memory) - competitors treat events as tags or activities
- Sub-30s mobile capture (every competitor review names this as the gap)
- Pull-based staleness view ("haven't talked to X in N days") with snooze/exclude
- Per-record share link (revocable, time-boxed signed URL) - genuine whitespace; no reviewed product offers this
- No third-party login dependency - Dex/Clay/Cloze all require Google/LinkedIn OAuth; NetMemory refuses on principle
- Memory-first UI framing (vs sales-pipeline framing that plagues Cloze/Dex)

**Defer (v2+):**
- Contact channels (email/phone/LinkedIn handles + copy-to-clipboard) - v2
- Real push/email follow-up reminders - v2
- Import from LinkedIn / Google Contacts / vCard - v2
- Photos / avatars per contact - v3
- Relationship strength tiers and custom fields - v3
- AI summarization / message drafting - deferred indefinitely; not aligned with Core Value

**Explicit anti-features (never build):**
- Email / calendar / LinkedIn auto-sync (PROJECT.md privacy constraint)
- In-app messaging or email composer
- Native iOS / Android apps
- Multi-user / team workspaces / public sign-up
- Sales pipelines / deal stages

### Architecture Approach

A classic single-user CRUD monolith - one app process, one Postgres database, an S3-compatible object store stub reserved for v3 photos. Routes are thin (parse + validate + call service + render); a `server/services/` layer holds all business logic (lifecycle transitions, attendee linking, tag normalization, last-contacted recomputation, export); a `lib/` of universal Zod validators and date utilities is shared between client and server. The schema is deliberately small (~five tables in v1: people, events, event_attendees, tags, person_tags, notes - plus users/sessions) with v2/v3 designed as drop-in additional tables that don't require touching v1 rows. State management on the client is minimal - server is the source of truth, URL holds filter state, no Redux/Zustand needed.

**Major components:**
1. **Capture Sheet (client)** - Mobile-first bottom-sheet quick-add form with optimistic insert; the hero UX surface
2. **Browse / Search / Stale views (server-rendered)** - RSC-rendered lists with URL-state filters, ranked by `pg_trgm` similarity + `ts_rank`
3. **Service Layer (`server/services/`)** - Pure TypeScript modules: People, Events, Tags, Notes, Search, Export - reusable across server actions, REST endpoints, and CLI/cron
4. **Persistence (Postgres + `pg_trgm` + `tsvector`)** - Single managed Neon Postgres; FTS lives in the same DB; daily logical backup to user-owned cloud drive
5. **Auth (Better Auth)** - Session cookie + Argon2 password (or magic link / passkey); user/session rows live in the same exportable Postgres
6. **Export endpoint** - Streams a full relational JSON dump (and CSV-per-table) - round-trip tested in CI on every phase

### Critical Pitfalls

The pitfalls research is unusually well-corroborated - every one of the top five has killed a real competitor or appeared in Monica's own GitHub issues. Each maps to a verifiable phase-gate criterion.

1. **Capture friction kills daily use** - The #1 cause of personal-CRM abandonment. Required fields beyond `name` are the killer; mobile forms with lost state on back-button compound it. *Avoid:* sub-30s budget, autosave to IndexedDB on every keystroke, only `name` required, two capture surfaces (full form + quick-add note), measure real captures on a real phone during dogfooding.
2. **Mobile experience treated as desktop-shrunk** - Capture happens on a phone, in the wild, on cellular. Server-rendered full-page reloads, sub-44px tap targets, keyboards hiding the save button = no captures = dead product. *Avoid:* mobile-first dev with phone simulator open, sticky bottom save bar, single-column forms, tap targets >=44x44px, dogfood on a real phone over throttled 3G within the first week.
3. **Over-engineered data model paralyses capture and developer** - Modeling Person/Org/Role/Channel/Strength/CustomField upfront balloons the form and migration debt. *Avoid:* five entities max in v1 (People, Events, EventAttendance, Tags, Notes); company/role as plain text on Person until proven; defer v2/v3 tables entirely.
4. **Search that doesn't scale past a few hundred contacts** - Plain LIKE-with-wildcards becomes a multi-second stall at 2k+ rows and breaks the core promise. *Avoid:* Postgres `tsvector` + `pg_trgm` from day one (one CREATE INDEX, not a retrofit); seed 2,000 fake contacts before declaring search done; p95 latency target <100ms.
5. **Lossy export / no real backup -> can't trust the tool with sensitive data** - A single CSV flattens relationships and silently destroys the data model; manual backups never happen. *Avoid:* full relational JSON export as a Phase-1 feature; round-trip import-export test green in CI on every phase; automated daily backup to user-owned off-host storage from day one of going live.

Solo-developer abandonment (Pitfall 7) is the meta-risk that subsumes the others: the antidote is shipping Phase 1 to production within 2-4 weeks, vertical slices not horizontal layers, and a transition checklist that asks "did I actually use this in real life this week?" at every phase boundary.

## Implications for Roadmap

Based on the dependency graph in FEATURES.md, the build-order constraints in ARCHITECTURE.md, and the phase-mapping in PITFALLS.md, the research strongly suggests **five coarse-grained phases**. The decisive insight is that capture UX is not a polish item - it must ship as part of Phase 1 alongside the data model, mobile shell, auth, export, and backup. Anything that compromises sub-30s mobile capture is a Phase-1 blocker.

### Phase 1: Foundation, Auth & Quick-Capture MVP

**Rationale:** Capture, mobile UX, auth, export, and backup are interlocking. Shipping any subset of these alone produces a tool the developer won't dogfood, and the dogfooding data is the prerequisite for validating every later phase. Pitfalls research is unambiguous: capture friction, mobile-as-afterthought, lossy export, and missing auth are each individually fatal - and they share a Phase-1 home.

**Delivers:**
- Project scaffold (Next.js 16 + Tailwind v4 + shadcn/ui + Drizzle + Neon + Vercel)
- Single-user auth (Better Auth, magic link or passkey, rate-limited, no public sign-up)
- Five-entity schema (People, Events, EventAttendance, Tags, Notes) + users/sessions
- Mobile-first responsive layout shell with bottom-sheet quick-capture and full-form deliberate add
- Contact + event CRUD wired through `server/services/` with optimistic UI and autosave-to-IndexedDB
- Contact <-> Event linkage with "how we met" context (the Core Value edge)
- Full relational JSON export endpoint + CSV-per-table variant + automated daily backup to off-host storage
- Round-trip import-export test in CI
- HTTPS-only, Secure/HttpOnly/SameSite cookies, Sentry with PII scrubbing
- Deployed to a real domain end-to-end

**Addresses (features):** Single-user auth, Contact CRUD + tags + notes, Event CRUD + lifecycle state, Contact <-> Event linkage, Mobile-responsive capture, Full data export, HTTPS.
**Avoids (pitfalls):** P1 Capture friction, P2 Mobile UX, P3 Over-engineered model, P6 Lossy export, P7 Solo dev abandonment (by shipping to prod fast), P8 Privacy missteps, P11 TZ/date bugs (DATE columns from day one), P13 Duplicate captures (name-blur fuzzy match), P15 OAuth-only auth.

### Phase 2: Browse, Search & Filter

**Rationale:** Once captures are flowing, the tool has to surface them - otherwise data is write-only and the staleness view in Phase 3 has nothing to compute against. Search uses real query patterns from Phase 1 dogfooding to pick weights and thresholds. The pitfalls research is emphatic: build FTS in from the start of this phase, never as a Phase-N retrofit.

**Delivers:**
- Postgres `tsvector` generated column with weighted fields (name=A, company/role=B, tags=C, notes=D) + GIN index
- `pg_trgm` GIN index on name/company/tags for typo-tolerant typeahead
- Unified search server action with `nuqs`-typed URL state
- Browse views: `/people` (list + filters), `/people/[id]`, `/events` (status-grouped), `/events/[id]` with attendee list
- Filter UI: tag chips, company, event, multi-select
- Search result rows show name + most-recent event + top 2 tags + matched snippet (disambiguation context)
- Tag normalization on save (lowercase) + autocomplete prefers existing tags
- Seeded 2,000-contact performance test in CI; p95 search <100ms

**Uses (stack):** Drizzle raw SQL fragments for FTS DDL and similarity/match operators, shadcn `Command` palette for `Cmd+K` quick lookup, `nuqs` for typed URL params.
**Implements (architecture):** Browse / Search components, Service Layer search module, persistence-layer GIN indexes.
**Avoids (pitfalls):** P4 Search scale, P10 Tag explosion, P12 Result rows lack context.

### Phase 3: Event Lifecycle & Staleness

**Rationale:** With browse and search proven, the differentiating UX layers come next - the planned -> attended -> memory state machine and the pull-based "haven't talked to X" view. Both depend on Phase 1 data + Phase 2 retrieval, and both have specific failure modes (ad-hoc state machine; staleness as guilt machine) that the pitfalls research has prescriptive answers for.

**Delivers:**
- Explicit event status state machine (planned / attended / memory) with transition UI
- Auto-promotion: nightly job (or lazy on-load) flips `planned -> attended` after `starts_at + grace_window`; `attended -> memory` stays manual
- Recompute `last_contacted_at` on transitions and on note appends
- Past-event prompt: "mark attendees, add memory notes" surface
- `/stale` view: capped Top-N stalest contacts (not unbounded), sorted by `last_contacted_at NULLS FIRST`
- "Not a follow-up person" flag + snooze action on contacts
- No push notifications (deferred to v2 per PROJECT.md)
- Append-only Notes timeline on contact detail page

**Avoids (pitfalls):** P5 Staleness becomes a guilt machine, P9 Event lifecycle ad-hoc.

### Phase 4: Sharing & Polish

**Rationale:** Per-record share links are a genuine differentiator (no competitor offers them) and depend on auth being designed to support anonymous-but-signed access - easier to do as a dedicated phase than retrofit. This phase also absorbs the v1.x polish items that emerge from Phases 1-3 dogfooding (tag-merge UI, bulk operations, soft delete, saved filters) - items that PROJECT.md doesn't strictly require but that surface naturally from real use.

**Delivers:**
- Per-record share link: read-only, signed, time-boxed, revocable, explicit field allowlist (never shares private notes by default)
- Share-link audit page (which links are live, revoke individually)
- Tag management UI (rename, merge, delete) - triggered when duplicate/typo tags accumulate
- Bulk operations (multi-select tag, archive) - triggered past ~200 contacts
- Saved filters / pinned views
- Soft delete with 30-day recovery + undo trash
- Empty-state CTAs and result-list virtualization for performance at ~500+ contacts

**Avoids (pitfalls):** P8 Privacy missteps (revisited for share feature; explicit field allowlist + expiry), P14 Birthday feature creep (this phase polishes existing scope; explicitly does not add deferred v2/v3 fields).

### Phase 5: Hardening & v1 Audit

**Rationale:** The last coarse phase is dedicated to verifying everything claimed in Phases 1-4 actually holds - pitfalls research provides an explicit "Looks Done But Isn't" checklist that maps to acceptance criteria, and a milestone audit is the natural home for it. This phase also addresses the Phase-1 backup/restore drill (which is easy to skip but the most important resilience guarantee in a memory tool).

**Delivers:**
- Documented and tested restore procedure (restore a full backup to a scratch instance; record runbook)
- Real-device mobile audit on iOS + Android over cellular (capture 5 contacts thumb-only standing up)
- Performance audit at 2k-contact seeded scale (search p95, list page TTFB, list virtualization)
- Security review pass: auth rate-limit verified, share-link expiry verified, Sentry payload scrubbing verified, no third-party request payloads contain note text
- Round-trip export test extended to every field added in every phase
- Threat model document (one page) finalized
- v1 milestone audit against PROJECT.md Active requirements; promote validated items to "Validated"
- Backlog grooming: v2 (channels, reminders, import) and v3 (photos, tiers, custom fields) staged for next milestone

**Avoids (pitfalls):** All of P1-P12 re-verified; P7 explicitly checked ("did I actually use this app this week?") at the milestone boundary.

### Phase Ordering Rationale

- **Auth + data model + capture + export + mobile shell ship together in Phase 1** because they are mutually load-bearing. Auth without a layout is unusable; capture without export is data-hostile; data model without mobile shell is unhonoured. ARCHITECTURE.md's build-order analysis and PITFALLS.md's phase-mapping both converge on this co-shipping rule.
- **Search comes before staleness** because staleness is a particular query pattern over indexed data - building search infrastructure first means staleness is "one more SELECT" rather than a separate index.
- **Lifecycle + staleness share Phase 3** because the staleness computation depends on event transitions writing `last_contacted_at`, and the past-event "mark attendees" UI is itself a capture-like flow that benefits from Phase 1's capture patterns being settled.
- **Sharing comes after lifecycle** because share-link expiry and the field-allowlist UI both benefit from settled UX patterns - and per-record share has a non-trivial privacy surface that should not be the first thing built on top of fresh auth.
- **Hardening as a final coarse phase** because PITFALLS.md is structured around verification gates and a milestone audit is the right shape for those gates; it also lets v1 ship to "done" before v2 backlog is groomed.

### Research Flags

Phases likely needing deeper research during planning (`/gsd-research-phase` recommended):

- **Phase 1:** *Better Auth + Next.js 16* integration specifics - Better Auth's `middleware -> proxy` rename in Next.js 16 and the Drizzle adapter wiring are recent enough (2026) that official docs should be re-checked via Context7 at planning time. *Sub-30s mobile capture UX* - the design decisions (sheet vs route, autosave granularity, keyboard handling) deserve a focused research/spec pass; competitor reviews give plenty of negative examples but few positive precedents.
- **Phase 1:** *Backup-and-restore mechanics on Neon free tier* - Neon's branching/point-in-time is great, but the user-owned off-host backup leg (GitHub Actions cron hitting an `/internal/backup` endpoint, S3-compatible target with encryption) has specific gotchas worth researching.
- **Phase 2:** *Weighted `tsvector` generated column patterns with Drizzle* - Drizzle supports raw SQL fragments but the GIN-index DDL + generated-column syntax for layered FTS is worth a focused research check.

Phases with standard patterns (skip dedicated research):

- **Phase 3:** Event lifecycle state machines and "last-contacted" denormalization are well-trodden CRUD patterns; ARCHITECTURE.md already specifies the approach.
- **Phase 4:** Soft delete, signed share URLs, and tag-merge are standard patterns.
- **Phase 5:** Hardening / audit is a checklist phase, not a research phase.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified against official sources for May 2026; ecosystem consensus on Drizzle / Better Auth / Tailwind v4 / Neon corroborated across multiple sources. Medium-only on Drizzle 1.0 GA timing (mitigation: pin RC.1) and Better Auth long-term API stability (mitigation: pin minor versions). |
| Features | HIGH | Five competitor products surveyed (Dex, Clay/Mesh, Monica, Cloze, Notion/Airtable templates) with consistent table-stakes pattern; differentiators traced directly to PROJECT.md Active requirements and to whitespace in competitor offerings. |
| Architecture | HIGH | Schema design and data flow are well-trodden CRUD patterns; the single-user-now / multi-user-later forward-compatibility plan is conservative and reversible. v2/v3 schema sketches are MEDIUM (forward-looking) but v1 doesn't depend on them being exactly right. |
| Pitfalls | HIGH | Corroborated across Monica/Dex/Clay reviews, Monica's own GitHub issues, CRM-adoption research, and solo-dev post-mortems. Each top-5 pitfall maps to a verifiable phase-gate criterion. |

**Overall confidence:** HIGH

### Gaps to Address

- **Drizzle 1.0 GA timing.** Currently RC.1 (April 30, 2026). If 1.0.0 stable is not released by Phase 1 kickoff, pin RC.1; the API is frozen, so the risk is procedural rather than functional. Re-check at Phase 1 planning.
- **Better Auth API churn.** Library is young (just hit 1.0 in 2026). Pin minor version and review on each dependency bump. Particularly: the Next.js 16 `middleware -> proxy` rename is the only currently-known breaking touchpoint; verify against Better Auth docs at Phase 1 planning via Context7.
- **Sub-30s mobile capture UX** does not have a single authoritative reference design. The pitfalls research provides negative constraints (no required fields beyond name, autosave to IndexedDB, sticky save bar, 44px+ tap targets) but the positive design space - sheet-vs-route, optimistic-then-merge flow, autosave-conflict resolution - needs a dedicated `/gsd-spec-phase` or `/gsd-ui-phase` before Phase 1 implementation.
- **Neon cold-start latency on free tier.** ~300ms from cold. Capture (write-heavy) tolerates this; typeahead may want a warm-keep-alive ping. Address with empirical measurement in Phase 2, not now.
- **Vercel Hobby commercial-use clause.** Personal use is fine; if the project ever becomes a paid product for others, plan to move to Vercel Pro ($20/mo) or Railway. Flag in the v2+ backlog, not v1.

## Sources

### Primary (HIGH confidence)
- Official Next.js 16 release notes and 16.2 LTS announcement - App Router stability, Turbopack default, React 19.2 integration
- Official Drizzle ORM v1.0.0-rc.1 release notes - verified release-candidate status and API freeze
- Official Better Auth docs - Next.js 16 support, passkey/magic-link plugins, Drizzle adapter
- Official Postgres `pg_trgm` and Full-Text Search documentation - verified trigram operator, GIN index, weighted tsvector patterns
- Tailwind CSS v4 release notes + shadcn/ui Tailwind v4 build docs
- Neon pricing docs - verified free-tier limits (100 CU-hours, 0.5 GB, scale-to-zero)
- Hacker News thread on Monica open-source personal CRM - direct user feedback on data-entry friction
- Monica GitHub Issue #5195 ("Reducing friction when entering data daily") - primary evidence of the capture-friction failure mode
- SQLite FTS5 official docs (informed FTS strategy decision; rejected SQLite in favour of Postgres)
- MDN Web Privacy + PWA Offline guides

### Secondary (MEDIUM confidence)
- Drizzle vs Prisma 2026 comparisons (encore.dev, makerkit.dev) - ecosystem-shift narrative corroborated across multiple sources
- Better Auth vs Lucia vs NextAuth 2026 analyses - corroborated Lucia's maintenance-mode status
- Zod v4 vs Valibot 2026 benchmark - verified perf gains and ecosystem dominance
- Atomic reviews of Monica, Dex, Clay (paolo.blog) - detailed user-side critiques
- Personal-CRM landscape reviews (Muncly, Phi Consulting, Dex blog, Wave Connect)
- Notion / Airtable personal-CRM template documentation - linked-records pattern for events <-> contacts
- CRM-adoption / friction research (Hey DAN, Affinity, Monday.com, Dynamics Success)
- Mobile UX / form design (Smashing Magazine, Zuko Analytics)
- Notification fatigue research (MagicBell, ContextSDK, Smart Contact Reminder marketing copy as inverse evidence)
- Solo-developer abandonment / burnout (Smashing, DEV community threads, 1000.software)
- vCard / CSV / JSON export-format references (Datablist, ClonePartner)

### Tertiary (LOW confidence)
- Single-source observations (e.g., Apple Contacts community thread on slow contact search at scale) used as corroborating anecdote, not foundational claim
- Hosting free-tier comparison aggregator (agentdeals.dev) - used for Vercel Hobby terms verification; cross-check at Phase 1 planning

Full source lists with URLs and per-claim confidence are preserved in the four upstream research files: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md.

---
*Research completed: 2026-05-12*
*Ready for roadmap: yes*
