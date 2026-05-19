# Workshop Setup Guide

**Ready in 10 minutes.** Complete by **Thursday, May 28** — two days before we meet.

---

## Already a developer? Quick check

Paste this into a terminal:

```
code --version && git --version && node -v
```

If all three print versions and `node -v` shows **v20** or higher → jump to **Step 4 (Claude Code)**, then **Step 5 (Clone)**. Otherwise start at Step 1.

---

## 1. VS Code

Install from [code.visualstudio.com](https://code.visualstudio.com).

Open VS Code, press `Cmd/Ctrl+Shift+X`, install these three:

- **ESLint** — flags code errors as you type
- **Prettier** — auto-formats code
- **GitLens** — makes Git history visible

> **Mac tip:** open the Command Palette (`Cmd+Shift+P`) and run `Shell Command: Install 'code' command in PATH` so the `code` command works from your terminal.

- [ ] VS Code installed with the three extensions

---

## 2. Git

Install from [git-scm.com](https://git-scm.com), then tell Git who you are (one-time, machine-wide):

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

> Already configured? Run `git config --global user.name` — if it prints your name, skip the two commands above.

- [ ] `git --version` prints a version

---

## 3. Node.js

Install **LTS v20 or higher** from [nodejs.org](https://nodejs.org). The installer ships `npm` too.

- [ ] `node -v` prints `v20.x.x` or higher

---

## 4. Claude Code

Claude Code is the AI agent we'll drive throughout the workshop.

1. Create a free account at [console.anthropic.com](https://console.anthropic.com) — the free tier is enough for the workshop.
2. Install the CLI:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. Run it once — it will open your browser to sign you in:
   ```
   claude
   ```

> **No Anthropic account, or `npm install -g` fails?** Use [claude.ai](https://claude.ai) in a browser tab instead. You'll lose the auto-execution loop but can still follow along with copy-paste.

- [ ] `claude --version` prints a version (or claude.ai is open in a tab)

---

## 5. Clone the workshop repo

```
git clone https://github.com/aymanrh/workshop-networking-app.git
cd workshop-networking-app
code .
```

That opens the repo in VS Code. You'll see two branches:

- **`main`** — the finished v1 app for reference
- **`setup`** — the starter scaffold and workshop materials (this guide lives here)

Switch to the workshop branch before we meet:

```
git checkout setup
```

- [ ] Repo open in VS Code on the `setup` branch

---

## You're done

When the boxes above are all ticked, you're ready. See you on **May 30**.

## If something fails

| Symptom | Fix |
|---------|-----|
| `command not found: code` (Mac) | VS Code → `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH" |
| `npm install -g` permission error | Mac/Linux: prefix with `sudo`. Windows: run terminal as Administrator. |
| `claude` won't open the browser | Run `claude --version` first; if it works, run `claude` again. Still stuck? Use [claude.ai](https://claude.ai) in a browser tab. |
| Anything else | Drop a message in the workshop WhatsApp group — a facilitator will help. |
