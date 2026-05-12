# Requirements: Networking App

**Defined:** 2026-05-12
**Core Value:** Adding a new person right after a meetup takes under 30 seconds and feels effortless — capture is so frictionless that you actually do it.

## v1 Requirements

Requirements for the workshop-demo release (2026-05-30). Each maps to roadmap phases. Local-only, no backend, no integrations.

### Foundation

- [ ] **FND-01**: App boots into a responsive shell with persistent navigation — bottom tab bar on mobile (`< md`), persistent sidebar on desktop (`≥ md`)
- [ ] **FND-02**: App renders correctly on mobile viewport (iPhone 14 Pro) and desktop viewport (1440px+) with no horizontal scroll, no overlapping nav, no `100vh` jumpiness on iOS Safari
- [ ] **FND-03**: All persisted data lives in IndexedDB (Dexie) on the user's device; no network calls are made to any backend at runtime
- [ ] **FND-04**: Schema v1 is locked at first run with `people`, `events`, `touches`, and `meta` stores, with multi-entry indexes on tags/attendees pre-declared so later phases don't need migrations
- [ ] **FND-05**: Dynamic `[id]` routes (`/people/[id]`, `/events/[id]`) build cleanly under `output: "export"` and load correctly when deployed to GitHub Pages with a non-root `basePath`
- [ ] **FND-06**: After first successful write, the app requests persistent storage (`navigator.storage.persist()`) so browsers won't silently evict the user's data
- [ ] **FND-07**: App is deployable as a static export to GitHub Pages AND Vercel AND runs locally with `npm install && npm run dev` — no environment variables, no `.env` files, no API keys required to ship
- [ ] **FND-08**: Light and dark themes both render without flash-of-unstyled-content (FOUC) on initial load
- [ ] **FND-09**: A passing smoke test exists (Vitest + fake-indexeddb) proving the data layer works headlessly

### People

- [ ] **PPL-01**: User can create a person from anywhere in the app via a floating "+" action; only the name field is required
- [ ] **PPL-02**: The Add Person flow completes in under 30 seconds for a typical entry (name + role + 2 tags + 1-line note + where-we-met)
- [ ] **PPL-03**: A person record stores: name, role/company, tags (string[]), notes, closeness (`close` / `warm` / `cooling`), createdAt, lastContactAt, optional followUpAt, optional eventMetId
- [ ] **PPL-04**: User can browse all people in a clean list, sortable by recent activity, showing name, role, closeness chip, and last-touch indicator
- [ ] **PPL-05**: User can open a person's detail page to see all stored fields, notes, where-we-met (with link to the event), and any follow-up status
- [ ] **PPL-06**: User can edit a person's fields from the detail page
- [ ] **PPL-07**: User can delete a person, with cascading cleanup of any touches that reference them
- [ ] **PPL-08**: Tags entered on a person are normalized (trimmed + lowercased) on save; an autocomplete suggests existing tags so the same concept doesn't fragment into "Design / design / Designer"
- [ ] **PPL-09**: Closeness chip is glanceable on every person card (`★ close` / `🔥 warm` / `❄ cooling`) and editable inline from the detail page

### Events

- [ ] **EVT-01**: User can create an event with name, date, optional location, optional tags, and status (`interested` / `going` / `attended`)
- [ ] **EVT-02**: User can browse events split into "Upcoming" and "Past" sections
- [ ] **EVT-03**: User can open an event's detail page to see its info and the list of attendees (people linked to it)
- [ ] **EVT-04**: User can add an existing person as an attendee from the event detail page (multi-select picker)
- [ ] **EVT-05**: User can add a *new* person as an attendee from the event detail page in one flow ("Add another person" loop), so logging 4 people from one meetup is rhythmic
- [ ] **EVT-06**: User can edit or delete an event; deleting an event detaches it from any people who had it as their where-we-met (event reference cleared, person retained)
- [ ] **EVT-07**: When creating a person, the `eventMet` field defaults to the most recently created event (so "just got back from a meetup, adding the people" requires zero extra taps to set the where-we-met)

### Touchpoints & Follow-ups

- [ ] **TCH-01**: A person's detail page shows a touchpoint timeline (append-only log of meet / message / note entries with timestamps)
- [ ] **TCH-02**: User can add a touchpoint to a person (type + optional note); the touch records its own timestamp and updates the person's `lastContactAt`
- [ ] **TCH-03**: User can set or clear a follow-up date on a person from their detail page
- [ ] **TCH-04**: The Home dashboard shows today's follow-ups (people whose `followUpAt` is today or earlier and not yet acted on)
- [ ] **TCH-05**: User can mark a follow-up as done from the dashboard, which clears the follow-up date
- [ ] **TCH-06**: Person detail shows a factual "last seen N days ago" indicator derived from `lastContactAt` (closeness state is separate and manually controlled)

### Home Dashboard

- [ ] **HOM-01**: Home shows counts at a glance: total people, today's follow-ups, upcoming events
- [ ] **HOM-02**: Home shows a "Follow-ups today" section with each person's name, last-event context, and a one-tap action to mark done
- [ ] **HOM-03**: Home shows an "Upcoming" section listing the next 3 events with dates
- [ ] **HOM-04**: When the dataset is empty, Home shows a friendly empty state inviting the user to add their first person or load seed data

### Search & Filter

- [ ] **SRC-01**: User can search across people by name, tag, role, and notes from a single search input
- [ ] **SRC-02**: Search is debounced (~250ms) and matches by prefix on name (boosted) then by token match on tags/role/notes
- [ ] **SRC-03**: User can filter people by closeness (★ close / 🔥 warm / ❄ cooling) or by tag
- [ ] **SRC-04**: When no matches, the empty state suggests dropping a tag or shortening the query

### Settings & Data Management

- [ ] **SET-01**: User can toggle between light and dark themes
- [ ] **SET-02**: User can export all data as a JSON file (`dexie-export-import` round-trip)
- [ ] **SET-03**: User can import a previously exported JSON file, replacing or merging current data with confirmation
- [ ] **SET-04**: User can reset the database (deletes all local data, with a typed-confirmation safeguard)
- [ ] **SET-05**: Settings shows the current data footprint (people / events / touches counts)

### First Run & Seed Data

- [ ] **SED-01**: On first run (no people in the database), a prompt offers to load rich seed data (~8 diverse people, 3-4 events, varied closeness states, a few follow-ups due today)
- [ ] **SED-02**: User can decline seed and start empty — the empty states guide them
- [ ] **SED-03**: User can reload seed data later from Settings (idempotent — won't create duplicates)
- [ ] **SED-04**: Seed names, roles, and notes feel plausible and varied, not "John Doe / Jane Smith" placeholder cringe

### Polish

- [ ] **POL-01**: Every list view has a documented loading state (skeleton), empty state (friendly + actionable), and error state
- [ ] **POL-02**: Typography, spacing, and color tokens are deliberate and consistent — type scale, spacing rhythm, restrained palette in the Linear/Notion idiom
- [ ] **POL-03**: Touch targets on mobile are at least 44×44 pixels; tap-stuck hover states do not occur on touch devices
- [ ] **POL-04**: The shell uses `100dvh` (not `100vh`) so iOS Safari does not hide the bottom nav behind the home indicator
- [ ] **POL-05**: A README documents zero-config local run, the GH Pages / Vercel deploy targets, the GSD workshop branch arc (`00-empty` → `01-planning` → `02-discussion` → `03-milestone`), and how to fork-and-extend

## v2 Requirements

Deferred to future releases. Tracked but not in the workshop-demo roadmap.

### Onboarding

- **ONB-01**: First-run intro slides ("Remember everyone you meet")
- **ONB-02**: User profile setup (name, role, city, why-you-network)
- **ONB-03**: Goal picker (meet new people / stay in touch / job-hunting / just remember) with cadence (daily / weekly / monthly)
- **ONB-04**: Selected goal shapes the Home dashboard layout

### Smart Reminders

- **SMR-01**: Recurring keep-in-touch cadences ("remind me every 3 months")
- **SMR-02**: Auto-decay of closeness state based on `lastContactAt`
- **SMR-03**: "Cooling alert" surfaces people whose warmth has dropped
- **SMR-04**: Smart suggestions on empty search ("17 people you haven't seen in 3 months")

### Network Visualization

- **NVS-01**: Network graph view (people as nodes, events as connecting edges)
- **NVS-02**: Closeness as visual weight in the graph

### Integrations

- **INT-01**: Calendar sync (Google Calendar) — read-only event import
- **INT-02**: ICS export of events
- **INT-03**: Paste-parse for Luma / Partiful / Eventbrite event links
- **INT-04**: vCard / CSV / phone-book import for bulk people import

### AI-Assisted Capture

- **AIC-01**: Business card OCR scanning
- **AIC-02**: LinkedIn screenshot parsing
- **AIC-03**: Conversation prompts / icebreakers per person ("Did the new design ship?")
- **AIC-04**: Auto-tag suggestions from notes

### Network Game / Gamification

- **GAM-01**: Goal tracker with progress bars (e.g., "5 new people per month")
- **GAM-02**: Streaks for staying in touch
- **GAM-03**: Achievements / badges
- **GAM-04**: Weekly challenges ("reconnect with 3 cold contacts")

### PWA

- **PWA-01**: Installable Progressive Web App (likely via Serwist, after Next.js 16 Turbopack-compatible solutions mature)
- **PWA-02**: Offline-only mode with last-cached-state UX

### Productivity Polish

- **PRD-01**: Cmd+K command palette
- **PRD-02**: Master-detail desktop layout at `lg:` breakpoint
- **PRD-03**: Saved smart lists ("Designers in NYC")
- **PRD-04**: Bulk operations (multi-select people for tag changes)

## Out of Scope

Explicit exclusions. Documented to prevent re-adding.

| Feature | Reason |
|---------|--------|
| Authentication / accounts | Local-only data — no auth surface needed; eliminates a teaching distraction in the workshop |
| Cloud sync / multi-device | Would require a backend, contradicts local-first |
| Multi-user / team features | Personal-CRM category deliberately rejects business-CRM team workflows |
| Sales pipelines / deal stages | This is a personal CRM, not Hubspot |
| Lead scoring | Same — explicitly rejected category |
| Email blasts / sequences | Outside personal-CRM mental model |
| Mandatory activity-log fields | Personal CRMs are notes-first, not field-first |
| Companies-as-entity | Would explode scope; we treat company as a string on a person |
| Real-time chat / messaging | Out of category |
| Native iOS / Android apps | Responsive web covers both; native is not the workshop's teaching vehicle |
| Browser push notifications | Permission-prompt UX is fragile; in-app dashboard is the v1 surface for follow-ups |
| Auto-decay of closeness (v1 only) | In a demo with little data it looks broken — deferred to v2 with auto-tuning |
| Recurring cadences (v1 only) | Adds scheduler concept (compute-next, cancel UI) — clean v2 path |
| `next/image` optimization | Unavailable under static export — use `<img>` with explicit dimensions |
| PWA in v1 | `next-pwa` is webpack-only, breaks Next.js 16 Turbopack default; Serwist costs 1-2 days for no v1 value |
| Tag management screen | Autocomplete + normalization on save handles 80% case cheaply; full tag manager is v2 |

## Traceability

Empty initially. Populated by the roadmapper agent when phases are created.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | — | Pending |
| FND-02 | — | Pending |
| FND-03 | — | Pending |
| FND-04 | — | Pending |
| FND-05 | — | Pending |
| FND-06 | — | Pending |
| FND-07 | — | Pending |
| FND-08 | — | Pending |
| FND-09 | — | Pending |
| PPL-01 | — | Pending |
| PPL-02 | — | Pending |
| PPL-03 | — | Pending |
| PPL-04 | — | Pending |
| PPL-05 | — | Pending |
| PPL-06 | — | Pending |
| PPL-07 | — | Pending |
| PPL-08 | — | Pending |
| PPL-09 | — | Pending |
| EVT-01 | — | Pending |
| EVT-02 | — | Pending |
| EVT-03 | — | Pending |
| EVT-04 | — | Pending |
| EVT-05 | — | Pending |
| EVT-06 | — | Pending |
| EVT-07 | — | Pending |
| TCH-01 | — | Pending |
| TCH-02 | — | Pending |
| TCH-03 | — | Pending |
| TCH-04 | — | Pending |
| TCH-05 | — | Pending |
| TCH-06 | — | Pending |
| HOM-01 | — | Pending |
| HOM-02 | — | Pending |
| HOM-03 | — | Pending |
| HOM-04 | — | Pending |
| SRC-01 | — | Pending |
| SRC-02 | — | Pending |
| SRC-03 | — | Pending |
| SRC-04 | — | Pending |
| SET-01 | — | Pending |
| SET-02 | — | Pending |
| SET-03 | — | Pending |
| SET-04 | — | Pending |
| SET-05 | — | Pending |
| SED-01 | — | Pending |
| SED-02 | — | Pending |
| SED-03 | — | Pending |
| SED-04 | — | Pending |
| POL-01 | — | Pending |
| POL-02 | — | Pending |
| POL-03 | — | Pending |
| POL-04 | — | Pending |
| POL-05 | — | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 53 ⚠️ (resolved by roadmapper)

---
*Requirements defined: 2026-05-12*
*Last updated: 2026-05-12 after initial definition*
