# GradLink

## What This Is

GradLink is a talent-marketplace networking app that connects recent graduates (any field, any region) with business owners for jobs and freelance project work. Graduates build proof-rich profiles — real work samples plus scored platform skill challenges — so businesses can confidently find and hire early-career talent that traditional job boards overlook.

## Core Value

Graduates can **prove their skills** (through portfolio work and scored challenges) so business owners notice and hire them despite having no professional track record. If everything else fails, this must work.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. Hypotheses until shipped and validated. -->

- [ ] Graduates and business owners can create accounts (two distinct roles)
- [ ] Graduate can build a profile with portfolio / real work samples
- [ ] Graduate can complete platform skill challenges that are scored and shown on their profile
- [ ] Business owner can post a job or freelance project
- [ ] Graduate can apply to a posted job or project
- [ ] Business owner can search / browse graduate profiles by skill and challenge score
- [ ] Platform recommends best-fit graduates for a posting (matchmaking ranked by skill proof)
- [ ] Graduate and business owner can message each other directly to discuss before committing

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- On-platform payments / escrow / payouts — deferred to a future milestone ("connect now, money later"); v1 only makes the connection
- Contracts and invoicing — handled off-platform in v1; depends on payments
- Institutional credential / degree verification — proof of skill comes from portfolio + challenges in v1, not verified credentials
- Experienced / mid-career professionals — focus is specifically recent graduates with no track record
- Native mobile apps — web-first for v1

## Context

- **Problem being solved:** Fresh graduates get ignored on big platforms (LinkedIn, Indeed) because they have no track record and are invisible against experienced applicants. There's also no trustworthy way for a graduate to prove what they can actually do — résumés don't demonstrate real ability.
- **The wedge:** Proof of skill. The combination of real work samples and scored, platform-issued challenges is the differentiator that makes early-career talent legible to employers.
- **Two-sided marketplace:** Success requires both supply (graduates with proven skills) and demand (businesses with postings). Cold-start dynamics matter.
- **Audience breadth:** Any field, any region — broad rather than niche. Skill challenges and matching must generalize across disciplines.
- **Greenfield:** Starting from an empty repo (workshop starter). No existing code to integrate with.

## Constraints

- **Scope**: v1 is connect-only — no money moves through the platform — to keep the initial build tractable and ship the core proof-of-skill loop fast.
- **Tech stack**: Greenfield, web-first. Starter scaffolding suggests a Next.js-based stack (`.next/` present), to be confirmed during research.
- **Two-sided cold start**: Must consider how to bootstrap both graduates and businesses; a marketplace empty on either side delivers no value.

## Key Decisions

<!-- Decisions that constrain future work. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1 connects only; payments deferred to a later milestone | Keeps initial scope tractable; validates the core matching loop before adding transaction complexity | — Pending |
| Proof of skill = portfolio + scored challenges (not credentials or ratings) | Most trustworthy, differentiating signal for graduates with no track record | — Pending |
| Broad audience (any field, any region) rather than niche | User's stated vision; maximizes addressable market | — Pending |
| Working name "GradLink" | Placeholder; easy to rebrand before launch | — Pending |

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
