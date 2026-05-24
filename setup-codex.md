# Workshop Setup Guide — Codex track

**Ready in 10 minutes.** Complete by **Thursday, May 28** — two days before we meet.

> Using **Claude Code** instead? See [setup.md](setup.md). Both tracks finish at the same place; the AI tool is the only thing that differs.

---

## Already a developer? Quick check

Paste this into a terminal:

```
code --version && git --version && node -v
```

If all three print versions and `node -v` shows **v20** or higher → jump to **Step 4 (Codex)**, **Step 5 (GSD)**, then **Step 6 (Clone)**. Otherwise start at Step 1.

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

## 4. Codex in VS Code

Codex is the AI agent for the non-technical track. You'll drive it from a sidebar inside VS Code by pasting prompts straight from the workshop guide.

1. Create a free account at [platform.openai.com](https://platform.openai.com).
2. Generate an API key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → **Create new secret key** → copy it.
3. In VS Code, press `Cmd/Ctrl+Shift+X`, search **Codex**, install the extension published by OpenAI.
4. Open the Command Palette (`Cmd/Ctrl+Shift+P`) and run **Codex: Set API Key** — paste the key you copied.
5. Open the Codex sidebar (left rail) and send a test message: `say hello`. You should see a reply.

> **No OpenAI account, or the API key step fails?** Use [chatgpt.com](https://chatgpt.com) in a browser tab instead — same paste-prompts-into-chat workflow, no install needed.

- [ ] Codex sidebar replies to a test message (or chatgpt.com is open in a tab)

---

## 5. GSD (planning loop)

GSD ("Get Shit Done") is the spec-driven workflow we'll drive Codex with — it turns an idea into a roadmap of phases, then plans, builds, and verifies each one. The installer adds `$gsd-*` commands to Codex.

```
npx @opengsd/get-shit-done-redux@latest
```

When prompted, pick **Codex** as the runtime and **global** install scope so the commands work in any repo.

> Using [chatgpt.com](https://chatgpt.com) in a browser tab instead of the Codex extension? Skip this step — GSD only installs into a CLI/IDE runtime.

- [ ] Installer prints a success message and lists the `$gsd-*` commands

---

## 6. Clone the workshop repo

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
| Codex extension can't find your API key | Re-run `Codex: Set API Key` from the Command Palette and paste the key again. |
| Codex returns "insufficient quota" | Your OpenAI account needs a few dollars of credits. Top up at [platform.openai.com/billing](https://platform.openai.com/billing), or switch to the [chatgpt.com](https://chatgpt.com) browser fallback. |
| `$gsd-*` commands don't show up in Codex | Restart Codex — skills are only loaded at startup. GSD installs to `~/.codex/skills/gsd-*/`. |
| Duplicate `$gsd-*` entries listed in Codex | Your Codex CLI is older than **0.130.0**. Upgrade Codex, or ignore the duplicates — they point to the same skill. |
| GSD install seems broken | Re-run the installer — it's idempotent: `npx @opengsd/get-shit-done-redux@latest`. |
| Anything else | Drop a message in the workshop WhatsApp group — a facilitator will help. |
