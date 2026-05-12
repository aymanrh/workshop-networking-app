# Networking App

## What This Is

A local-first personal networking / mini-CRM web app for working professionals — track the people you meet, the events where you met them, the notes that matter, and the follow-ups you keep forgetting. Built primarily as the demo project for a hands-on workshop teaching the GSD (spec-driven AI development) framework with Claude Code, so the codebase serves three audiences at once: pre-built reference, live-built artifact during the session, and forkable starter for attendees to extend.

## Core Value

Adding a new person right after a meetup takes under 30 seconds and feels effortless — capture is so frictionless that you actually do it.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. Hypotheses until shipped. -->

- [ ] User can add a person in under 30 seconds (name + optional role/company/tags/note + optional follow-up date) from anywhere in the app
- [ ] User can browse all people in a clean list, search by name or tag, and filter by closeness (★ close / 🔥 warm / ❄ cooling) or last-contact recency
- [ ] User can open a person's profile to see notes, tags, where-we-met (event link), and a timeline of touch points
- [ ] User can add an event (name, date, location, optional tags) and attach people they met there
- [ ] User can browse upcoming and past events
- [ ] User can set a follow-up reminder on a person and see today's follow-ups on the Home dashboard
- [ ] User sees a Home dashboard with counts (people / follow-ups / events), today's follow-ups, and upcoming events at a glance
- [ ] App works equally well on mobile (mobile-first) and desktop (sidebar + master-detail layout) — one responsive codebase
- [ ] All data persists locally in the browser (IndexedDB) — no account, no backend, no network call
- [ ] First-run prompt offers to load rich seed data (Sara Kim, Kareem Tate, Mason Lee, sample events) so the app doesn't look dead in a workshop demo
- [ ] App is deployable to GitHub Pages (static export), Vercel, or runs locally with `npm run dev` — no env vars or secrets required to ship
- [ ] Visual polish at "Linear / Notion" level — clean typography, consistent spacing, considered states (empty, loading, error)

### Out of Scope

<!-- Explicit boundaries. Reasoning included to prevent re-adding. -->

- **Onboarding flow** — skipped entirely to keep first-run trivial and avoid scope creep; rich seed data carries the demo
- **Authentication & accounts** — local-only data, no auth surface needed; eliminates auth-related teaching complexity in the workshop
- **Cloud sync / multi-device** — would require a backend and contradicts the local-first decision
- **Business card OCR scanning** — would require camera + OCR/vision API, contradicts "no integrations" and inflates workshop complexity
- **LinkedIn screenshot parsing** — same reason as OCR (vision API, integration overhead)
- **Conversation prompts / icebreakers** — would require an LLM call at runtime, breaks the zero-network constraint
- **Calendar sync (Google Calendar, etc.)** — would require OAuth and external API; deferred
- **Luma / Partiful / Eventbrite paste-parse** — deferred; could be reintroduced if scope allows
- **ICS export** — deferred; nice-to-have not core
- **Gamification / "network game" (goals, streaks, graph view, health scores)** — explicitly deferred to keep v1 focused on the quick-capture core moment
- **Smart suggestions (e.g. "not seen in 3 months")** — deferred; can layer on once data shape is locked
- **Native iOS / Android apps** — responsive web covers both form factors at a fraction of the workshop teaching cost

## Context

- **Workshop context:** Demo project for a 2-hour hands-on workshop teaching the GSD + Claude Code workflow to 5–7 participants. The workshop is structured around git branches (`00-empty` → `01-planning` → `02-discussion` → `03-milestone`), so the project's planning artifacts (`.planning/`) are themselves a teaching asset, not just internal scaffolding. Workshop reference: https://aymanrh.github.io/workshop-starter-kit-30-05-25/.
- **Three simultaneous audiences:**
  1. Workshop facilitator (showing the finished product as the "milestone" payoff)
  2. Workshop participants watching live (need to see clean, well-scoped commits and clear phase boundaries)
  3. Attendees forking the repo afterward (need a coherent codebase they can extend without untangling demo-only hacks)
- **Wireframes:** 12 mobile screens + 1 desktop layout already drawn by the user, with three design variations per screen ("pick and mix"). Variations explored: Home (stats-first / latest-activity / action-cards), People (classic-list / card-grid / by-closeness), Profile (tabbed / single-timeline / conversation-prompts), Events (upcoming-past / month-calendar / you-are-here-timeline), and corresponding flows for add-person, add-event, search/filter, settings, empty states.
- **Aesthetic direction:** Despite the hand-drawn wireframes (Caveat / Kalam fonts on paper-tone backgrounds), the *built* product should land closer to Linear / Notion / Vercel polish — clean sans-serif typography, restrained palette, modern minimal. The wireframes were sketches for exploration, not a literal style guide.
- **Local-first design choice:** Persisting to IndexedDB rather than a backend keeps the workshop demo fully self-contained (no API keys, no env vars, no auth flow to debug live) and makes the app instantly usable when forked.

## Constraints

- **Tech stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui — chosen because it's the dominant modern web stack the workshop audience is most likely to recognize, supports static export for GitHub Pages, and shadcn gives us shipping-quality components without a heavy design-system effort
- **Persistence:** IndexedDB only (likely via Dexie or similar) — no Supabase, no Firebase, no fetch to any external service at runtime
- **Hosting:** Must build cleanly for GitHub Pages (static export), Vercel, and `npm run dev` locally with zero environment configuration
- **Timeline:** Workshop is on **2026-05-30** — ~2.5 weeks from project start. Scope must be defensible against that date.
- **Audience-as-constraint:** Every commit, every file, every abstraction will be read by workshop attendees forking the repo. No clever-but-opaque code, no demo-only shortcuts that don't generalize.
- **Aesthetic floor:** "Polished minimal — Linear/Notion vibe." Not generic-AI-Tailwind aesthetic. Means deliberate type scale, considered empty states, real loading skeletons.
- **Form-factor parity:** Responsive web, mobile-first — must look intentional on a phone *and* on a 27" monitor. No "it works but it's ugly on desktop."

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Responsive web, not native | One codebase for mobile + desktop; lower workshop teaching cost; matches Next.js stack | — Pending |
| Next.js + Tailwind + shadcn/ui | Most recognizable modern web stack for the workshop audience; static-export friendly | — Pending |
| Local-only data (IndexedDB), no backend | Zero env config / API keys / auth — workshop demo is fully self-contained and forkable in one clone | — Pending |
| Polished minimal aesthetic over hand-drawn | Wireframes were for layout exploration; product should feel shipping-quality, not sketch-quality | — Pending |
| Scope = "core triangle + follow-ups + notes" (~6 screens) | Bigger scope risks the 2.5-week timeline; smaller scope hides the "CRM that nudges you" value | — Pending |
| Skip onboarding entirely | Reduces first-run friction; toggleable seed data does the work of orienting new users | — Pending |
| Toggleable seed data on first run | An empty app looks dead in a workshop demo; toggle respects users who want a clean start | — Pending |
| No external integrations in v1 | Contradicts local-only / zero-network design; adds workshop complexity for marginal value | — Pending |
| Defer "network game" / gamification | Keeps v1 focused on quick-capture core moment; can layer on as a v2 differentiator | — Pending |
| Skip card OCR / LinkedIn parse / conversation prompts | All require vision or LLM APIs; contradicts no-integrations and inflates demo setup | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-12 after initialization*
