# Workshop — Build a real app with GSD in 2 hours

**AI-Assisted Development with GSD · 2 hours · Groups of 5–7 · Branch: `setup`**

> **Core idea:** Your prompt IS your spec. What you tell the AI right now determines everything it builds downstream — the roadmap, the requirements, the architecture, the tests. Take your time at each step.

---

## Your role today

| Role | Perspective |
|------|-------------|
| **BA / PO** | Product perspective |
| **Developer** | Technical feasibility |
| **Tester / QA** | Quality perspective |

Pre-assigned from your registration. Each group has all 3 roles — everyone contributes to every step.

---

## How this guide is structured

You'll work through **5 steps** in 2 hours. Each step:

- Has a **Technical** path (Claude Code in your terminal) and a **Non-Technical** path (Codex sidebar or claude.ai in a browser tab). Use whichever your setup got you.
- Ends with a checkpoint. Tick it before moving on.
- Points back at the **`main`** branch (the finished v1) when you want to see "what's this supposed to look like?".

We stay on the **`setup`** branch the whole time. Nothing to switch — what we build, we build live.

---

## Step 1 — Confirm your setup

Before anything else, prove your machine is ready.

- [ ] Repo is open in VS Code on the `setup` branch — run `git branch --show-current` to confirm
- [ ] Node 20+: `node -v`
- [ ] Git: `git --version`
- [ ] AI assistant works:
  - **Claude Code track:** run `claude --version` in the terminal
  - **Codex track:** open the Codex sidebar in VS Code and send `say hello`
  - **Browser fallback:** [claude.ai](https://claude.ai) is open in a tab

If any of these fail, ping the facilitator now — Step 2 needs all of them.

- [ ] All four checks pass

---

## Step 2 — Open your AI assistant in the right place

**Technical (Claude Code)**

Open the integrated terminal in VS Code (`` Ctrl+` `` or `` Cmd+` ``) and run:

```
claude
```

You should see the Claude Code prompt. Leave that pane open — every GSD command in this guide goes here.

**Non-Technical (Codex or claude.ai)**

- **Codex:** open the Codex sidebar from VS Code's left rail. Click "New chat" if it's blank.
- **claude.ai:** open [claude.ai](https://claude.ai) in a browser tab next to your VS Code window.

For the non-technical path, every "run this command" instruction below gives you a **paste-into-chat** version. Use it instead of the slash-command.

- [ ] AI assistant is open and accepting input

---

## Step 3 — Kick off a fresh project together (8 min)

**What this does:** Launches the GSD project wizard. It asks 6–8 questions about what you're building — your answers become `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, plus four research files (SUMMARY, PITFALLS, ARCHITECTURE, STACK, FEATURES). The AI does the research; you provide the intent.

**Technical**

```
/gsd-new-project
```

**Non-Technical** — paste into Codex / claude.ai:

> Start a new GSD project with me for a "personal networking app" — a local-first mini-CRM for working professionals to track people they meet at events. Ask me setup questions one at a time — project name, the problem it solves, who it's for, core features, what's out of scope, technology preferences, constraints, what success looks like. After I answer all questions, write the planning files: `PROJECT.md`, `ROADMAP.md`, and `REQUIREMENTS.md` under `.planning/`.

**What to expect**

GSD asks 6–8 questions, one at a time:

1. What is your project name?
2. What problem does it solve? Who is it for?
3. What are the core features for v1?
4. What is explicitly out of scope?
5. What technology preferences do you have?
6. What are the key constraints?
7. What does success look like?
8. Any other context?

After all answers, it runs research agents and creates the `.planning/` directory.

### Answer the questions together, as a group

**Do not answer alone.** Each GSD question is a product decision. One person types — everyone contributes from their role's perspective.

> ⏱ **Timer: 8 minutes** — covers all questions.

| Role | What you bring |
|------|----------------|
| **BA / PO** | Who is the user? What pain point? What does success look like? |
| **Developer** | Is the spec clear enough to build? What's technically ambiguous? |
| **Tester / QA** | How would we verify this? What's measurable? What edge cases? |

> **Tip:** The AI will accept any answer but build exactly what you describe. Vague input = vague output. Specific, opinionated answers produce better plans.

### Peek at the reference

When GSD finishes, compare your output with the v1 reference:

```
git show main:.planning/PROJECT.md
```

(Press `q` to quit the pager.)

- [ ] `.planning/PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, and `research/` exist on disk

---

## Step 4 — Discuss phase 1 (15 min)

**What this does:** Before writing any code, GSD pulls out the *decisions* the agent would otherwise make on its own — the gray areas in your spec. You answer them, the agent locks them in `CONTEXT.md`, and the plan that follows respects every answer.

This is the BDD-before-the-Gherkin moment. It's the single biggest place where humans stay in the loop.

**Technical**

```
/gsd-discuss-phase 1
```

**Non-Technical** — paste into Codex / claude.ai:

> Run `/gsd-discuss-phase 1` on the project we just created. Surface the gray areas in phase 1 — the decisions the agent would otherwise make by itself. Ask me about each one in turn, then write `.planning/phases/01-*/01-CONTEXT.md` and `01-DISCUSSION-LOG.md` capturing every answer.

### Watch for

| Role | What to look for |
|------|------------------|
| **BA / PO** | Anything the AI inferred from your spec — is it what you meant? |
| **Developer** | Architectural choices being made implicitly. Push to surface them. |
| **Tester / QA** | Anything left to "agent's discretion" — that's a test case you don't have yet. |

> **Concept hook:** "`CONTEXT.md` is your Gherkin before the Gherkin. Everything left to the agent's discretion is a test case you don't yet have."

### Peek at the reference

```
git show main:.planning/phases/01-foundation-static-export-spine/01-CONTEXT.md
```

- [ ] `01-CONTEXT.md` written, with the group's decisions visible in the "Decisions" section

---

## Step 5 — Execute the phase, run the app, ship (30 min)

**What this does:** GSD turns the locked context into a detailed `PLAN.md`, then executes it — writes code, runs the unit tests, runs Playwright E2E, produces a `VERIFICATION.md` flagging anything a human still needs to check. Then you ship.

**Technical**

```
/gsd-execute-phase 1
```

This will take a few minutes. While it runs, the facilitator is showing slides on what GSD is doing under the hood (planning → atomic plans → wave-based execution → verification).

**Non-Technical** — paste into Codex / claude.ai:

> Now run `/gsd-execute-phase 1`. Write `.planning/phases/01-*/01-PLAN.md` first, then implement everything in the plan: Next.js scaffolding, Dexie schema, basic shell, dark mode, dynamic `[id]` routes proven, first GH Pages deploy stub. Run `npm install`, run the test suite, and write `01-SUMMARY.md` + `01-VERIFICATION.md` when done.

### Run the app

When `execute-phase` finishes, you should be able to:

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The starter shell should render — sidebar, top bar, empty People list, dark-mode toggle.

### Run the tests

```
npm test
```

Vitest runs. You should see green dots. If anything's red, that's a teaching moment — show the failure to the facilitator.

### UAT discussion (5 min, as a group)

Open `.planning/phases/01-*/01-VERIFICATION.md`. The agent has written down what it *couldn't* verify on its own — the bits that need a human.

| Role | What you're checking |
|------|----------------------|
| **BA / PO** | Does this feel like the product you described? |
| **Developer** | Is the code shape something you'd build on? |
| **Tester / QA** | What's the agent admitting it can't test? That's your scope. |

> **Concept hook:** "The AI wrote the code AND the tests. What does a human still own? `VERIFICATION.md` is where the AI admits what it couldn't check. That's your role."

### Ship + open milestone 2

```
/gsd-ship
/gsd-new-milestone
```

Or for the non-technical track:

> Ship the current milestone with `/gsd-ship`, then open milestone 2 with `/gsd-new-milestone`. The next milestone is integrations + CI/CD — we won't build it today, just open it as a teaser.

- [ ] App runs locally on `http://localhost:3000`
- [ ] Tests pass
- [ ] `01-VERIFICATION.md` read and discussed
- [ ] Milestone 1 shipped, milestone 2 opened

---

## You're done

In 2 hours your group went from "blank repo" to "running, tested, shipped v1 scaffold" — with every decision surfaced and captured, not buried inside the agent.

**Compare with `main`** at the end if you want to see how far the reference goes — full People/Events CRUD, search, JSON export, all 4 phases shipped.

```
git diff setup main --stat
```

**What to try after today**

- Fork the repo and run `/gsd-next` to keep going — phase 2 onwards is yours
- Read `.planning/research/PITFALLS.md` on `main` for what tripped us up the first time
- Try the same workflow on a project you actually want to build
