# Roadmap: GradLink

## Overview

GradLink delivers a proof-of-skill talent marketplace in four phases. First we stand up the app and let people join as the right kind of user (graduate or business owner). Then we build the differentiator — graduate profiles enriched with portfolio work and scored skill challenges. Next, businesses post jobs and projects that graduates apply to. Finally, the two sides find each other through search, ranked matchmaking, and direct messaging — completing the core connection loop. v1 connects only; payments are a future milestone.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation & Accounts** - App exists; people join as graduate or business owner
- [ ] **Phase 2: Graduate Profiles & Proof of Skill** - Graduates build proof-rich profiles (portfolio + scored challenges)
- [ ] **Phase 3: Postings & Applications** - Businesses post work; graduates browse and apply
- [ ] **Phase 4: Discovery, Matchmaking & Messaging** - The two sides find each other and connect

## Phase Details

### Phase 1: Foundation & Accounts
**Goal**: The application exists and a visitor can join as the correct type of user.
**Depends on**: Nothing (first phase)
**Requirements**: ACCT-01, ACCT-02
**Success Criteria** (what must be TRUE):
  1. A visitor can sign up and log in as either a graduate or a business owner
  2. A logged-in user stays logged in across browser refreshes
  3. The app recognizes the two roles and shows role-appropriate navigation
**Plans**: 2 plans

Plans:
- [ ] 01-01: Project scaffolding, data layer, and base app shell
- [ ] 01-02: Role-aware accounts — signup, login, session persistence

**UI hint**: yes

### Phase 2: Graduate Profiles & Proof of Skill
**Goal**: Graduates can build profiles that prove their skills — the platform's core differentiator.
**Depends on**: Phase 1
**Requirements**: GRAD-01, GRAD-02, GRAD-03, GRAD-04
**Success Criteria** (what must be TRUE):
  1. A graduate can create and edit a profile with name, field, bio, and skills
  2. A graduate can upload portfolio items / work samples to their profile
  3. A graduate can take a platform-issued skill challenge and receive a score
  4. A graduate's challenge scores are displayed on their profile
**Plans**: 2 plans

Plans:
- [ ] 02-01: Graduate profile editor and portfolio / work-sample uploads
- [ ] 02-02: Skill challenges with scoring, displayed on the profile

**UI hint**: yes

### Phase 3: Postings & Applications
**Goal**: Business owners can post work and graduates can apply to it.
**Depends on**: Phase 1
**Requirements**: POST-01, POST-02, POST-03, POST-04
**Success Criteria** (what must be TRUE):
  1. A business owner can post a job or freelance project with title, description, and required skills
  2. A business owner can view and manage their own postings
  3. A graduate can browse open postings
  4. A graduate can apply to a posting
**Plans**: 2 plans

Plans:
- [ ] 03-01: Posting creation and management for business owners
- [ ] 03-02: Posting browse feed and graduate applications

**UI hint**: yes

### Phase 4: Discovery, Matchmaking & Messaging
**Goal**: Graduates and business owners find each other and start a conversation.
**Depends on**: Phase 2, Phase 3
**Requirements**: DISC-01, DISC-02, MATCH-01, MATCH-02, MSG-01
**Success Criteria** (what must be TRUE):
  1. A business owner can search and browse graduate profiles filtered by skill and challenge score
  2. A business owner can open a graduate's full profile, including portfolio and challenge scores
  3. The platform recommends best-fit graduates for a posting, ranked by skill proof
  4. A graduate sees postings recommended to them based on their skills and scores
  5. A graduate and business owner can exchange direct messages
**Plans**: 3 plans

Plans:
- [ ] 04-01: Graduate profile search and discovery for business owners
- [ ] 04-02: Matchmaking recommendations (grads ↔ postings) ranked by skill proof
- [ ] 04-03: Direct messaging between the two sides

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Accounts | 0/2 | Not started | - |
| 2. Graduate Profiles & Proof of Skill | 0/2 | Not started | - |
| 3. Postings & Applications | 0/2 | Not started | - |
| 4. Discovery, Matchmaking & Messaging | 0/3 | Not started | - |
