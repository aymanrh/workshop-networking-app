# Workshop Overview — How to use this repository

This repository is a 2-hour workshop on **AI-assisted, spec-driven development** using the **GSD** framework with **Claude Code** (or **Codex** if you prefer the non-technical track).

You'll start from the **`setup` branch** — a starter scaffold plus these workshop materials — and build the same shape of app live, together, in 2 hours. The finished v1 reference lives on **`main`** so you can peek any time without leaving your seat.

---

## Repo map

| Branch | What's on it | When to look at it |
|--------|--------------|--------------------|
| **`setup`** | Starter scaffold + this guide (`setup.md`, `setup-codex.md`, `workshop.md`, `overview.md`, agenda files) | You spend the whole workshop here. |
| **`main`** | Finished v1 networking app — full feature set, tests passing, GH Pages deploy green | Reference / sanity check. After the workshop, fork it and extend. |

That's it. Two branches. Everything else is built **live** during the session with GSD.

---

## Files on this branch

- [`workshop.html`](workshop.html) / [`workshop.md`](workshop.md) — the step-by-step guide for the 2-hour live build
- [`setup.html`](setup.html) / [`setup.md`](setup.md) — pre-workshop install guide for the **Claude Code** track
- [`setup-codex.html`](setup-codex.html) / [`setup-codex.md`](setup-codex.md) — same install guide but for the **Codex** track
- [`agenda-participant.html`](agenda-participant.html) / [`agenda-participant.md`](agenda-participant.md) — participant view of the 2-hour agenda
- [`agenda-facilitator.html`](agenda-facilitator.html) / [`agenda-facilitator.md`](agenda-facilitator.md) — facilitator timing, talking points, watch-fors (internal)
- [`overview.html`](overview.html) / [`overview.md`](overview.md) — this file

---

## The 2-hour arc, at a glance

| Time | What we do | GSD command |
|------|-----------|-------------|
| 0:00 – 0:20 | Welcome, intros, "your prompt is your spec" framing | — |
| 0:20 – 0:30 | Kick off a fresh project (live, as a group) | `/gsd-new-project` |
| 0:30 – 0:50 | Tour the planning output GSD just produced (PROJECT, ROADMAP, REQUIREMENTS, research) | — |
| 0:50 – 1:05 | Discuss the first phase — surface what the AI is about to decide on its own | `/gsd-discuss-phase 1` |
| 1:05 – 1:35 | Execute the phase live: planning, code, tests, verification | `/gsd-execute-phase 1` |
| 1:35 – 1:45 | Ship + open the next milestone | `/gsd-ship`, `/gsd-new-milestone` |
| 1:45 – 2:00 | Q&A and what to try after today | — |

Each row of this table maps to a numbered step in [workshop.md](workshop.md), which is where you'll spend the live time.

---

## Compare with the reference

When you want to see "what does the finished version of this artifact look like?", peek at `main` without leaving `setup`:

```
git show main:.planning/PROJECT.md
git show main:.planning/phases/01-foundation-static-export-spine/01-PLAN.md
git diff setup main -- README.md
```

The facilitator will point at these moments during the live walk-through.

---

## Pick your AI track

- **Claude Code** (recommended, terminal-based, runs GSD commands directly) → follow [setup.md](setup.md)
- **Codex** (VS Code sidebar, prompt-based, friendlier for non-developers) → follow [setup-codex.md](setup-codex.md)

Both tracks finish at the same place. The AI tool is the only thing that differs.
