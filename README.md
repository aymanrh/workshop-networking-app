# Workshop Starter Kit — `00-empty`

This is the starting branch for the **AI-Assisted Development with GSD** workshop (2 hours, groups of 5–7).

Participants begin here, run `/gsd new-project` as a group, then move through pre-built branches to explore each GSD checkpoint.

---

## Branch Map

```
00-empty  →  01-planning  →  02-discussion  →  03-milestone
  Start         GSD output      Phase context     Running app
  here          + research       + decisions       + tests + ship
```

---

## Files in this branch

| File | Purpose |
|------|---------|
| [`workshop.html`](workshop.html) / [`workshop.md`](workshop.md) | Step-by-step participant guide for this branch |
| [`setup.html`](setup.html) / [`setup.md`](setup.md) | Pre-workshop install guide (Node, Git, VS Code, Claude Code) |
| [`overview.html`](overview.html) / [`overview.md`](overview.md) | Full repo map — what each branch contains |
| [`agenda-participant.html`](agenda-participant.html) / [`agenda-participant.md`](agenda-participant.md) | 2-hour agenda for participants |
| [`agenda-facilitator.html`](agenda-facilitator.html) / [`agenda-facilitator.md`](agenda-facilitator.md) | Facilitator timing, talking points, watch-fors (internal) |

---

## Quick Start

### Before the workshop

Complete the setup guide and post your confirmation screenshot in the WhatsApp group:

```bash
node -v && git --version && claude --version
```

### On workshop day

1. Open `workshop.html` (or `workshop.md`) in this branch — follow the steps
2. Run `/gsd new-project` in Claude Code and answer the questions as a group
3. Switch to `01-planning` to explore the generated output

```bash
git checkout 01-planning
```

---

## Tools used

- [GSD](https://github.com/getgsd/gsd) — spec-driven AI development workflow
- [Claude Code](https://claude.ai/code) — AI coding assistant (technical track)
- [claude.ai](https://claude.ai) or Codex — browser/IDE alternative (non-technical track)
