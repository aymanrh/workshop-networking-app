---
created: 2026-05-19T18:02:25Z
title: Fix dynamic-route 404 on deployed GH Pages
area: deploy
files:
  - app/people/[id]/layout.tsx
  - app/events/[id]/layout.tsx
  - next.config.ts
  - .github/workflows/deploy.yml
---

## Problem

On the deployed GitHub Pages site (`https://aymanrh.github.io/workshop-networking-app/`), clicking a person or event from the list ends up at the home page instead of the detail screen. Both hard reloads and in-app Link clicks reproduce the issue.

Root cause: under `output: "export"` on Next 16, `generateStaticParams()` returning `[{ id: "_" }]` only emits one HTML file per dynamic route (`out/people/_/index.html`, `out/events/_/index.html`). Any real ULID URL has no matching static file, so GH Pages serves the generic Next `404.html`, which has no SPA-rehydration logic — the user lands on home. On Next 16, `dynamicParams` defaults to `false` when exporting, so the client router also rejects non-prerendered IDs.

This contradicts the assumption recorded in PROJECT.md / STATE.md ("empty `generateStaticParams()` + client `useParams` is the only viable pattern under static export"). The pattern compiles and works in dev (`E2E=1` path), but breaks on the deployed static site.

## Solution

Two viable approaches:

1. **SPA-shell 404 fallback (smaller change):** after `next build`, copy `out/index.html` to `out/404.html`, so GH Pages serves the hydratable shell for any unknown path; the client router then reads `useParams()` and renders the detail. Wire this as a small post-build step in `.github/workflows/deploy.yml` (and document for `pnpm build` local users).

2. **Per-route catch-all fallback:** copy `out/index.html` (or the prerendered `_` shell) into `out/people/[id]/index.html` / `out/events/[id]/index.html` slots so direct URLs resolve. Slightly more files, but cleaner separation from generic 404.

Recommend (1) — one extra line in the deploy workflow, no Next config change, easy to teach in the workshop.

**Verification:**
- `pnpm build && npx serve out` → click a person/event from the list and hard-reload the detail URL; both should land on the detail screen
- Confirm on deployed GH Pages after merging
- Add a Playwright check that visits `/people/<seeded-id>/` directly (currently the smoke E2E only navigates via the list)
