# Networking App — Project Guide

## What This Is

A personal relationship OS for solo business owners. Tracks contacts with expertise levels, logs mutual value (favors + projects), pins key notes, and drives follow-up reminders. Web app, no auth, single user.

**Core value:** Know exactly who to reach out to next, and have the context to make the conversation meaningful.

## GSD Workflow

This project uses the GSD (Get Shit Done) workflow. Always follow this sequence:

1. `/gsd-discuss-phase N` — gather context before planning
2. `/gsd-plan-phase N` — create execution plan
3. `/gsd-execute-phase N` — execute plans
4. `/gsd-verify-work N` — verify phase goal was achieved

**Never skip phases.** Each phase builds on the previous.

## Planning Artifacts

- `.planning/PROJECT.md` — project context and requirements
- `.planning/REQUIREMENTS.md` — v1 requirements with REQ-IDs
- `.planning/ROADMAP.md` — 5 phases, all mapped to requirements
- `.planning/STATE.md` — current position and session continuity
- `.planning/config.json` — workflow settings (YOLO mode, standard granularity)

## Current State

**Phase 1: Contact Management** — Not started

Run `/gsd-discuss-phase 1` to begin.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| No auth in v1 | Solo user, no sharing — keeps scope tight |
| Web app only | No mobile in v1 |
| Expertise + relationship depth as separate axes | Expertise drives conversation approach mode |
| Mutual value logging instead of pipeline stages | Reflects genuine relationship health |
| Manual logging only | No integrations in v1 |

## Tech Stack

Not yet decided — will be chosen during `/gsd-discuss-phase 1`.

## Commit Style

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
