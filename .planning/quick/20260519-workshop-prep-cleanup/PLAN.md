---
quick_id: 20260519-workshop-prep-cleanup
created: 2026-05-19
status: in-progress
---

# Quick Task: Workshop Prep Cleanup

## Goal

Two unrelated workshop-prep chores grouped in one quick task because both are tiny and both touch repo-level assets attendees see on the GitHub landing page.

## Task 1 — README cleanup

Remove `README.md` line 9:

```
Workshop date: **2026-05-30** · Reference: <https://aymanrh.github.io/workshop-starter-kit-30-05-25/>
```

**Why:** the starter kit is moving into a `setup` branch of this repo (Task 2), so the external link is redundant. The workshop date adds no reader value for an attendee forking the repo later.

**Verify:** README still renders cleanly; surrounding lines (the "demo project for a 2-hour hands-on workshop..." paragraph and the `---` separator) stay intact.

## Task 2 — Orphan `setup` branch with starter-kit contents

Create a new branch named `setup` in this repo with no shared history with `main`. Branch contents = the file tree of https://github.com/aymanrh/workshop-starter-kit-30-05-25 squashed to a single commit. Push to `origin/setup`.

**Approach** (keeps `main` worktree untouched):
1. Clone `https://github.com/aymanrh/workshop-starter-kit-30-05-25` into a temp dir
2. Inside the clone, `git checkout --orphan setup` + `git add -A` + commit
3. Push to OUR origin: `git push https://github.com/aymanrh/workshop-networking-app.git setup:setup`
4. Remove the temp clone

**Verify:**
- `git ls-remote origin setup` lists the branch
- The branch's `git log` shows exactly one commit, no shared history with `main`
- `main` working tree remains clean throughout

## Out of Scope

- Fixing the dynamic-route 404 on GH Pages — captured separately as `.planning/todos/pending/2026-05-19-fix-dynamic-route-404-gh-pages.md`
- Any app source changes
- Test additions

## Must-Haves

- README line 9 removed; line count drops by exactly one
- `setup` branch exists on `origin` with starter-kit contents and one orphan commit
- `main` HEAD is unchanged in content (only adds the docs commits for this quick task)
