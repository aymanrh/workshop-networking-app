# Workshop Setup Guide

**Complete this before the workshop day**

> **Before the workshop:** Complete all steps below and post a screenshot in the WhatsApp group to confirm you're ready. Aim to do this 24 hours before the session.

---

## 1. Node.js

Download from [nodejs.org](https://nodejs.org) — choose the LTS version.

```
node -v
```

Expected: `v20.x.x` or higher

- [ ] `node -v` shows a version number

---

## 2. Git

Download from [git-scm.com](https://git-scm.com). Then configure:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git --version
```

- [ ] `git --version` shows a version number

---

## 3. VS Code

Download from [code.visualstudio.com](https://code.visualstudio.com). Then install these extensions (search in the Extensions panel):

- **ESLint** — flags code errors as you type
- **Prettier** — auto-formats code
- **GitLens** — makes Git history visible

- [ ] VS Code installed with ESLint, Prettier, GitLens

---

## 4. Claude Code (AI assistant — Technical track)

Requires an Anthropic account at [console.anthropic.com](https://console.anthropic.com). Then install Claude Code:

```
npm install -g @anthropic-ai/claude-code
claude --version
```

- [ ] `claude --version` shows a version number

---

## 5. Codex in VS Code (AI assistant — Non-Technical alternative)

Requires a GitHub account and an OpenAI account at [platform.openai.com](https://platform.openai.com).

In VS Code: Extensions → search **Codex** → Install → `Cmd+Shift+P` → **Codex: Set API Key**

> **Note:** Non-technical participants can also use [claude.ai](https://claude.ai) in a browser tab — no installation needed.

- [ ] Codex or claude.ai ready

---

## 6. Clone the workshop repo

```
git clone https://github.com/nourax/new-application-430.git
cd new-application-430
git branch -a
```

Expected: you should see 4 branches: `00-empty`, `01-planning`, `02-discussion`, `03-milestone`

- [ ] Repo cloned, 4 branches visible

---

## WhatsApp Confirmation

Once all steps are done, take a screenshot showing your terminal with these three commands and post it in the workshop WhatsApp group:

```
node -v && git --version && claude --version
```

This confirms you're ready and helps the facilitator identify who needs pre-workshop support.
