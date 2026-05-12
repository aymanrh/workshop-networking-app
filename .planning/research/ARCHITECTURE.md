# Architecture Patterns

**Project:** Networking App
**Researched:** 2026-05-12
**Overall confidence:** HIGH

This document captures the recommended architecture for a Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + IndexedDB (Dexie) workshop demo app. Every recommendation has been cross-checked against current Next.js 15 and Dexie documentation (sources at bottom).

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (the only runtime — no server, no API)              │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Next.js App Router (output: 'export' — static SPA)     │ │
│  │                                                         │ │
│  │  app/                                                   │ │
│  │   ├─ layout.tsx       (server — shell, fonts, theme)    │ │
│  │   ├─ page.tsx         ("use client" — Home dashboard)   │ │
│  │   ├─ people/          (list, detail, add)               │ │
│  │   ├─ events/          (list, detail, add)               │ │
│  │   ├─ search/                                            │ │
│  │   └─ settings/                                          │ │
│  │                                                         │ │
│  │  components/ui/    (shadcn primitives)                  │ │
│  │  components/<feature>/                                  │ │
│  │  hooks/            (useLiveQuery wrappers)              │ │
│  └──────────────┬──────────────────────────────────────────┘ │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Data Layer (lib/db/)                                   │ │
│  │   db.ts         — Dexie instance + schema versions      │ │
│  │   types.ts      — Person, Event, Touch interfaces       │ │
│  │   repositories/ — peopleRepo, eventsRepo, touchesRepo   │ │
│  │   migrations/   — schema upgrade functions              │ │
│  │   seed/         — fixtures + loadSeed()                 │ │
│  └──────────────┬──────────────────────────────────────────┘ │
│                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  IndexedDB (browser-native, via Dexie)                  │ │
│  │   stores: people | events | touches | meta              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Key idea:** Next.js is doing two jobs only — (1) build-time bundling/routing, (2) static HTML/CSS/JS emission. At runtime it is effectively a React SPA. All data lives in the user's IndexedDB and is queried reactively through `useLiveQuery`. No `fetch`, no API routes, no server components that touch data.

---

## Recommended Directory Layout

```
networking-app/
├─ app/
│  ├─ layout.tsx                  # Server component — html shell, fonts, ThemeProvider, AppShell
│  ├─ globals.css                 # Tailwind + design tokens
│  ├─ not-found.tsx               # 404 (static export needs this at root)
│  ├─ loading.tsx                 # Top-level skeleton
│  ├─ error.tsx                   # Top-level error boundary
│  │
│  ├─ page.tsx                    # "use client" — Home dashboard
│  │
│  ├─ people/
│  │  ├─ page.tsx                 # "use client" — list + search/filter
│  │  ├─ new/
│  │  │  └─ page.tsx              # "use client" — Add Person (full screen on mobile)
│  │  └─ [id]/
│  │     ├─ page.tsx              # "use client" — Person detail (timeline)
│  │     └─ loading.tsx           # Skeleton while Dexie query runs
│  │
│  ├─ events/
│  │  ├─ page.tsx
│  │  ├─ new/
│  │  │  └─ page.tsx
│  │  └─ [id]/
│  │     ├─ page.tsx
│  │     └─ loading.tsx
│  │
│  ├─ search/
│  │  └─ page.tsx
│  │
│  └─ settings/
│     └─ page.tsx                 # Seed data toggle, reset DB, theme, export/import
│
├─ components/
│  ├─ ui/                         # shadcn primitives (Button, Dialog, Sheet, Sidebar, …)
│  ├─ shell/                      # AppShell, Sidebar (desktop), BottomNav (mobile), TopBar
│  ├─ people/                     # PersonCard, PersonListItem, PersonForm, ClosenessChip, TagList
│  ├─ events/                     # EventCard, EventForm, AttendeePicker
│  ├─ touches/                    # TouchTimeline, TouchComposer
│  ├─ common/                     # EmptyState, ErrorState, PageHeader, FAB, ConfirmDialog
│  └─ first-run/                  # SeedPrompt (first-load dialog)
│
├─ hooks/
│  ├─ use-people.ts               # useLiveQuery wrappers: usePeople, usePerson, useFollowUpsToday
│  ├─ use-events.ts               # useUpcomingEvents, usePastEvents, useEvent
│  ├─ use-touches.ts              # useTouchesForPerson, useTouchesForEvent
│  ├─ use-media-query.ts          # from shadcn — drives responsive Dialog vs Drawer
│  └─ use-first-run.ts            # reads meta store, returns { firstRun, dismiss, loadSeed }
│
├─ lib/
│  ├─ db/
│  │  ├─ index.ts                 # re-exports db + repos
│  │  ├─ db.ts                    # Dexie instance + all version().stores() calls
│  │  ├─ types.ts                 # Person, Event, Touch, Meta, Closeness, TouchType
│  │  ├─ repositories/
│  │  │  ├─ people.ts             # createPerson, updatePerson, deletePerson, query helpers
│  │  │  ├─ events.ts
│  │  │  ├─ touches.ts
│  │  │  └─ meta.ts               # firstRunComplete flag, settings
│  │  └─ migrations/
│  │     └─ v1.ts                 # only one for v1; subsequent versions add files here
│  │
│  ├─ seed/
│  │  ├─ people.ts                # Sara Kim, Kareem Tate, Mason Lee, …
│  │  ├─ events.ts                # sample events
│  │  ├─ touches.ts               # sample touchpoints linking the above
│  │  └─ load-seed.ts             # idempotent: skips if data exists
│  │
│  ├─ utils.ts                    # cn() helper (shadcn)
│  ├─ date.ts                     # formatRelative, isToday, isFollowUpDue
│  └─ id.ts                       # ulid() or crypto.randomUUID() wrapper
│
├─ public/
│  └─ favicon.svg, icons, …       # static assets only — no runtime API calls
│
├─ test/
│  ├─ setup.ts                    # registers fake-indexeddb/auto
│  └─ repositories/
│     └─ people.test.ts           # repo-level unit tests
│
├─ next.config.ts                 # output: 'export', images.unoptimized, basePath via env
├─ tailwind.config.ts
├─ components.json                # shadcn config
├─ tsconfig.json
├─ vitest.config.ts
├─ package.json
└─ README.md
```

### Per-directory rationale

- **`app/`** — only routing + page components. Pages are thin shells that call hooks and render feature components. No business logic.
- **`components/ui/`** — untouched shadcn primitives (so attendees recognize them and `npx shadcn add` keeps working).
- **`components/<feature>/`** — domain components grouped by entity. Easier than alphabetical when 20+ files land.
- **`hooks/`** — every Dexie query a page needs gets a named hook here. Pages never call `db.people.toArray()` directly — they call `usePeople()`. Makes data access discoverable and mockable.
- **`lib/db/`** — single source of truth for schema and writes. Pages and hooks read via `useLiveQuery`; *writes* always go through repositories so we have one place to add validation/logging/migrations later.
- **`lib/seed/`** — pure data + a loader. Workshop demo gold.
- **`test/`** — colocating tests under repos keeps the DB layer airtight; we don't need component tests for v1.

---

## Data Layer

### Dexie Schema

```typescript
// lib/db/types.ts
export type Closeness = "close" | "warm" | "cooling";
export type TouchType = "meet" | "message" | "note";

export interface Person {
  id: string;            // ulid()
  name: string;
  role?: string;
  company?: string;
  tags: string[];        // multiEntry indexed
  notes?: string;
  closeness: Closeness;
  createdAt: number;     // epoch ms
  lastContactAt?: number;
  followUpAt?: number;
}

export interface Event {
  id: string;
  name: string;
  date: number;          // epoch ms
  location?: string;
  tags: string[];
  attendees: string[];   // Person.id[]
  status: "interested" | "going" | "attended";
}

export interface Touch {
  id: string;
  personId: string;
  eventId?: string;
  type: TouchType;
  timestamp: number;
  body: string;
}

export interface Meta {
  key: string;           // "firstRunComplete", "theme", …
  value: unknown;
}
```

```typescript
// lib/db/db.ts
import Dexie, { type EntityTable } from "dexie";
import type { Person, Event, Touch, Meta } from "./types";

export const db = new Dexie("NetworkingApp") as Dexie & {
  people:  EntityTable<Person, "id">;
  events:  EntityTable<Event,  "id">;
  touches: EntityTable<Touch,  "id">;
  meta:    EntityTable<Meta,   "key">;
};

db.version(1).stores({
  // & = unique, * = multiEntry. Index everything we filter/sort by.
  people:  "id, name, closeness, lastContactAt, followUpAt, *tags",
  events:  "id, date, status, *tags, *attendees",
  touches: "id, personId, eventId, timestamp, type",
  meta:    "key",
});
```

**Notes on the schema string syntax** (one of the most-asked Dexie questions in workshops):
- First token = primary key. We're using string ULIDs (`id`), so we do *not* prefix with `++` (auto-increment).
- Comma-separated tokens after = indexed fields.
- `*tags` makes `tags[]` a multiEntry index — `db.people.where("tags").equals("AI").toArray()` becomes O(log n).
- `*attendees` lets us answer "which events did person X attend?" by index instead of scan.

### Repository Pattern

Use a thin functional repository — no classes, no DI container. Every write funnels through here; reads bypass it via `useLiveQuery`.

```typescript
// lib/db/repositories/people.ts
import { db } from "../db";
import { ulid } from "@/lib/id";
import type { Person, Closeness } from "../types";

export type NewPerson = Omit<Person, "id" | "createdAt" | "closeness" | "tags"> & {
  tags?: string[];
  closeness?: Closeness;
};

export async function createPerson(input: NewPerson): Promise<string> {
  const id = ulid();
  await db.people.add({
    id,
    createdAt: Date.now(),
    tags: input.tags ?? [],
    closeness: input.closeness ?? "warm",
    ...input,
  });
  return id;
}

export async function updatePerson(id: string, patch: Partial<Person>) {
  await db.people.update(id, patch);
}

export async function deletePerson(id: string) {
  await db.transaction("rw", db.people, db.touches, async () => {
    await db.touches.where("personId").equals(id).delete();
    await db.people.delete(id);
  });
}
```

**Why functional repos over classes:**
- Workshop attendees can read top-to-bottom.
- Tree-shakable: an unused function literally disappears from the bundle.
- Tests just import the function — no setup ceremony.

**Read pattern (in a hook, not a repo):**

```typescript
// hooks/use-people.ts
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

export function usePeople() {
  return useLiveQuery(() => db.people.orderBy("name").toArray(), []);
}

export function usePerson(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.people.get(id) : undefined),
    [id]
  );
}

export function useFollowUpsToday() {
  return useLiveQuery(() => {
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    return db.people
      .where("followUpAt")
      .belowOrEqual(endOfToday)
      .toArray();
  }, []);
}
```

`useLiveQuery` re-runs automatically when any mutation touches the involved tables — this is the magic that lets us avoid Redux/Zustand entirely for v1.

### Migrations

Dexie versioning is additive. **Never edit a previous `.version().stores()` block once shipped** — always append a new one.

```typescript
// lib/db/db.ts (future v2 example — DO NOT add for v1)
db.version(2).stores({
  people: "id, name, closeness, lastContactAt, followUpAt, *tags, company",
}).upgrade(async (tx) => {
  await tx.table("people").toCollection().modify((p) => {
    p.company = p.company ?? "";
  });
});
```

For v1, one `version(1)` block is enough. Document this rule in a comment above it so workshop forks don't accidentally mutate v1.

### Testing with fake-indexeddb

```typescript
// test/setup.ts
import "fake-indexeddb/auto";
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",        // no jsdom needed for repo tests
    setupFiles: ["./test/setup.ts"],
  },
});
```

```typescript
// test/repositories/people.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";
import { createPerson, deletePerson } from "@/lib/db/repositories/people";

beforeEach(async () => {
  await db.delete();          // wipe IndexedDB between tests
  await db.open();
});

describe("people repo", () => {
  it("creates a person with defaults", async () => {
    const id = await createPerson({ name: "Sara Kim" });
    const row = await db.people.get(id);
    expect(row?.closeness).toBe("warm");
    expect(row?.tags).toEqual([]);
  });

  it("cascade-deletes touches", async () => {
    const id = await createPerson({ name: "Mason" });
    await db.touches.add({ id: "t1", personId: id, type: "note", timestamp: Date.now(), body: "hi" });
    await deletePerson(id);
    expect(await db.touches.count()).toBe(0);
  });
});
```

`fake-indexeddb/auto` shims `indexedDB` globally — zero config. Dexie works against it identically.

---

## Client/Server Component Split

**Rule of thumb:** anything that touches `db.*` is a client component. Anything that's pure shell can stay on the server.

| File                          | Component type   | Why                                                              |
|-------------------------------|------------------|------------------------------------------------------------------|
| `app/layout.tsx`              | **server**       | HTML shell, fonts, `<ThemeProvider>` wrapper. Doesn't read data. |
| `app/page.tsx` (Home)         | **client**       | Uses `useLiveQuery` for follow-ups/counts.                       |
| `app/people/page.tsx`         | **client**       | List driven by `usePeople()`.                                    |
| `app/people/[id]/page.tsx`    | **client**       | `useParams()` + `usePerson(id)`.                                 |
| `app/people/new/page.tsx`     | **client**       | Form with `createPerson()`.                                      |
| `app/events/...`              | **client**       | Same reasoning.                                                  |
| `app/settings/page.tsx`       | **client**       | Reads/writes meta store.                                         |
| `loading.tsx` files           | **server**       | Pure JSX skeletons.                                              |
| `error.tsx` files             | **client** (req) | Next.js requires `"use client"` for error boundaries.            |
| `components/shell/AppShell`   | **client**       | Uses `usePathname()`, media queries.                             |
| `components/ui/*` (shadcn)    | mixed            | Most need `"use client"` (Radix uses hooks); leave as shadcn ships them. |
| Feature components            | **client**       | Easier — they all hit data layer or interact.                    |

**SSR/SSG render with no data:** every data-bound client component starts with `useLiveQuery` returning `undefined`. Use this as the loading signal:

```tsx
const people = usePeople();
if (people === undefined) return <PeopleListSkeleton />;
if (people.length === 0)  return <EmptyState ... />;
return <PeopleList items={people} />;
```

The static HTML emitted at build time will be the skeleton. Hydration kicks in, Dexie opens, first query resolves, real list paints. No SSR mismatch because the server output IS the skeleton state.

**Avoid:** `typeof window !== "undefined"` guards. They cause hydration mismatches. Instead, just gate on `useLiveQuery() === undefined` — Dexie is only imported by client components, so it never runs at build time.

---

## Responsive Layout Strategy

**One responsive layout, not two.** Mobile-first Tailwind. The same React tree adapts.

```tsx
// components/shell/AppShell.tsx
"use client";
import { Sidebar } from "./Sidebar";       // desktop (md+)
import { BottomNav } from "./BottomNav";   // mobile (<md)
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      <div className="md:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-4 md:pb-8 md:px-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav className="md:hidden" />
    </div>
  );
}
```

**Patterns:**
- **Mobile-first Tailwind:** default styles are phone-sized; `md:` breakpoint (768px) flips to desktop layout. Skip container queries for v1 — page-level breakpoints are sufficient.
- **Mobile nav = fixed bottom tab bar** (Home / People / Events / Search). Use shadcn `<NavigationMenu>` primitives or a hand-rolled tab bar; the shadcn `<Sidebar>` collapses to a Sheet on mobile, but a bottom tab bar matches the wireframes better and feels more native.
- **Desktop nav = shadcn `<Sidebar>`** in `collapsible="icon"` mode. Use `<SidebarProvider>` at the layout level.
- **Master-detail on desktop:** at `lg:` (≥1024px), `/people` can render as a two-column layout — list on the left, selected person detail on the right (linked by query param `?id=` or by intercepting `/people/[id]` with a parallel route). For v1, **stick to simple stacked navigation** — master-detail can be a Phase 5 polish item.
- **Add flows on mobile:** full-screen dedicated route (`/people/new`). On desktop, the same form opens in a **shadcn Dialog**. Use the **responsive Dialog/Drawer pattern** from shadcn docs (Dialog on desktop, Drawer on mobile), but for *primary create* flows we prefer the dedicated route on mobile so the back button works as expected.

### Modal/Sheet decision matrix

| Action                              | Mobile          | Desktop      | Why                          |
|-------------------------------------|-----------------|--------------|------------------------------|
| Add person / Add event              | Full route      | Dialog       | Long form, deserves the URL  |
| Quick add a touchpoint              | Drawer (bottom) | Dialog       | Short, contextual            |
| Edit person field inline            | Drawer          | Popover      | Lightweight                  |
| Confirm delete                      | Dialog          | Dialog       | Always modal                 |
| Filters on People list              | Sheet (right)   | Inline panel | Filters are persistent state |

---

## Routing & Navigation

### Routes (final list for v1)

```
/                        Home dashboard
/people                  People list
/people/new              Add person (mobile route; desktop opens as Dialog from anywhere)
/people/[id]             Person detail
/events                  Events list
/events/new              Add event
/events/[id]             Event detail
/search                  Global search
/settings                Settings
```

### `loading.tsx` and `error.tsx`

- One `loading.tsx` at root for app boot (rare — Dexie opens fast).
- Per-section `loading.tsx` inside `app/people/`, `app/events/` — these render skeleton list rows.
- One root `error.tsx` (must be `"use client"`) catching unexpected crashes with a "Reset database" escape hatch.

### Bottom nav visibility rules

- **Always show** on `/`, `/people`, `/events`, `/search`, `/settings`.
- **Hide** on `/people/new`, `/events/new`, and the `[id]` detail pages (replaced by a back-arrow TopBar). This is a render-time check in `AppShell` against `usePathname()`.

### Modal patterns recap (shadcn)

- **`<Dialog>`** — desktop "Add person", confirm delete, edit popovers when content is large.
- **`<Sheet>`** — slide-in panels (filters, contextual edit). Right side on desktop, top/bottom on mobile.
- **`<Drawer>`** — bottom drawer on mobile only (the shadcn `<Drawer>` is built on Vaul). Use for quick touchpoint composer.

---

## Static Export Specifics

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const repo = "networking-app"; // GitHub repo name, only used when deploying to Pages

const nextConfig: NextConfig = {
  output: "export",                          // emits ./out as a static SPA
  images: { unoptimized: true },             // no server image optimizer in static mode
  trailingSlash: true,                       // GitHub Pages serves /people/ not /people
  basePath: isPages ? `/${repo}` : undefined,
  assetPrefix: isPages ? `/${repo}/` : undefined,
};

export default nextConfig;
```

- **Vercel deploy:** no env var → `basePath` is undefined → works at root.
- **GitHub Pages deploy:** set `GITHUB_PAGES=true` in the build step → app is served under `/networking-app/`.
- **Local dev:** `npm run dev` works with either setting.

### Dynamic routes `[id]` with static export — the actual solution

This is the trap. User-data IDs are unknown at build time, so `generateStaticParams` can't return them. There are three viable patterns. **We recommend Pattern A.**

#### Pattern A (recommended) — `generateStaticParams` returns empty + force-static + client `useParams`

```tsx
// app/people/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { usePerson } from "@/hooks/use-people";
import { PersonDetail } from "@/components/people/PersonDetail";
import { PersonDetailSkeleton } from "@/components/people/PersonDetailSkeleton";

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const person = usePerson(id);

  if (person === undefined) return <PersonDetailSkeleton />;
  if (person === null)      return <NotFoundCard id={id} />;
  return <PersonDetail person={person} />;
}
```

```tsx
// app/people/[id]/page.tsx — colocated server file (NOT inside the "use client" file)
// In App Router, route segment config like generateStaticParams must be in a separate
// non-"use client" file OR the page itself must be a server component. The cleanest
// workaround for client pages is to add a tiny server wrapper:

// app/people/[id]/layout.tsx  ← server component
export const dynamicParams = false;        // anything not pre-generated 404s in pure SSG —
                                           // BUT with output: 'export', the build emits
                                           // a single HTML file that handles all IDs
                                           // client-side. See note below.

export async function generateStaticParams() {
  return [];                                // no IDs known at build time
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Important caveat:** as of Next.js 15.x, exporting an empty `generateStaticParams` from a `"use client"` page is allowed. The build emits a fallback HTML that hydrates and reads `useParams()` on the client. This is the pattern the Next.js team officially blesses for SPA-style static export. See sources.

If you hit `Page is missing 'generateStaticParams()' so it cannot be used with 'output: export'`, the fix is to add the `generateStaticParams` export — even returning `[]` is enough.

#### Pattern B (alternative) — query-param routing
Use `/person?id=abc` instead of `/person/[abc]`. Eliminates the dynamic segment entirely. We **don't recommend** this for v1 — uglier URLs and worse "shareability" inside the app.

#### Pattern C — pre-generate seed IDs only
If seed-data IDs are known constants, you could return them from `generateStaticParams`. User-created people would still need fallback handling. **Not worth the complexity.**

### Image handling

- No `next/image` optimization at runtime (static export disables it).
- Set `images: { unoptimized: true }` in `next.config.ts`.
- For avatars/initials, render an SVG/CSS circle with initials. Don't ship raster avatars in v1.

---

## Seed Data Architecture

### Files

```
lib/seed/
├─ people.ts         # export const SEED_PEOPLE: Person[]
├─ events.ts         # export const SEED_EVENTS: Event[]
├─ touches.ts        # export const SEED_TOUCHES: Touch[]
└─ load-seed.ts      # loadSeed(): idempotent loader
```

### First-run detection

Use a `meta` row, not localStorage — keeps everything in one place:

```typescript
// hooks/use-first-run.ts
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { loadSeed } from "@/lib/seed/load-seed";

export function useFirstRun() {
  const flag = useLiveQuery(() => db.meta.get("firstRunComplete"), []);
  const peopleCount = useLiveQuery(() => db.people.count(), []);

  // undefined while Dexie boots; treat as "first run" only when we know it's empty
  const isFirstRun =
    flag !== undefined && peopleCount !== undefined &&
    !flag?.value && peopleCount === 0;

  async function dismiss(loadSeedData: boolean) {
    if (loadSeedData) await loadSeed();
    await db.meta.put({ key: "firstRunComplete", value: true });
  }

  return { isFirstRun, dismiss };
}
```

### UX

- `<FirstRunDialog>` in `AppShell` listens for `isFirstRun === true` and renders a shadcn Dialog with two buttons: **"Load sample data"** and **"Start empty"**. Either choice writes `firstRunComplete = true`.
- The Settings page exposes **"Reset & reload sample data"** and **"Wipe all data"** for workshop facilitators who want to re-demo.

### `loadSeed()` is idempotent

```typescript
export async function loadSeed() {
  await db.transaction("rw", db.people, db.events, db.touches, async () => {
    if (await db.people.count() > 0) return;     // never overwrite real data
    await db.people.bulkAdd(SEED_PEOPLE);
    await db.events.bulkAdd(SEED_EVENTS);
    await db.touches.bulkAdd(SEED_TOUCHES);
  });
}
```

---

## Theming for Linear/Notion Vibe

### shadcn customizations

Start from the shadcn `new-york` style (slightly tighter spacing, more refined than `default`). Then adjust tokens in `app/globals.css`:

```css
@layer base {
  :root {
    --background:         0 0% 100%;
    --foreground:         240 10% 4%;
    --muted:              240 5% 96%;
    --muted-foreground:   240 4% 46%;
    --border:             240 6% 90%;
    --primary:            240 6% 10%;        /* near-black, Linear-style */
    --primary-foreground: 0 0% 98%;
    --accent:             240 5% 96%;
    --radius:             0.5rem;            /* 8px — tighter than shadcn default 0.75 */
  }
  .dark {
    --background:         240 10% 4%;
    --foreground:         0 0% 98%;
    --muted:              240 4% 12%;
    --muted-foreground:   240 5% 65%;
    --border:             240 4% 16%;
    --primary:            0 0% 98%;
    --primary-foreground: 240 6% 10%;
  }
}
```

### Type scale (Linear-ish)

- **Font:** Geist or Inter — `next/font/google` (statically loaded).
- **Sizes:** 12 / 13 / 14 / 16 / 20 / 24 / 32 — favor 14px body, 13px UI chrome.
- **Line heights:** generous on body (1.6), tight on UI (1.3).
- **Weight scale:** 400 / 500 / 600. Avoid 700.

### Spacing scale

Stick to Tailwind defaults but be disciplined: 1, 2, 3, 4, 6, 8, 12, 16. Avoid arbitrary values.

### Dark mode

**Yes for v1**, system-default. shadcn ships `<ThemeProvider>` from `next-themes` — wire it up in `app/layout.tsx`. Add a toggle in Settings. Dark mode is one of the cheapest "feels polished" wins.

### Density

Linear/Notion are mid-density. Use:
- 40px (`h-10`) for primary buttons and inputs.
- 32px (`h-8`) for compact buttons in toolbars.
- 56–64px for list rows (room for avatar + 2 lines + closeness chip).

---

## Suggested Phase Order

| Phase | Goal | Builds | Enables |
|-------|------|--------|---------|
| **P1: Foundation** | Working app shell on a phone and a 27" monitor | Next.js scaffold, `output: 'export'`, Tailwind, shadcn init, design tokens, `AppShell`/`Sidebar`/`BottomNav`/`TopBar`, empty routes for all 6 sections, Dexie schema v1, repositories skeleton, fake-indexeddb test setup, deploy pipeline to GitHub Pages | Everything below — and gives the workshop its first satisfying "it looks like a real app" moment |
| **P2: People CRUD** | Add, list, view, edit, delete people | `createPerson` flow (form + validation), People list with `usePeople`, Person detail with `usePerson`, ClosenessChip, TagList, EmptyState, loading skeletons | Demonstrates the full data-layer round trip on the entity that matters most |
| **P3: Events + Linking** | Add events, attach people, see them from a person's profile | Events CRUD, AttendeePicker (multi-select from people), Person detail shows linked events, Event detail shows attendees | Proves the relational story in IndexedDB without a server; the cross-entity navigation is where "this is a real CRM" lands |
| **P4: Touchpoints + Follow-ups + Closeness** | The "nudges" loop that makes this a CRM, not a Rolodex | Touch composer, TouchTimeline on Person detail, `followUpAt` field, today's follow-ups card on Home, closeness state transitions, last-contact recency surfacing | Validates the core value prop ("a CRM that nudges you") |
| **P5: Polish, Search, Seed, Deploy** | Workshop-ready demo | Global search across people/events/touches/tags, Settings page (reset, seed, theme toggle, export/import), first-run dialog with rich seed data, Home dashboard final layout, deploy to GitHub Pages + Vercel, README for forkers | Ship-quality demo ready for 2026-05-30 |

### Rationale for this ordering

1. **Foundation first** — building the shell (including bottom nav + sidebar + theme) before any data feature means every subsequent phase plugs into a finished frame. Workshop attendees see "real app" within 60 minutes of starting.
2. **People before Events** — Person is the primary entity. Events without People is meaningless; People without Events is still useful. Always build the keystone entity first.
3. **Linking after both exist** — trying to design linking before both entities exist leads to schema churn. We pre-declared `attendees: string[]` in schema v1 so no migration is needed when P3 lands.
4. **Touchpoints + follow-ups together** — they share the same Person-detail surface and the same Home dashboard widget. Splitting them creates double UI work.
5. **Search/seed/polish last** — search needs all entities to exist. Seed data is best designed last when the data model is locked. Polish must come after features so you're not re-polishing.

**Slack in the schedule:** P1 is the biggest and most error-prone (deploy + static export + Dexie boot all happen here). Budget ~30% of total time for it. P5 must be a hard deadline ~3 days before the workshop so seed data can be tested live.

---

## Anti-Patterns to Avoid

1. **Don't render `db.*` from server components.** Dexie depends on `window.indexedDB`. Any `app/page.tsx` without `"use client"` will crash the build or throw "indexedDB is not defined" at runtime.
2. **Don't `typeof window !== "undefined"` guard everywhere.** It causes hydration mismatches and makes the code look like it's hiding a bug. Just put `"use client"` at the top of files that touch Dexie.
3. **Don't read data through repositories.** Repos are for **writes** and complex transactions. **Reads** go through `useLiveQuery` so the UI updates automatically when data changes.
4. **Don't put `useLiveQuery` directly in pages.** Wrap them in named hooks (`usePeople`, `usePerson`) so swapping the data layer later is one file change.
5. **Don't edit `db.version(1).stores(...)` after first run.** That breaks every existing user's IndexedDB. Append `db.version(2)` with an upgrade function instead.
6. **Don't auto-increment IDs (`++id`).** Use ULIDs/UUIDs. Auto-incrementing breaks if you ever export/import or run two tabs simultaneously, and it leaks "I created 3 things" information.
7. **Don't use `next/image` with remote URLs in static export.** It silently breaks at build time. Stick to local `public/` assets and `<img>` tags or rendered SVG avatars.
8. **Don't try to pre-generate `[id]` routes from a build-time data source.** User data is per-browser; there is nothing to pre-generate. Return `[]` from `generateStaticParams` and let the client handle it.
9. **Don't ship localStorage *and* IndexedDB.** All persistence belongs in Dexie. The single exception is `next-themes`, which uses localStorage internally — leave it alone, that's a UI concern not data.
10. **Don't skip `loading.tsx` for `[id]` routes.** The static HTML for `/people/[id]` is identical across all IDs; without skeletons users see a flash of empty content before Dexie resolves.
11. **Don't fetch in `useEffect` to load Dexie data.** `useLiveQuery` is strictly better — reactive, cancellation-safe, dependency-tracked.
12. **Don't introduce Redux/Zustand/Jotai in v1.** `useLiveQuery` + URL state + a couple of `useState`s is enough. Adding a store now means every workshop attendee has to learn it.
13. **Don't centralize all forms in one mega-component.** Per-entity forms (`PersonForm`, `EventForm`) under `components/<feature>/` are easier to teach.
14. **Don't forget `trailingSlash: true`** if deploying to GitHub Pages. Without it, `/people` 404s because Pages serves `/people/index.html`.

---

## Sources

- [Next.js 15 — Guides: Static Exports](https://nextjs.org/docs/app/guides/static-exports) — `output: 'export'`, `images.unoptimized`, dynamic route behavior. **Confidence: HIGH** (official, current).
- [Next.js 15 — Functions: generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — empty array allowed; `dynamicParams` flag semantics. **Confidence: HIGH**.
- [Next.js 15 — Functions: useParams](https://nextjs.org/docs/app/api-reference/functions/use-params) — client-side dynamic param access. **Confidence: HIGH**.
- [Next.js — File-system conventions: Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — segment config + behavior under `output: export`. **Confidence: HIGH**.
- [Next.js Discussion #64660 — `useParams()` with `output: export` on client](https://github.com/vercel/next.js/discussions/64660) — community-confirmed workaround (return `[]` from `generateStaticParams`, read params on client). **Confidence: MEDIUM** (discussion, but consistent with current docs).
- [Next.js Issue #54393 — App Router `output: export` + client `useParams`](https://github.com/vercel/next.js/issues/54393) — tracks the official position. **Confidence: MEDIUM**.
- [Dexie — TypeScript guide](https://dexie.org/docs/Typescript) — `EntityTable<T, "id">` pattern. **Confidence: HIGH** (official).
- [Dexie — React tutorial](https://dexie.org/docs/Tutorial/React) — `useLiveQuery` and schema declaration. **Confidence: HIGH**.
- [Dexie — useLiveQuery() docs](https://dexie.org/docs/dexie-react-hooks/useLiveQuery%28%29) — reactivity model and dependency array semantics. **Confidence: HIGH**.
- [Dexie — API Reference: Versioning & Upgrades](https://dexie.org/docs/API-Reference) — `db.version().stores().upgrade()` pattern. **Confidence: HIGH**.
- [shadcn/ui — Sidebar component](https://ui.shadcn.com/docs/components/sidebar) — `SidebarProvider`, `SidebarInset`, mobile collapse behavior. **Confidence: HIGH**.
- [shadcn/ui — Drawer component, responsive Dialog/Drawer pattern](https://ui.shadcn.com/docs/components/drawer) — `useMediaQuery` switching between Dialog and Drawer. **Confidence: HIGH**.
- [Vaul (Drawer underlying library)](https://vaul.emilkowal.ski/) — used by shadcn `<Drawer>` for mobile bottom sheets. **Confidence: HIGH** (referenced by shadcn).
- [fake-indexeddb on npm](https://www.npmjs.com/package/fake-indexeddb) — `fake-indexeddb/auto` for vitest/jest setup. **Confidence: HIGH** (widely adopted, official Dexie testing recommendation).
- [next-themes](https://github.com/pacocoursey/next-themes) — dark mode for shadcn projects, App Router compatible. **Confidence: HIGH**.
