---
quick_id: 20260519-workshop-prep-cleanup
completed: 2026-05-19
status: complete
commits:
  - becfdfe  # README cleanup (main)
  - 950a6bd  # setup branch root commit (origin/setup)
---

# Quick Task Summary: Workshop Prep Cleanup

## Outcome

Both chores shipped.

## Task 1 — README cleanup

Removed `README.md` line 9 (workshop date + starter-kit external link).

- Commit: `becfdfe` on `main` — `docs(readme): drop workshop date + starter-kit link`
- Diff: 1 file, -2 lines (the line itself plus the blank line above it that became redundant — confirmed by `git diff --stat`)
- Verified: surrounding paragraph and `---` separator intact; markdown still renders cleanly

## Task 2 — Orphan `setup` branch

Created `origin/setup` containing the starter-kit file tree from
`https://github.com/aymanrh/workshop-starter-kit-30-05-25` @ `a552449`.

- Root commit on `setup`: `950a6bd` — `chore(setup): seed starter-kit contents for workshop attendees`
- 30 files imported as a single orphan commit (no shared history with `main`)
- Push verified: `git ls-remote origin refs/heads/setup` → `950a6bd`
- `main` worktree untouched throughout — never checked out, never reset; staging happened in `D:/Personal/Projects/_setup-staging` (removed after push)

### Carry-over note (informational, not a defect of this task)

The starter-kit repo's HEAD includes three folders/files that look like leaked build artifacts:

- `playwright-report/` (5 PNG screenshots + `index.html`)
- `test-results/` (7 PNG screenshots + `.last-run.json`)
- `tsconfig.tsbuildinfo` (82 KB build cache)

These were copied as-is per the chosen approach ("copy files"). They are noise in a starter scaffold and should probably be cleaned up at the source repo (`aymanrh/workshop-starter-kit-30-05-25`) and re-imported, or stripped via a follow-up commit on `setup`. Captured as a follow-up consideration; intentionally NOT cleaned here to preserve a true mirror.

## Verification

- `git ls-remote origin refs/heads/setup` → `950a6bd4e48704a36f7bb07566e793f88e56b576` ✓
- `git log --oneline setup` (in staging before deletion) → single commit ✓
- `git diff --stat README.md` → `-2 lines` ✓
- `git status` on `main` after both tasks → clean (only the quick-task docs untracked) ✓

## Out of Scope (deferred)

- Fix for dynamic-route 404 on GH Pages — captured in `.planning/todos/pending/2026-05-19-fix-dynamic-route-404-gh-pages.md`
- Cleanup of starter-kit build-artifact files (noted above)
