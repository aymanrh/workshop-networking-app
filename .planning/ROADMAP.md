# Roadmap

## Project

**Name:** Networking App
**Core Value:** Know exactly who to reach out to next, and have the context to make the conversation meaningful.
**Milestone:** v1 MVP
**Granularity:** Standard

---

## Phases

- [ ] **Phase 1: Contact Management** - User can add, edit, and delete contacts with core details
- [ ] **Phase 2: Expertise & Approach** - Contacts are tagged by expertise level and show the correct conversation framing
- [ ] **Phase 3: Value Tracking** - User can log favors and projects, and see a value balance per contact
- [ ] **Phase 4: Pinned Notes** - User can pin and remove key facts that always appear on the contact page
- [ ] **Phase 5: Follow-up Reminders** - User can set follow-up intervals and see overdue contacts highlighted in the list

---

## Phase Details

### Phase 1: Contact Management
**Goal:** Users can build and maintain their contact list with core identity details
**Mode:** mvp
**Depends on:** Nothing
**Requirements:** CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. User can add a new contact by entering name, role, company, and notes
  2. User can open an existing contact and edit any of its fields
  3. User can delete a contact and it no longer appears in the list
  4. All contacts are persisted across page refreshes
**Plans:** TBD
**UI hint:** yes

### Phase 2: Expertise & Approach
**Goal:** Each contact has an expertise tag that drives a visible approach mode on their detail page
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** CAT-01, CAT-02
**Success Criteria** (what must be TRUE):
  1. User can assign one of three expertise levels (beginner / intermediate / expert) to any contact
  2. Contact detail page shows "Peer mode" when expertise is expert
  3. Contact detail page shows "Mentorship mode" when expertise is beginner or intermediate
  4. Changing the expertise tag immediately updates the displayed approach mode
**Plans:** TBD
**UI hint:** yes

### Phase 3: Value Tracking
**Goal:** Users can log what they have given and received with each contact, and see a running balance
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** VAL-01, VAL-02, VAL-03
**Success Criteria** (what must be TRUE):
  1. User can log a favor or help item with a description, direction (given / received), and date
  2. User can log a project or deal with a title, description, and date
  3. Contact detail view shows a value balance summary: total given vs. total received across all favors and projects
  4. New log entries appear immediately in the contact's history without a page reload
**Plans:** TBD
**UI hint:** yes

### Phase 4: Pinned Notes
**Goal:** Users can surface key, always-visible facts about a contact directly on their page
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** INT-01, INT-02
**Success Criteria** (what must be TRUE):
  1. User can add a pinned note to a contact and it appears prominently on the contact detail page
  2. User can remove a pinned note and it disappears from the contact page
  3. Pinned notes persist across sessions and are always visible without scrolling to interaction history
**Plans:** TBD
**UI hint:** yes

### Phase 5: Follow-up Reminders
**Goal:** The contact list tells users who is overdue for outreach so no relationship goes cold by accident
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** FLW-01, FLW-02
**Success Criteria** (what must be TRUE):
  1. User can set a follow-up interval (in days) on any contact
  2. Contact list visually highlights contacts whose interval has elapsed since the last logged interaction
  3. A contact with no interval set is not highlighted
  4. Updating or logging a new interaction resets the overdue clock for that contact
**Plans:** TBD
**UI hint:** yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Contact Management | 0/0 | Not started | - |
| 2. Expertise & Approach | 0/0 | Not started | - |
| 3. Value Tracking | 0/0 | Not started | - |
| 4. Pinned Notes | 0/0 | Not started | - |
| 5. Follow-up Reminders | 0/0 | Not started | - |

---

## Coverage

| REQ-ID | Phase |
|--------|-------|
| CONT-01 | Phase 1 |
| CONT-02 | Phase 1 |
| CONT-03 | Phase 1 |
| CAT-01 | Phase 2 |
| CAT-02 | Phase 2 |
| VAL-01 | Phase 3 |
| VAL-02 | Phase 3 |
| VAL-03 | Phase 3 |
| INT-01 | Phase 4 |
| INT-02 | Phase 4 |
| FLW-01 | Phase 5 |
| FLW-02 | Phase 5 |

**Total:** 12/12 requirements mapped. No orphans.

---

*Last updated: 2026-05-30*
