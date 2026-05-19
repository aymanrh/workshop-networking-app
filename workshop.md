# Workshop — Step 00: Start Here

**AI-Assisted Development with GSD** · 2 hours · Groups of 5–7 · Branch: `00-empty`

---

## Your pre-assigned role for this session

| Role | Badge |
|------|-------|
| BA / PO | Product perspective |
| Developer | Technical feasibility |
| Tester / QA | Quality perspective |

> Your role was assigned from your registration — ask your facilitator if unsure.

---

> **Core idea:** Your prompt IS your spec. What you tell the AI right now determines everything it builds downstream — the roadmap, the requirements, the architecture. Take your time here.

---

## Step 1 — Preflight: confirm your setup is ready

Before you can run any AI tools, your machine needs Node.js, Git, VS Code, and either Claude Code or Codex. If you're not set up, open `setup.html` (or `setup.md`) now.

- [ ] Node.js installed — `node -v` shows a version number
- [ ] Git installed — `git --version` works
- [ ] VS Code open with this project folder
- [ ] Claude Code or Codex is ready (see Step 2)

---

## Step 2 — Open your AI assistant

You can use either Claude Code (terminal-based, runs GSD commands directly) or Codex/Claude in a browser tab (great for non-technical roles — just paste prompts).

### Technical (Claude Code)

Open your terminal inside VS Code (`Ctrl+`` ` or `Cmd+`` `) and run:

```
claude
```

Expected: Claude Code launches and shows a prompt.

### Non-Technical (Claude / Codex)

Open [claude.ai](https://claude.ai) in a browser tab, or open the Codex sidebar in VS Code (Extensions → Codex). You'll paste prompts directly into the chat.

- [ ] AI assistant is open and ready to accept input

---

## Step 3 — Start a new project

**What this does:** Launches the GSD project wizard. It asks you a series of questions about what you're building — your answers become `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, and 4 research files. The AI does the research; you provide the intent.

### Technical

```
/gsd new-project
```

Type this in your Claude Code terminal and press Enter.

### Non-Technical

> **Paste into Claude or Codex:**
>
> Start a new project with me. Ask me setup questions one at a time — project name, the problem it solves, who it's for, core features, what's out of scope, technology preferences, constraints, and what success looks like. After I answer all questions, generate the planning files: PROJECT.md, ROADMAP.md, and REQUIREMENTS.md.

**What to expect:**

GSD will ask 6–8 questions, one at a time:

1. What is your project name?
2. What problem does it solve? Who is it for?
3. What are the core features for v1?
4. What is explicitly out of scope?
5. What technology preferences do you have?
6. What are the key constraints?
7. What does success look like?
8. Any other context?

After all answers, it runs research agents and creates `.planning/`

---

## Step 4 — Answer the questions together, as a group

**Do not answer alone.** Each GSD question is a product decision. Use your role to contribute your perspective. One person types or pastes the agreed answer.

> **Timer: 8 minutes** — covers all questions · one person types · everyone contributes

### GSD Question 1 of 8

> "What is your project name and what problem does it solve? Who is it for?"

| Role | Angle |
|------|-------|
| **BA / PO** | Who is the user? What pain point are we solving? What does success look like for them? |
| **Developer** | Is this problem clear enough to build? What's technically ambiguous? |
| **Tester / QA** | How would we verify this solves the stated problem? What's measurable? |

### GSD Question 2 of 8

> "What are the core features for version 1?"

| Role | Angle |
|------|-------|
| **BA / PO** | What delivers the most user value first? What's a nice-to-have vs. must-have? |
| **Developer** | Which features are technically risky or time-consuming? What's the simplest slice? |
| **Tester / QA** | Which features are hardest to test or most likely to break? What needs acceptance criteria? |

### GSD Question 3 of 8

> "What is explicitly out of scope for v1?"

| Role | Angle |
|------|-------|
| **BA / PO** | What are we deliberately NOT building? What business risk does this create? |
| **Developer** | What technical shortcuts are acceptable because of this scope? |
| **Tester / QA** | What edge cases do we explicitly not need to test? What's the risk of that? |

> **Tip:** The AI will accept any answer but build exactly what you describe. Vague input = vague output. Specific, opinionated answers produce better plans.

---

## Step 5 — Switch to the output branch

**What this does:** Instead of waiting for GSD to finish (it can take 5–10 minutes), we've pre-built the output on the `01-planning` branch. Switch now to see what a completed run looks like — then explore and discuss.

### Technical

```
git checkout 01-planning
```

### Non-Technical

> **Paste into Claude or Codex:**
>
> Switch to the 01-planning branch so we can see the output that GSD would have produced. Then open the workshop.html file on that branch to continue.

After switching branches, open **workshop.html** in your browser to continue — it will have the steps for exploring the planning output.

- [ ] Switched to `01-planning` branch and opened `workshop.html`
