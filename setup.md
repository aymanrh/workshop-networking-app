# Workshop Setup Guide

**Complete this before the workshop day**

> **Before the workshop:** Complete all steps below and post a screenshot in the WhatsApp group to confirm you're ready. Aim to do this by Thursday, May 28.

---

## 1. VS Code

Download from [code.visualstudio.com](https://code.visualstudio.com). Then install these extensions (search in the Extensions panel):

- **ESLint** — flags code errors as you type
- **Prettier** — auto-formats code
- **GitLens** — makes Git history visible

- [ ] VS Code installed with ESLint, Prettier, GitLens

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

## 3. Node.js

Download from [nodejs.org](https://nodejs.org) — choose the LTS version.

```
node -v
```

Expected: `v20.x.x` or higher

- [ ] `node -v` shows a version number

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
git clone https://github.com/aymanrh/workshop-networking-app.git
cd workshop-networking-app
git branch -a
```

Expected: you should see two branches — `main` (the finished v1 app for reference) and `setup` (the starter scaffold you'll build on during the workshop).

- [ ] Repo cloned, both branches visible

---

## WhatsApp Confirmation

Once all steps are done, take a screenshot showing your terminal with these three commands and post it in the workshop WhatsApp group:

```
node -v && git --version && claude --version
```

This confirms you're ready and helps the facilitator identify who needs pre-workshop support.
