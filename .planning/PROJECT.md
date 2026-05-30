# Networking App

## What This Is

A personal relationship OS for solo business owners who want to build genuine, reciprocal connections with their clients. Unlike a sales CRM, it tracks mutual value exchanged (favors, help given, projects done together), categorizes contacts by both their expertise level and the depth of your relationship, and drives a full follow-up loop — reminding you when to reach out, showing you context before you do, and suggesting who deserves attention next.

## Core Value

Know exactly who to reach out to next, and have the context to make the conversation meaningful.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can add and manage contacts (name, role, notes)
- [ ] User can tag contacts by expertise level (beginner → expert)
- [ ] User can tag contacts by relationship depth (cold → warm → deep)
- [ ] User can log mutual value: favors/help given and received
- [ ] User can log projects and collaborations done together
- [ ] User can log interactions (notes on conversations)
- [ ] User gets time-based follow-up reminders (e.g. "haven't talked in 30 days")
- [ ] User sees contact context before reaching out (last interaction, value exchanged)
- [ ] User gets smart suggestions on who to reach out to next
- [ ] Approach mode shown per contact based on expertise (peer vs. mentorship framing)

### Out of Scope

- Team/multi-user sharing — solo use only for v1
- Mobile app — web only for v1
- Email/calendar integration — manual logging in v1
- AI-generated message drafts — suggestions are about who to contact, not what to say

## Context

- The user is a solo business owner managing their own client network
- Current workflow is spreadsheets and notes — functional but hard to act on
- Key pain: no intelligence around when to follow up or what to say
- Differentiator vs. standard CRMs: mutual value tracking (not just pipeline stages) and expertise-aware relationship framing
- "Beyond the surface" means remembering what you've done for each other, not just meeting dates

## Constraints

- **Users**: Solo — no auth/sharing complexity needed in v1
- **Platform**: Web app only
- **Data entry**: Manual — no integrations or auto-sync in v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expertise + relationship depth as two separate axes | Client skill level drives conversation approach; relationship depth drives follow-up cadence | — Pending |
| Mutual value logging instead of pipeline stages | Reflects relationship health, not just sales funnel position | — Pending |
| Suggestion engine (who to contact next) as core feature | Without this, it's just a fancier spreadsheet | — Pending |

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
*Last updated: 2026-05-30 after initialization*
