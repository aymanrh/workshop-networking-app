# Roadmap: Networking App

## Overview

Four phases take this from empty repo to a polished, deployable workshop-demo personal-CRM. Phase 1 front-loads every risky integration decision — Next.js 16 static export, IndexedDB+Dexie singleton, dynamic `[id]` routes under `output: "export"`, GitHub Pages deploy — into a working shell before any feature work. Phase 2 lands the headline UX moment (30-second person capture). Phase 3 introduces the second entity (events) and the cross-entity linking that makes it feel like a CRM. Phase 4 brings the polish that makes it workshop-grade — global search, seed data, JSON backup/restore via a header menu, deploy, README. Coarse granularity, 4 phases, every v1 requirement mapped.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Static-Export Spine** - Working shell deployed to GH Pages with Dexie schema, dynamic routes, and theming all proven
- [x] **Phase 2: People** - Full People CRUD with 30-second capture, tags, closeness, and list/detail views
- [x] **Phase 3: Events & Linking** - Events CRUD plus bi-directional person↔event linking with smart event-met defaults
- [x] **Phase 4: Search, Seed Data, Polish & Ship** - Global search, JSON backup/restore via header menu, seed data, README, GH Pages + Vercel deploy validated

## Phase Details

### Phase 1: Foundation & Static-Export Spine
**Goal**: A deployable, themed, tested responsive shell exists with an IndexedDB schema sufficient for every later phase — so feature work in Phases 2-4 plugs in with zero migrations and zero deploy surprises.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09, POL-04
**Success Criteria** (what must be TRUE):
  1. User can open the app on mobile and desktop and see a responsive shell with persistent navigation (bottom tabs on mobile, sidebar on desktop) and no `100vh`/`100dvh` overflow bugs
  2. User can navigate to every section (Home, People, Events) and dynamic placeholder pages (`/people/[id]`, `/events/[id]`) — all routes resolve correctly in dev, build, and deployed to GitHub Pages with a non-root `basePath`
  3. User can toggle between light and dark themes without flash-of-unstyled-content on initial load
  4. A developer can clone the repo and run `npm install && npm run dev` with no environment variables or API keys and see the app come up
  5. A passing smoke test demonstrates the Dexie data layer works under fake-indexeddb (insert + query)
**Plans**: TBD
**UI hint**: yes

### Phase 2: People
**Goal**: User can capture and manage the people they meet end-to-end — the "Add a person in under 30 seconds" core-value moment is real and demoable.
**Depends on**: Phase 1
**Requirements**: PPL-01, PPL-02, PPL-03, PPL-04, PPL-05, PPL-06, PPL-07, PPL-08, PPL-09
**Success Criteria** (what must be TRUE):
  1. User can add a new person from any screen via a floating "+" action and reach the success state in under 30 seconds for a typical entry (name + role + 2 tags + 1-line note)
  2. User can browse all people in a clean list sorted by recent activity, with each card showing name, role, closeness chip, and last-touch indicator
  3. User can open a person's detail page, edit any field, and delete the person — with deletion cascading to any touchpoints referencing them
  4. User can apply tags to a person and have the same concept ("design" / "Design" / " design ") collapse into one canonical tag with autocomplete on existing tags
  5. User can set and change a person's closeness state inline (`★ close` / `🔥 warm` / `❄ cooling`) from the detail page
**Plans**: TBD
**UI hint**: yes

### Phase 3: Events & Linking
**Goal**: User can model the *places* they meet people and link people to events bi-directionally — the "event-as-container" pattern that makes bulk-add rhythmic and unlocks the smart "event-met" default that keeps capture under 30 seconds.
**Depends on**: Phase 2
**Requirements**: EVT-01, EVT-02, EVT-03, EVT-04, EVT-05, EVT-06, EVT-07
**Success Criteria** (what must be TRUE):
  1. User can create an event with name, date, optional location, optional tags, and status (interested/going/attended), and see it in either the Upcoming or Past list depending on its date
  2. User can open an event's detail page and see all attendees, and tap into any attendee's profile from there
  3. User can add multiple existing people as attendees of an event in one flow, AND can add a brand-new person from the event detail with an "Add another person" loop that returns to the event after each save
  4. When the user creates a person from anywhere in the app, the "event-met" field is pre-filled with the most recently created event, so logging people right after a meetup requires no extra taps to record context
  5. User can delete an event and any person who had it as "event-met" cleanly loses that reference (person retained, event reference cleared)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Search, Seed Data, Polish & Ship
**Goal**: The app is workshop-grade — searchable across all entities, seeded with a delightful first-run experience, backed by JSON export/import from a header menu, polished in its loading/empty/error states, documented for forkers, and deployed to both GitHub Pages and Vercel.
**Depends on**: Phase 3
**Requirements**: SRC-01, SRC-02, SRC-03, SRC-04, SET-02, SET-03, SED-01, SED-02, SED-03, SED-04, POL-01, POL-02, POL-03, POL-05
**Success Criteria** (what must be TRUE):
  1. User can type into a single search input and find people by name (prefix-boosted), tag, role, or note content, with debounced results and a useful empty state suggesting refinements
  2. User can export all their data as a JSON file from a header menu and import it back into a fresh database without data loss — round-trip backup actually works, no dedicated Settings page required
  3. User on a fresh first run sees a prompt offering to load rich, plausible seed data (Sara Kim, Kareem Tate, Mason Lee + 5-6 others, 3-4 events, varied closeness states) — or can decline and start empty
  4. Every list view (People, Events, Search) has deliberate loading skeletons, friendly empty states with primary actions, and clear error states — no dead blank screens, no jarring spinners
  5. The deployed build (both `gh-pages` and Vercel preview) loads in under 2 seconds on a typical laptop, with no console errors, no `basePath` 404s, and a README that gets a forker from clone to running app in under 5 minutes
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static-Export Spine | 14/14 | Complete | 2026-05-13 |
| 2. People | 15/15 | Complete | 2026-05-13 |
| 3. Events & Linking | 17/17 | Complete | 2026-05-13 |
| 4. Search, Seed Data, Polish & Ship | 16/16 | Complete | 2026-05-13 |
