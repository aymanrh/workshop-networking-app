# Architecture Research

**Domain:** Personal CRM / contact-and-event memory app (single-user, web, mobile-friendly)
**Researched:** 2026-05-12
**Confidence:** HIGH

## Standard Architecture

This is a classic single-user CRUD web app with a relational core, a thin server, and a responsive client. Because the user is one person and the data is sensitive and lifelong, the architecture optimizes for **durability, portability, and capture speed** over horizontal scale. A "boring stack" monolith (one app process + one Postgres database + one object store stub for v3) is the right shape — no microservices, no event bus, no separate search service in v1.

### System Overview

```
+---------------------------------------------------------------+
|                          CLIENT (Browser, mobile-first)      |
|  +-----------+  +-----------+  +-----------+  +-----------+  |
|  | Capture   |  | Browse /  |  | Event     |  | Stale     |  |
|  | Sheet     |  | Search    |  | Timeline  |  | View      |  |
|  +-----+-----+  +-----+-----+  +-----+-----+  +-----+-----+  |
|        |              |              |              |          |
+--------+--------------+--------------+--------------+----------+
         |              |              |              |
         v              v              v              v
+---------------------------------------------------------------+
|                     APP SERVER (single process)               |
|  +-----------------------------------------------------------+|
|  |  Auth (session cookie)  -->  API / Server Actions         ||
|  |                              |                            ||
|  |                              v                            ||
|  |                       Service Layer                       ||
|  |        (People, Events, Tags, Notes, Search, Export)      ||
|  +-----------------------------------------------------------+|
|                              |                                |
+------------------------------+--------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                        PERSISTENCE                            |
|  +---------------+   +------------------+   +---------------+ |
|  | Postgres      |   | Full-text Search |   | Object Store  | |
|  | (primary)     |   | (Postgres FTS    |   | (deferred v3, | |
|  |               |   |  same DB)        |   |  S3-compat)   | |
|  +---------------+   +------------------+   +---------------+ |
|                                                               |
|  Off-system: Daily logical backup -> user-owned cloud drive   |
+---------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Capture Sheet | Sub-30s mobile form to create Person + link to Event | Client component, optimistic insert, server action |
| Browse / Search | List/search/filter People by name, event, tag, company | Server-rendered list + small client filter state |
| Event Timeline | List Events by status (planned / attended / memory) | Server-rendered, status-grouped |
| Stale View | "Haven't seen in N days" derived query | Pure SQL view over People + Events |
| Auth | Gate every route; single user | Session cookie + Argon2 password, magic-link optional |
| Service Layer | Business rules: lifecycle transitions, attendee linking, tag normalization | Plain functions/modules, no DI framework |
| Persistence | Durable storage of normalized entities | Postgres (managed: Neon / Supabase / Fly Postgres) |
| Search Index | Name, note, company, tag fuzzy matching | Postgres `tsvector` + `pg_trgm` (no Elastic) |
| Object Store | Photos (v3 only) | S3-compatible bucket, signed URLs |
| Export | Full JSON / vCard dump on demand | Server endpoint streaming a zipped payload |

## Recommended Project Structure

Optimized for Next.js App Router + Drizzle/Prisma, but the shape applies to any modern full-stack TS framework.

```
src/
├── app/                      # Routes (Next.js App Router)
│   ├── (auth)/login          # Login page
│   ├── (app)/                # Auth-gated layout
│   │   ├── people/           # List, /[id], /new
│   │   ├── events/           # List, /[id], /new
│   │   ├── tags/             # Tag management
│   │   └── stale/            # "Haven't seen in a while"
│   └── api/                  # Export, webhooks (none v1), health
├── server/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema (single source of truth)
│   │   ├── migrations/       # Versioned SQL migrations
│   │   └── client.ts         # Pool + drizzle() instance
│   ├── services/             # Pure business logic, no HTTP
│   │   ├── people.ts         # createPerson, linkToEvent, listStale
│   │   ├── events.ts         # createEvent, transitionStatus
│   │   ├── tags.ts           # upsertTag, applyTag
│   │   ├── notes.ts          # appendNote (polymorphic target)
│   │   └── search.ts         # unified search across entities
│   ├── auth/                 # Session, password hashing, CSRF
│   └── actions/              # Server Actions thin wrappers (validation + service call)
├── lib/
│   ├── validation/           # Zod schemas (shared client/server)
│   ├── date/                 # "Last contacted" computation
│   └── export/               # JSON + vCard serializers
├── components/
│   ├── capture/              # Bottom-sheet quick-capture (mobile-first)
│   ├── people/               # PersonCard, PersonForm, AttendeeChip
│   ├── events/               # EventCard, LifecycleBadge
│   └── ui/                   # Buttons, inputs, sheet primitives
└── styles/
```

### Structure Rationale

- **`server/services/` separate from `app/`:** Routes are thin — they validate input (Zod), call a service, render. Services are pure functions that take the DB client and a typed input. This keeps tests trivial and lets the export endpoint, server actions, and any future CLI share the same code.
- **`server/db/schema.ts` as single source of truth:** Drizzle (or Prisma) generates types from the schema. Adding v2 `contact_channels` or v3 `photos` is one file change + one migration.
- **`lib/` is universal-isomorphic:** validation schemas and date logic run on both client and server — no duplication of "what is a valid email".
- **No `models/` folder:** services hold business logic; DB rows are plain typed objects. Avoids the "anemic vs rich model" debate for a small app.

## Data Model

### Core Tables (v1)

```sql
-- People: the heart of the system
CREATE TABLE people (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  display_name    text,                          -- "Bob from Stripe", optional override
  company         text,
  role            text,
  notes           text,                          -- free-form rich-text or markdown
  first_met_at    timestamptz,                   -- when, even if event_id null
  first_met_event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  last_contacted_at timestamptz,                 -- denormalized, see "last contacted" below
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  search_tsv      tsvector                       -- generated column, see search
);
CREATE INDEX people_search_idx ON people USING GIN (search_tsv);
CREATE INDEX people_last_contacted_idx ON people (last_contacted_at DESC NULLS LAST);
CREATE INDEX people_name_trgm_idx ON people USING GIN (full_name gin_trgm_ops);

-- Events: lifecycle entities (planned -> attended -> memory)
CREATE TABLE events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  location        text,
  starts_at       timestamptz NOT NULL,          -- when it is/was
  ends_at         timestamptz,
  status          text NOT NULL CHECK (status IN ('planned','attended','memory')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_starts_at_idx ON events (starts_at DESC);
CREATE INDEX events_status_idx ON events (status);

-- Attendance: many-to-many People <-> Events
CREATE TABLE event_attendees (
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id       uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role            text,                          -- "speaker", "host", optional
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, person_id)
);
CREATE INDEX event_attendees_person_idx ON event_attendees (person_id);

-- Tags: free-form labels, applied to People only in v1
CREATE TABLE tags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,          -- normalized lowercase
  display_name    text NOT NULL,                 -- as user typed
  color           text,                          -- hex, optional
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE person_tags (
  person_id       uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  tag_id          uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, tag_id)
);
CREATE INDEX person_tags_tag_idx ON person_tags (tag_id);

-- Notes: append-only journal entries, polymorphic target
CREATE TABLE notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type     text NOT NULL CHECK (target_type IN ('person','event')),
  target_id       uuid NOT NULL,
  body            text NOT NULL,
  occurred_at     timestamptz NOT NULL DEFAULT now(),  -- when the thing happened
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notes_target_idx ON notes (target_type, target_id, occurred_at DESC);

-- Auth (single user, but kept generic for sanity)
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  password_hash   text NOT NULL,                 -- Argon2id
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id              text PRIMARY KEY,              -- random 32 bytes, hex
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### Entity Relationships (ER)

```
        users (1) ----< sessions
          ^
          | (implicit owner — single user app; no FK in v1)
          |
   +----- people (N) >---- person_tags ----< (N) tags
   |        ^   ^
   |        |   +----< notes (target_type='person')
   |        |
   |        +----< event_attendees >---- (N) events ----< notes (target_type='event')
   |                                              ^
   +-- first_met_event_id (nullable) ------------+
```

### "Last Contacted" — How It's Computed

Three options were considered; the recommendation is **denormalized column + triggered update**:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Compute on read (subquery) | Always correct, zero write cost | Every list query gets slower; can't index | Reject for stale-view use case |
| Materialized view, refreshed nightly | Fast reads | Stale up to 24h, refresh cost | Reject — defeats "haven't seen lately" precision |
| Denormalized `people.last_contacted_at` updated by trigger/service | Fast reads, indexable, simple stale query | Write-time complexity in one place | **Recommended** |

Definition: `last_contacted_at = MAX(events.starts_at)` across events where the person attended **and** `events.status IN ('attended','memory')`, OR the latest `notes.occurred_at` for notes where `target_type='person' AND target_id=person.id`, whichever is greater.

Implementation: update inside the service layer (not a DB trigger — keeps logic discoverable):
- `addAttendee(person, event)` — if event.status in attended/memory, set `person.last_contacted_at = max(current, event.starts_at)`
- `transitionEvent(event, 'attended')` — for each attendee, update their `last_contacted_at`
- `appendNote(person, body)` — set `person.last_contacted_at = max(current, now())`

The stale view is then: `SELECT * FROM people WHERE last_contacted_at < now() - interval '90 days' OR last_contacted_at IS NULL ORDER BY last_contacted_at NULLS FIRST`.

### Event Lifecycle

A single `status` column is preferred over separate tables. The transitions are:

```
   [planned] ---(starts_at passes)---> [attended] ---(user marks "this is a memory")---> [memory]
        |                                    |
        |                                    +---(user can move back to planned if cancelled)
        |
        +---(user deletes if cancelled before it happened)
```

| From | To | Trigger | Side effects |
|------|-----|--------|--------------|
| `planned` | `attended` | Manual user action *or* scheduled job after `starts_at + grace_window` | Update `last_contacted_at` for all attendees |
| `attended` | `memory` | Manual user action (after notes are written) | None — pure semantic shift; locks "edit mode" UI |
| `planned` | (deleted) | User cancels | Cascade-delete attendees |
| `attended` | `planned` | User mis-clicked, very rare | Recompute `last_contacted_at` for attendees |

**Why one table not three:** All three states share the same attributes (title, date, location, attendees, notes). A status column means tag/index/search code stays simple, and a user can plan an event, attend it, then add memory notes without copying rows. The grammar of the UI changes per status, not the data shape.

**`grace_window`** (e.g., 6 hours after `ends_at`) keeps the UI honest — an event isn't "attended" the instant it starts. A nightly job (or on-load lazy promotion) auto-transitions `planned -> attended`. `attended -> memory` stays manual: it's a deliberate "I've written everything I want to remember about this" act.

## Architectural Patterns

### Pattern 1: Thin Routes, Fat Services

**What:** All HTTP/server-action handlers are 5-15 lines: parse, validate, call service, return. All business logic lives in `server/services/`.
**When to use:** Always. The cost is one extra file per feature; the benefit is total testability and easy reuse across server actions, REST endpoints, and the export job.
**Trade-offs:** Marginal indirection. Worth it past ~5 endpoints.

```typescript
// app/(app)/people/new/action.ts
'use server';
import { createPersonSchema } from '@/lib/validation/people';
import { createPerson } from '@/server/services/people';

export async function action(formData: FormData) {
  const input = createPersonSchema.parse(Object.fromEntries(formData));
  return await createPerson(input);
}
```

### Pattern 2: Single Source of Truth Schema

**What:** Drizzle (or Prisma) schema in one file generates DB migrations *and* TypeScript types. Zod validators import these types or are derived from them with `drizzle-zod`.
**When to use:** Always in TS projects.
**Trade-offs:** Vendor lock-in to one ORM. Mitigated by the SQL being portable — you can dump migrations and walk away.

### Pattern 3: Append-Only Notes

**What:** Notes are never updated, only appended. Editing a note creates a new one and (soft) marks the old. Acts as a personal-memory journal.
**When to use:** When the data is a record of *what you remember*, not a description of current state. Person fields (company, role) are mutable; notes are not.
**Trade-offs:** More rows over time. At 1 note/day for 50 years = 18k rows. Negligible.

### Pattern 4: Polymorphic Notes (with discipline)

**What:** One `notes` table with `(target_type, target_id)`. Avoids `person_notes`, `event_notes` duplication.
**When to use:** When ≥2 entities accept the same payload (free text + timestamp).
**Trade-offs:** No FK enforcement on `target_id`. Mitigated by service layer always going through `appendNote(target, body)`. Acceptable for a single-user app; reconsider at multi-tenant scale.

### Pattern 5: Stale-View as a Pure SQL Concern

**What:** "Haven't seen in a while" is a `SELECT` ordered by `last_contacted_at`, not a job, not a notification system (those are v2).
**When to use:** v1.
**Trade-offs:** No proactive nudge — user has to open the view. v2 adds notifications on top of the same column.

## Data Flow

### Capture Flow (the critical path)

```
User taps "+" on mobile
    |
    v
CaptureSheet opens (already-rendered bottom sheet, no route change)
    |
    v
User types name (+ optional event picker / tags)
    |
    v
Submit -> Server Action: createPerson({name, eventId?, tags[], note?})
    |
    v
services/people.createPerson()
    |--> INSERT people
    |--> INSERT event_attendees (if eventId)
    |--> upsertTag + INSERT person_tags (per tag)
    |--> appendNote (if note)
    |--> recompute last_contacted_at
    |
    v
Return Person {id, ...} -> client patches list optimistically
```

Target: < 30s capture. Bottleneck is typing, not the network. Optimistic UI + server action with revalidation makes the round-trip invisible.

### Browse / Search Flow

```
GET /people?q=ali&tag=stripe&event=devcon-2025
    |
    v
services/people.list({q, filters})
    |
    v
SELECT p.* FROM people p
   LEFT JOIN person_tags pt ON ...
   LEFT JOIN event_attendees ea ON ...
WHERE
   (q IS NULL OR p.search_tsv @@ plainto_tsquery(q) OR p.full_name % q)
   AND (tag IS NULL OR pt.tag_id = ?)
   AND (event IS NULL OR ea.event_id = ?)
ORDER BY p.last_contacted_at DESC NULLS LAST
LIMIT 50;
```

### State Management (Client)

Minimal. The server is the source of truth; the client keeps URL state (query params for filters) + transient form state. **No Redux/Zustand needed.** Use the framework's built-in cache (Next.js `revalidatePath`, TanStack Query if not Next).

### Key Data Flows

1. **Quick capture:** Capture Sheet -> Server Action -> services -> Postgres -> optimistic list update.
2. **Lifecycle promotion:** Cron / on-load lazy check -> services/events.promoteOverdue() -> bulk UPDATE -> recompute `last_contacted_at` for affected attendees.
3. **Export:** GET /api/export -> services/export.dump() -> stream JSON (and vCard variant) -> ZIP -> download.
4. **Stale check:** GET /stale -> services/people.listStale(thresholdDays) -> single indexed SELECT.

## Build Order (Dependencies)

The dependencies dictate this order. Each phase produces something usable.

```
1. Foundation
   ├── Stack scaffolding (framework, DB migration runner, lint/test)
   ├── Auth (single user) + session cookie
   └── Layout shell (mobile-first, responsive)

2. Data layer (no UI)
   ├── people, events, event_attendees, tags, person_tags, notes schemas
   └── services/* (createPerson, createEvent, addAttendee, appendNote, upsertTag)
       *** at this point the app is fully usable via tests / DB seeding ***

3. Read paths
   ├── /people list + /people/[id] detail
   ├── /events list + /events/[id] detail
   └── Search (basic LIKE first, upgrade to tsvector in phase 5)

4. Write paths (Capture)
   ├── /people/new full form
   ├── Mobile quick-capture sheet (the hero flow)
   └── /events/new

5. Search & filter
   ├── Postgres FTS (tsvector generated column + GIN index)
   ├── pg_trgm fuzzy name match
   └── Filter UI (tag, event, company)

6. Lifecycle
   ├── Event status transitions UI
   ├── Auto-promote planned -> attended (cron / lazy)
   └── Stale view (/stale)

7. Export & polish
   ├── JSON export endpoint
   ├── vCard export per-person
   └── Share-link generation (read-only, signed URL) for single contact/event

8. Deploy
   ├── Pick host (Vercel + Neon / Fly + Fly Postgres)
   ├── Daily logical backup to user-owned drive
   └── Domain + HTTPS
```

### Why this order

- **Auth before data** — every endpoint will check it; retrofitting is painful.
- **Data layer before UI** — services tested via unit tests means UI development is 100% additive, not exploratory.
- **Read before write** — easier to verify data exists than to commit to a write API you'll regret. Seed data fills the gap.
- **Search after both read paths** — you need real query patterns to choose the right index.
- **Lifecycle after capture** — capture proves the data model can hold an event; lifecycle is the second-loop validation.
- **Export last in v1** — guarantees the data model is settled before serializing it externally.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (this project) | Monolith on a single small VM or serverless platform. One DB. Daily backup. **This is the entire architecture.** |
| 10s of users (if shared with friends) | Add `user_id` FK to every table + row-level security (Postgres RLS). Add per-user rate limit. |
| 100s of users (real product) | Move auth to a managed service (Clerk/Auth.js + provider). Add Redis for session + cache. CDN-cache the static shell. |
| 1k+ users | Read replicas. Move search to a dedicated index (Meilisearch / Typesense) only when Postgres FTS shows latency. |

### Scaling Priorities

1. **First bottleneck (1+ user):** None expected in v1. Postgres on free tier handles 100k people easily.
2. **Second bottleneck (multi-user):** Lack of `user_id` partitioning — design now to make migration easy (see Forward Compatibility).
3. **Third bottleneck (large notes/photos in v3):** Object store bandwidth and DB row size. Photos go to S3-compatible storage, never as bytea in Postgres.

## Forward Compatibility — v2 and v3

These were explicitly deferred. The v1 schema is designed so they slot in without refactoring existing rows.

### v2: Contact Channels

Drop-in additional table; nothing in v1 changes:

```sql
CREATE TABLE contact_channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id       uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('email','phone','linkedin','x','whatsapp','telegram','signal','other')),
  value           text NOT NULL,                 -- the address/handle
  label           text,                          -- "work", "personal"
  is_primary      boolean NOT NULL DEFAULT false,
  verified_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_channels_person_idx ON contact_channels (person_id);
CREATE UNIQUE INDEX contact_channels_primary_idx
  ON contact_channels (person_id, kind) WHERE is_primary;
```

Companion v2 tables (reminders, imports) follow the same drop-in pattern:

```sql
CREATE TABLE reminders (
  id, person_id, rule (cron-ish), next_due_at, channel, last_sent_at, ...
);
CREATE TABLE imports (
  id, source ('linkedin','google','vcard'), uploaded_at, row_count, status, ...
);
```

**Why v1 doesn't need to know:** the Person row stays untouched. The Person detail view picks up a "Channels" section by checking the new table. Search remains scoped to `people.search_tsv` until you choose to include channel values (one line in the tsvector trigger).

### v3: Photos / Avatars

```sql
CREATE TABLE photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type     text NOT NULL CHECK (target_type IN ('person','event')),
  target_id       uuid NOT NULL,
  storage_key     text NOT NULL,                 -- S3 key
  mime_type       text NOT NULL,
  width           int,
  height          int,
  is_avatar       boolean NOT NULL DEFAULT false,
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX photos_target_idx ON photos (target_type, target_id);
CREATE UNIQUE INDEX photos_avatar_idx
  ON photos (target_type, target_id) WHERE is_avatar;
```

**Key v1 decisions that keep v3 cheap:**
- Use UUIDs for `people.id` from day one (S3 key naming).
- Pick a host with object storage available (Vercel Blob, Fly Volumes, Supabase Storage, R2). Don't put a binary file in Postgres "just for now."
- The `is_avatar` flag means the photo system is reusable for event photo galleries too.

### v3: Relationship Tiers and Custom Fields

```sql
ALTER TABLE people ADD COLUMN tier text CHECK (tier IN ('stranger','acquaintance','friend','close'));
CREATE TABLE custom_fields (
  id, person_id, key, value, type ('text','date','boolean')
);
```

The `tier` column is nullable, so v1 rows continue to work. `custom_fields` is a sidecar table.

### Forward-Compatibility Anti-Patterns to Avoid Now

| Don't | Why | Do instead |
|-------|-----|-----------|
| Stuff a JSONB blob into `people.extra` "for future fields" | Loses typing, indexing, validation; becomes a graveyard | Add columns as needed; JSONB only if truly schemaless |
| Put email/phone columns on `people` "since most people only have one" | Forces a migration when v2 lands (multi-handle is the point) | Leave it for v2's `contact_channels` table; v1 keeps `notes` as the dump-ground |
| Hardcode `single user` everywhere | Multi-user later requires touching every query | Already authenticate against a `users` row; if/when multi-user, add `owner_id` to top-level tables — single migration |

## Anti-Patterns

### Anti-Pattern 1: Microservices for One User

**What people do:** Split People-service, Event-service, Notification-service for "scalability."
**Why it's wrong:** Adds deploy complexity, network failure modes, distributed transaction headaches — for one user. Capture flow becomes slower, not faster.
**Do this instead:** Monolith. One repo, one process, one DB. The service layer separation inside the monolith is the only boundary you need.

### Anti-Pattern 2: Premature External Search Service

**What people do:** Set up Elasticsearch / Meilisearch / Algolia on day 1.
**Why it's wrong:** Postgres FTS + pg_trgm handles ≪ 100k rows with sub-50ms latency. The user has < 10k contacts realistically. Ops cost of a second store dwarfs the benefit.
**Do this instead:** Use `tsvector` generated column + GIN. Only consider a dedicated search store if Postgres FTS measurably struggles in production.

### Anti-Pattern 3: Photos in the Database

**What people do:** Store `bytea` images in Postgres "until we move them later."
**Why it's wrong:** Bloats backups, slows every list query that pulls the row, makes export huge. Migration later is painful.
**Do this instead:** Reference an external object store from day one — even if photos are deferred to v3, the `photos` table only has `storage_key`, never bytes.

### Anti-Pattern 4: Email/Phone as First-Class Columns on Person

**What people do:** `people.email`, `people.phone` columns on Person.
**Why it's wrong:** v2 explicitly wants multiple handles per person. You'll dual-write or migrate later.
**Do this instead:** Capture channels as free-form text inside `notes` in v1, then migrate to `contact_channels` in v2. Or, if early adopters need it, ship `contact_channels` early — but never put a single email column on Person.

### Anti-Pattern 5: Treating Events as Tags

**What people do:** "Met at DevCon 2025" is just a tag.
**Why it's wrong:** Events have a date, a location, a lifecycle, and a list of *other* people you met there. Tags can't do any of that.
**Do this instead:** First-class `events` table with status. PROJECT.md already enshrines this as a Key Decision.

### Anti-Pattern 6: Sync All-The-Things in Capture

**What people do:** Capture form blocks on tag autocomplete, company lookup, etc.
**Why it's wrong:** The user is mid-conversation. Every blocking call kills the 30-second target.
**Do this instead:** Optimistic insert. Save name + raw tag strings instantly; resolve/upsert tags server-side. Show suggestions but don't require them.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Postgres (managed: Neon / Supabase / Fly Postgres) | Standard pooled connection from app | Pick one offering serverless-friendly pooling (PgBouncer transaction mode) |
| Object storage (v3) | S3-compatible client + signed URLs | Decoupled from DB; user can self-host on Backblaze B2 or use Cloudflare R2 (no egress fees) |
| Email (v2 reminders) | Resend / Postmark via simple SDK | Defer entirely until v2 — no SMTP in v1 |
| Backup target | `pg_dump` cron to user-owned Drive/S3 | Owned by user, never the app vendor; aligns with "data is mine" constraint |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Route handler ↔ Service | Direct function call | Always — services are pure TS, no HTTP layer |
| Service ↔ DB | Drizzle/Prisma query | Single client instance, transaction-aware |
| Service ↔ Service | Direct function call | E.g., `events.transitionStatus()` calls `people.recomputeLastContacted()` |
| Server ↔ Client | Server Actions (Next.js) or REST | Prefer Server Actions for forms; REST for export endpoint |

## Sources

- PostgreSQL Full-Text Search docs: https://www.postgresql.org/docs/current/textsearch.html (HIGH confidence)
- `pg_trgm` for fuzzy matching: https://www.postgresql.org/docs/current/pgtrgm.html (HIGH)
- Next.js App Router + Server Actions: https://nextjs.org/docs/app (HIGH — verify current minor version at build time via Context7)
- Drizzle ORM schema patterns: https://orm.drizzle.team/docs/sql-schema-declaration (HIGH)
- Single-user app design patterns: derived from general practice (MEDIUM — opinionated synthesis, not from one authoritative source)
- Polymorphic association trade-offs: general Rails/ActiveRecord wisdom, applied with discipline (MEDIUM)

**Confidence notes:**
- Schema design and data flow: HIGH (well-trodden CRUD patterns).
- Specific stack version pins: deferred to STACK.md researcher; this doc is stack-shaped but stack-agnostic.
- "Use Postgres FTS not Elastic at this scale": HIGH (Postgres FTS scales to millions of small docs in many production reports).
- v2/v3 schema sketches: MEDIUM — they're forward-looking and may shift, but the v1 schema doesn't depend on them being exactly right.

---
*Architecture research for: personal CRM / contact + event memory app*
*Researched: 2026-05-12*
