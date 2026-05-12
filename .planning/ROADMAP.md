# Roadmap: Networking App

## Overview

Five phases take this from empty repo to a polished, deployable workshop-demo personal-CRM in ~2.5 weeks. Phase 1 front-loads every risky integration decision — Next.js 16 static export, IndexedDB+Dexie singleton, dynamic `[id]` routes under `output: "export"`, GitHub Pages deploy — into a working shell before any feature work. Phase 2 lands the headline UX moment (30-second person capture). Phase 3 introduces the second entity (events) and the cross-entity linking that makes it feel like a CRM. Phase 4 adds the "nudges you" loop (touchpoints, follow-ups, dashboard). Phase 5 brings the polish that makes it workshop-grade — global search, settings, seed data, deploy, README. Coarse granularity, 5 phases, every v1 requirement mapped.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Static-Export Spine** - Working shell deployed to GH Pages with Dexie schema, dynamic routes, and theming all proven
- [ ] **Phase 2: People** - Full People CRUD with 30-second capture, tags, closeness, and list/detail views
- [ ] **Phase 3: Events & Linking** - Events CRUD plus bi-directional person↔event linking with smart event-met defaults
- [ ] **Phase 4: Touchpoints, Follow-ups & Home Dashboard** - The "CRM that nudges you" loop — timeline, follow-up reminders, glanceable Home
- [ ] **Phase 5: Search, Settings, Seed Data, Polish & Ship** - Global search, JSON export/import, seed data, README, GH Pages + Vercel deploy validated

## Phase Details

### Phase 1: Foundation & Static-Export Spine
**Goal**: A deployable, themed, tested responsive shell exists with an IndexedDB schema sufficient for every later phase — so feature work in Phases 2-5 plugs in with zero migrations and zero deploy surprises.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09, POL-04
**Success Criteria** (what must be TRUE):
  1. User can open the app on mobile and desktop and see a responsive shell with persistent navigation (bottom tabs on mobile, sidebar on desktop) and no `100vh`/`100dvh` overflow bugs
  2. User can navigate to every section (Home, People, Events, Settings) and dynamic placeholder pages (`/people/[id]`, `/events/[id]`) — all routes resolve correctly in dev, build, and deployed to GitHub Pages with a non-root `basePath`
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

### Phase 4: Touchpoints, Follow-ups & Home Dashboard
**Goal**: The app starts nudging the user — touchpoints append to a per-person timeline, follow-up dates surface on Home as "what to do today", and the dashboard makes the network feel alive at a glance.
**Depends on**: Phase 3
**Requirements**: TCH-01, TCH-02, TCH-03, TCH-04, TCH-05, TCH-06, HOM-01, HOM-02, HOM-03, HOM-04
**Success Criteria** (what must be TRUE):
  1. User can add a touchpoint to a person (type + optional note) and see it appear instantly in that person's timeline with a timestamp, and the person's "last seen N days ago" indicator updates
  2. User can set a follow-up date on a person from their detail page and have it appear on the Home dashboard's "Follow-ups today" section on or after that date
  3. User can mark a follow-up done from the Home dashboard with one tap, which clears the follow-up date and removes it from the today list
  4. User opens Home and sees, at a glance: counts (people / follow-ups today / upcoming events), today's follow-up cards with one-tap actions, and the next 3 upcoming events with dates
  5. When the database is empty, the Home dashboard shows a friendly empty state inviting the user to add a person or load seed data — never a dead blank screen
**Plans**: TBD
**UI hint**: yes

### Phase 5: Search, Settings, Seed Data, Polish & Ship
**Goal**: The app is workshop-grade — searchable across all entities, configurable, seeded with a delightful first-run experience, polished in its loading/empty/error states, documented for forkers, and deployed to both GitHub Pages and Vercel.
**Depends on**: Phase 4
**Requirements**: SRC-01, SRC-02, SRC-03, SRC-04, SET-01, SET-02, SET-03, SET-04, SET-05, SED-01, SED-02, SED-03, SED-04, POL-01, POL-02, POL-03, POL-05
**Success Criteria** (what must be TRUE):
  1. User can type into a single search input and find people by name (prefix-boosted), tag, role, or note content, with debounced results and a useful empty state suggesting refinements
  2. User can export all their data as a JSON file from Settings and import it back into a fresh database without data loss — round-trip backup actually works
  3. User on a fresh first run sees a prompt offering to load rich, plausible seed data (Sara Kim, Kareem Tate, Mason Lee + 5-6 others, 3-4 events, varied closeness states, one or two follow-ups due today) — or can decline and start empty
  4. Every list view (People, Events, Search, Home sections) has deliberate loading skeletons, friendly empty states with primary actions, and clear error states — no dead blank screens, no jarring spinners
  5. The deployed build (both `gh-pages` and Vercel preview) loads in under 2 seconds on a typical laptop, with no console errors, no `basePath` 404s, and a README that gets a forker from clone to running app in under 5 minutes
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static-Export Spine | 0/TBD | Not started | - |
| 2. People | 0/TBD | Not started | - |
| 3. Events & Linking | 0/TBD | Not started | - |
| 4. Touchpoints, Follow-ups & Home Dashboard | 0/TBD | Not started | - |
| 5. Search, Settings, Seed Data, Polish & Ship | 0/TBD | Not started | - |
