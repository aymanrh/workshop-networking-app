# Workshop Overview — How to use this repository

This repository is a 2-hour workshop on AI-assisted, spec-driven development using GSD + Claude Code / Codex. You'll move through 4 branches, each one showing a GSD checkpoint.

---

## Branch Map

| Branch | Description | Time |
|--------|-------------|------|
| **00-empty** — Start here | Bare repo. Run `/gsd new-project` and answer the questions as a group. Your prompt is your spec. | 8 min |
| **01-planning** — GSD project output | `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `research/` (SUMMARY, PITFALLS, ARCHITECTURE, STACK, FEATURES). Then run `/gsd discuss-phase 1`. | 17 min |
| **02-discussion** — Phase discussion output | `CONTEXT.md`, `DISCUSSION-LOG.md`, `RESEARCH.md` for phase 1. What you decided vs. what the agent decided. | 15 min |
| **03-milestone** — Running app + tests + ship | Phase 1 executed: Next.js app, Vitest tests, Playwright E2E, `VERIFICATION.md`, UAT, ship + new milestone. | 30 min |

---

## Switch between branches

### Technical

```
git checkout 00-empty
git checkout 01-planning
git checkout 02-discussion
git checkout 03-milestone
```

### Non-Technical

> **Paste into Claude or Codex:**
>
> Switch to the [branch name] branch — for example: "Switch to the 01-planning branch and open workshop.html to see the planning output."

---

## All files in this repo

- [`workshop.html`](workshop.html) / [`workshop.md`](workshop.md) — this branch's step-by-step guide (each branch has one)
- [`setup.html`](setup.html) / [`setup.md`](setup.md) — install guide + WhatsApp checklist (do this before workshop day)
- [`overview.html`](overview.html) / [`overview.md`](overview.md) — this file
- [`agenda-facilitator.html`](agenda-facilitator.html) / [`agenda-facilitator.md`](agenda-facilitator.md) — facilitator timing + talking points (not for participants)
- [`agenda-participant.html`](agenda-participant.html) / [`agenda-participant.md`](agenda-participant.md) — participant agenda overview
