# Workshop Starter — `setup` branch

This is the starting branch for the **AI-Assisted Development with GSD** workshop (2 hours, groups of 5–7).

Participants spend the whole 2 hours **here**. We build a real app live, together, using GSD + Claude Code (or Codex for the non-technical track). The finished v1 reference lives on **`main`** — peek with `git show main:...` when you want to see "what's this supposed to look like?".

---

## Repo map

```
setup   →   (live, 2 hours)   →   main
starter        GSD walkthrough        finished v1
+ guides       (build it together)    + tests + Pages deploy
```

Two branches. That's it. Everything else is built in the room.

---

## Files in this branch

| File | Purpose |
|------|---------|
| [`workshop.html`](workshop.html) / [`workshop.md`](workshop.md) | Step-by-step guide for the 2-hour live build |
| [`setup.html`](setup.html) / [`setup.md`](setup.md) | Pre-workshop install guide — **Claude Code** track |
| [`setup-codex.html`](setup-codex.html) / [`setup-codex.md`](setup-codex.md) | Pre-workshop install guide — **Codex** track |
| [`overview.html`](overview.html) / [`overview.md`](overview.md) | How to use this repository (start here) |
| [`agenda-participant.html`](agenda-participant.html) / [`agenda-participant.md`](agenda-participant.md) | 2-hour agenda — participant view |
| [`agenda-facilitator.html`](agenda-facilitator.html) / [`agenda-facilitator.md`](agenda-facilitator.md) | Facilitator timing, talking points, watch-fors (internal) |

---

## Quick Start

### Before the workshop

Pick your AI track and follow that setup guide — finish by **Thursday, May 28**:

- **Claude Code** (recommended): [`setup.md`](setup.md)
- **Codex** (non-technical track): [`setup-codex.md`](setup-codex.md)

Quick check that you're ready:

```bash
node -v && git --version && code --version
```

### On workshop day

1. Stay on the `setup` branch the whole time — do **not** check out `main` mid-session
2. Open [`workshop.md`](workshop.md) (or `workshop.html` on the published site) — follow the 5 steps
3. Run `/gsd-new-project` in Claude Code and answer the questions as a group
4. Continue through `/gsd-discuss-phase 1` → `/gsd-execute-phase 1` → `/gsd-ship`
5. Compare your output with `main` at the end: `git diff setup main --stat`

---

## Tools used

- [GSD](https://github.com/getgsd/gsd) — spec-driven AI development workflow
- [Claude Code](https://claude.ai/code) — AI coding assistant (technical track)
- [Codex](https://platform.openai.com) or [claude.ai](https://claude.ai) — browser/IDE alternative (non-technical track)
