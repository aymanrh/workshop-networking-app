---
quick_id: 20260519-workshop-prep-cleanup
completed: 2026-05-19
status: complete
commits:
  - becfdfe   # main: README cleanup
  - 950a6bd   # setup root commit
  - d411289   # main: deploy.yml bundles setup HTML at /setup/
  - fee5089   # setup: date / step reorder / repo URL
  - a5c2a03   # setup: zero-friction audit (drop screenshot+Codex, add quick-check)
  - 18b7cb6   # main: deploy.yml also triggers on setup pushes
---

# Quick Task Summary: Workshop Prep Cleanup

## Outcome

Three rounds of workshop-prep work bundled into one quick task. All shipped to `origin`.

## Round 1 — README cleanup

Removed `README.md` line 9 (workshop date + starter-kit external link). With the starter kit now living on the `setup` branch of this repo, the external link became redundant; the date didn't earn its space for attendees forking after the session.

- Commit: `becfdfe` on `main`
- Diff: `-2` lines

## Round 2 — Orphan `setup` branch

Created `origin/setup` as an orphan branch (no shared history with `main`) containing the file tree of `aymanrh/workshop-starter-kit-30-05-25` @ `a552449`, squashed to a single commit.

- Root commit on `setup`: `950a6bd`
- 30 files imported
- `main` worktree untouched throughout — staging happened in `D:/Personal/Projects/_setup-staging`, removed after push

### Carry-over (informational)

The source starter-kit repo's HEAD includes likely-leaked build artifacts: `playwright-report/` (5 PNGs + index.html), `test-results/` (7 PNGs + .last-run.json), `tsconfig.tsbuildinfo` (82 KB). Copied as-is per the chosen approach ("copy files"). Worth cleaning up at the source repo before workshop day, or stripping via a follow-up commit on `setup`.

## Round 3 — `setup` content fixes + GH Pages bundling

After the orphan branch was in place, the user requested four follow-ups: publish the setup branch on Pages, change the deadline phrasing to May 28, reorder steps with VS Code first, and point the clone step at this repo instead of the old `nourax/new-application-430` URL.

Shipped as two commits on `setup` (content) and two commits on `main` (deploy plumbing).

**Setup content (`fee5089` then `a5c2a03`):**

- Deadline phrased explicitly: *"Aim to do this by Thursday, May 28."*
- Steps reordered: VS Code → Git → Node.js → Claude Code → Codex (later removed) → Clone, then collapsed to VS Code → Git → Node.js → Claude Code → Clone
- Step 6 (clone) repointed to `https://github.com/aymanrh/workshop-networking-app.git`; expected branches updated to the actual `main` + `setup` layout
- **Zero-friction audit** (per follow-up instruction):
  - Dropped the WhatsApp screenshot verification block; checkpoint boxes are enough on their own. WhatsApp now appears only as a help-channel fallback in a small troubleshooting table.
  - Dropped the standalone Codex step. Workshop is built around Claude Code (per `CLAUDE.md`); `claude.ai` in the browser remains as the in-tab fallback for anyone who can't install the CLI.
  - Added a top "Quick check" so attendees with `code`, `git`, and `node >= 20` can paste one line and jump straight to Step 4.
  - Removed the inconsistent OS tabs (they only ever applied to Node).
  - Added `code .` after clone so the repo lands in VS Code without a context switch.
  - Inlined a small troubleshooting table (`code not found` on Mac, npm permissions, browser-stuck `claude`).
  - Tightened copy across the board; both `setup.md` and `setup.html` rewritten consistently.

**Deploy plumbing (`d411289` then `18b7cb6`):**

- Extended `.github/workflows/deploy.yml` to run `actions/checkout@v4` a second time with `ref: setup, path: setup-branch`, then `rsync` its contents (minus `.git` and `.github`) into `out/setup/` before the Pages artifact upload
- Result: deployed site now serves the v1 app at `/workshop-networking-app/` AND the workshop guide at `/workshop-networking-app/setup/setup.html`
- Trigger expanded so `setup`-branch pushes also refresh Pages (avoids the stale-bundle gotcha where setup-branch edits stayed invisible until something on `main` was pushed)

## Verification

- `git ls-remote origin refs/heads/setup` → `a5c2a03` ✓
- `git ls-remote origin refs/heads/main` → `18b7cb6` ✓
- `gh run list --workflow="Deploy to GitHub Pages"` shows the `bundle setup-branch HTML under /setup/` run succeeded (54s); the trigger-update run was in progress at sign-off — confirm via `gh run watch` if needed
- `git status` on `main` after all rounds → clean
- Worktree `_setup-edit` removed; `git worktree list` shows only the main repo

## Out of Scope (deferred)

- Fix for dynamic-route 404 on GH Pages — captured in `.planning/todos/pending/2026-05-19-fix-dynamic-route-404-gh-pages.md` (now somewhat overshadowed by the deploy-workflow changes here, but still real)
- Cleanup of leaked build artifacts on the starter-kit source (`playwright-report/`, `test-results/`, `tsconfig.tsbuildinfo`)
- Audit of the other workshop materials on `setup` (`overview.md/html`, `agenda-*.md/html`, `workshop.md/html`) — only `setup.*` was redesigned in Round 3
