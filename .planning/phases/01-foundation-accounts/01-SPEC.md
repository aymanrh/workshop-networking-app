# Phase 1: Foundation & Accounts — Specification

**Created:** 2026-05-30
**Ambiguity score:** 0.14 (gate: ≤ 0.20)
**Requirements:** 8 locked

## Goal

A running local-first Next.js app where a visitor can create a name+email+role account (graduate or business owner) stored in IndexedDB, log in password-lessly by email, switch between multiple local accounts, and stay logged in across page refreshes — with navigation that differs by role.

## Background

The repository is an empty workshop starter (branch `00-empty`): the only tracked source is `README.md` (plus a generated `CLAUDE.md`). There is **no `package.json` and no application source** — the app does not boot today.

However, `node_modules/` and `.next/` carry over from the intended build and pin the stack: **Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS 4**, with **Dexie 4 (IndexedDB)** and `dexie-react-hooks` as the data layer, **zustand 5** for client state, **react-hook-form 7 + zod 3** for forms/validation, Radix UI + `class-variance-authority` + `lucide-react` + `sonner` for UI, and **vitest + @testing-library/react + @playwright/test** for testing. Notably absent: any backend framework, server DB driver, auth library, or password-hashing library.

This confirms a **local-first, browser-only** architecture. "Accounts" here are lightweight local user records in IndexedDB with a role — not server-side authenticated identities. The gap this phase closes: stand up the app skeleton, the Dexie data layer, and role-aware local accounts with session persistence. Rich graduate profiles (portfolio, skill challenges) are Phase 2; postings, discovery, matchmaking, and messaging are Phases 3–4.

## Requirements

1. **App scaffold boots**: A Next.js 16 App-Router app exists and runs.
   - Current: No `package.json` and no source; the app does not boot
   - Target: `package.json` with scripts; a home route renders; project builds
   - Acceptance: `npm run dev` serves the home page with no console errors; `npm run build` exits 0

2. **Dexie data layer**: An IndexedDB-backed `accounts` store persists local users.
   - Current: No database or persistence of any kind
   - Target: A Dexie database with an `accounts` table — fields: `id` (internal key), `name`, `email` (unique), `role` (`graduate` | `business_owner`), `createdAt`
   - Acceptance: Records written to `accounts` survive a full page reload; querying by email returns the matching account

3. **Account creation (sign-up)**: A visitor creates a local account with name + email + role.
   - Current: No sign-up flow exists
   - Target: A sign-up form (react-hook-form + zod) that creates a Dexie account and logs the user in; email is the unique key (case-insensitive)
   - Acceptance: Sign-up with a new email creates exactly one account and leaves the user logged in as it

4. **Duplicate-email rejection**: Signing up with an existing email is rejected.
   - Current: No uniqueness enforcement exists
   - Target: Sign-up detects an existing email and shows an inline error suggesting login; no account is created
   - Acceptance: Submitting sign-up with an email already in `accounts` shows a duplicate error and the `accounts` count is unchanged

5. **Password-less login by email**: A returning user logs in by entering their email.
   - Current: No login flow exists
   - Target: A login form takes an email, finds the matching local account, and sets it as the current user; an unknown email shows an error
   - Acceptance: Login with an existing account's email succeeds and reflects that account's role; login with an unknown email shows a "no account found" error and logs no one in

6. **Multiple accounts + switching/logout**: Several local accounts can coexist; the user can switch.
   - Current: No accounts and no concept of a current user
   - Target: Multiple accounts persist in Dexie simultaneously; a logout action clears the current user; the user can then log in as a different account
   - Acceptance: With one graduate and one business-owner account present, the user can log out and log in as the other; the active role updates accordingly

7. **Session persistence across refresh**: The logged-in user survives a refresh, clears on close.
   - Current: No session state exists
   - Target: The current account id is held in `sessionStorage` (survives refresh/navigation, cleared when the tab/browser closes); logout clears it immediately
   - Acceptance: After login, refreshing the page keeps the user logged in; after logout, the app shows the logged-out state

8. **Role-aware navigation with placeholders**: Navigation differs by role.
   - Current: No navigation or app shell exists
   - Target: A graduate sees graduate nav (e.g., Profile, Browse); a business owner sees owner nav (e.g., Post a Job, Find Talent); links that target not-yet-built features route to a "coming soon" stub page
   - Acceptance: A logged-in graduate sees graduate nav links; a logged-in business owner sees owner nav links; clicking a not-yet-built link renders a "coming soon" page

## Boundaries

**In scope:**
- Next.js 16 app scaffold that runs (`npm run dev`) and builds (`npm run build`)
- Dexie/IndexedDB data layer with an `accounts` table (unique email)
- Sign-up: name + email + role (graduate | business owner), with duplicate-email rejection
- Password-less login by email, with unknown-email error
- Multiple coexisting local accounts, account switching, and logout
- Session persistence via `sessionStorage` (survives refresh, clears on tab/browser close)
- Role-aware app-shell navigation with "coming soon" placeholder pages
- First-run / logged-out state that prompts sign-up or login

**Out of scope:**
- Passwords, hashing, email verification, password reset — local-first and password-less by design (no security boundary in v1)
- Rich graduate/owner profile content — bio, portfolio, work samples, skills, skill challenges, avatar — that is Phase 2
- Postings, applications, search, matchmaking, and messaging — Phases 3–4
- Any real backend, API, or cross-device sync — browser-local only in v1
- Editing or deleting an existing account — not required to satisfy Phase 1 goals (revisit later)

## Constraints

- **Local-first, browser-only**: all data lives in IndexedDB via Dexie 4; no network/API calls for account data.
- **Stack is fixed by the starter**: Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS 4; forms via react-hook-form 7 + zod 3; client state via zustand 5; UI primitives from the installed Radix UI / `class-variance-authority` / `lucide-react` / `sonner`.
- **Email is the unique account key** and should be matched case-insensitively.
- **Session semantics**: `sessionStorage` — must survive refresh and in-app navigation, and clear when the tab/browser closes.
- **Testing tools available**: vitest + @testing-library/react for unit/component tests; @playwright/test for end-to-end.

## Acceptance Criteria

- [ ] `npm run dev` serves the app and the home route renders without console errors
- [ ] `npm run build` completes successfully (exit 0)
- [ ] A Dexie `accounts` table persists records across a full page reload
- [ ] Signing up with name + email + role creates exactly one account and logs the user in
- [ ] Signing up with an email that already exists is rejected with an error and creates no new account
- [ ] Logging in with an existing account's email succeeds and reflects that account's role
- [ ] Logging in with an unknown email shows a "no account found" error and logs no one in
- [ ] One graduate and one business-owner account can coexist; the user can log out and log in as the other
- [ ] After logging in and refreshing the page, the user remains logged in
- [ ] Logging out clears the current user and returns to the logged-out state
- [ ] A logged-in graduate sees graduate navigation; a business owner sees business-owner navigation
- [ ] A not-yet-built navigation link renders a "coming soon" placeholder page

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                              |
|--------------------|-------|------|--------|----------------------------------------------------|
| Goal Clarity       | 0.88  | 0.75 | ✓      | Local-first account model fully specified          |
| Boundary Clarity   | 0.88  | 0.70 | ✓      | Explicit in/out lists; profiles & security deferred|
| Constraint Clarity | 0.80  | 0.65 | ✓      | Stack, email-unique, sessionStorage all locked     |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 12 pass/fail criteria                              |
| **Ambiguity**      | 0.14  | ≤0.20| ✓      | Gate passed after 3 rounds                          |

Status: ✓ = met minimum, ⚠ = below minimum (planner treats as assumption)

## Interview Log

| Round | Perspective          | Question summary                          | Decision locked                                                        |
|-------|----------------------|-------------------------------------------|------------------------------------------------------------------------|
| 1     | Researcher           | Local-first vs backend? What is "login"?  | Local-first browser-only (Dexie); lightweight local profile, no passwords |
| 2     | Researcher+Simplifier| Signup fields? Multi-account? Session?     | Name+email+role; multiple accounts + switching; sessionStorage (clears on close) |
| 3     | Boundary Keeper      | Duplicate email? Role nav? What's OUT?     | Reject duplicate email; role nav + "coming soon" stubs; profiles & security out |

---

*Phase: 01-foundation-accounts*
*Spec created: 2026-05-30*
*Next step: /gsd-discuss-phase 1 — implementation decisions (how to build what's specified above)*
