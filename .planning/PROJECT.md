# NetMemory

## What This Is

A personal CRM for the people I meet and the events that bring us together. It captures rich context on every person — how we met, what we talked about, who they are — and tracks events across their full lifecycle, from "planning to attend" through "attended" to "memory." Single-user, web-based, mobile-friendly.

## Core Value

Never forget who I met. If everything else fails, opening this app and finding rich, durable context on any person I've ever met must work.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Capture a contact in under 30 seconds with name, how-we-met (event + date), free-form notes, tags, and company/role
- [ ] Browse contacts by name search, by event, and by tag/company filter
- [ ] Track events through a lifecycle: planned (future) → attended (past) → memory (with attendee list + notes)
- [ ] Surface contacts I haven't interacted with in a while ("simple staleness" view) so relationships don't slip
- [ ] Export my data (single-account, but I can share a contact or event externally on demand)
- [ ] Run on a single cloud account I own — I'm the only user; no public sign-ups

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Multi-user accounts / public sign-up — this is my personal memory tool, not a social product
- Native mobile app (iOS/Android) — web + responsive is sufficient; native is too much surface for one user
- Real-time chat / in-app messaging — out of scope philosophically; this app is about memory, not communication
- Public profiles or social-network features — privacy and scope risk; deferred indefinitely

### Deferred to Future Versions

<!-- Acknowledged value but not in v1 scope. -->

- **v2** — Contact channels: multiple email/phone/LinkedIn/X/WhatsApp handles per person, copy-to-clipboard
- **v2** — Real follow-up reminders: notification cadence rules per relationship strength (email or push)
- **v2** — Import from LinkedIn / Google Contacts / vCard
- **v3** — Photos / avatars per contact (upload from camera or gallery)
- **v3** — Relationship strength tiers (stranger / acquaintance / friend / close) for prioritized follow-ups
- **v3** — Custom fields (birthday, spouse, gift ideas, allergies)

## Context

- Solo developer, building for personal use first — but the product should be solid enough that it could later become a real tool for others
- Hosting on cloud (Vercel / Fly / similar) — modest scale, single user, low cost expected
- Mobile capture is the most demanding moment: brief windows, sometimes mid-conversation, sometimes hours later in bed. The capture UX has to be fast and forgiving on a phone browser
- Privacy matters — this is sensitive social data. Cloud hosting is acceptable but the app should not require third-party logins, and data should be exportable at any time

## Constraints

- **Platform**: Web app, must work well on mobile browser — no native app in v1
- **Audience**: Single-user (just me); no multi-tenant features needed in v1
- **Tech stack**: Pick solid defaults — researcher will recommend the specific stack
- **Sensitivity**: Personal/private data — sane auth, encrypted-in-transit, exportable; no third-party data sharing
- **Budget**: Personal project — prefer free/low-cost hosting tiers and avoid services with per-record fees

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-user only in v1 | Personal tool first; multi-user adds auth/billing/permissions complexity that isn't justified yet | — Pending |
| Web (responsive), not native | Capture happens on mobile but native ROI is poor for one user; responsive web is enough | — Pending |
| Events as lifecycle entities (not tags) | Future-planned events and past memories are both first-class — drives discoverability and prep | — Pending |
| Photos deferred to v3 | User explicitly deferred; v1 stays text-only to keep capture fast and storage simple | — Pending |
| Contact channels deferred to v2 | This app is memory, not messaging — channels live elsewhere until v2 | — Pending |

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
