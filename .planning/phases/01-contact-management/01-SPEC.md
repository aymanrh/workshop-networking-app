# Phase 1: Contact Management — Specification

**Created:** 2026-05-30
**Ambiguity score:** 0.16 (gate: ≤ 0.20)
**Requirements:** 5 locked

## Goal

Users can create, view, edit, and delete contacts (name, role, company, notes), with all data persisted in a local file across page refreshes.

## Background

No application code exists. The project is a pure greenfield web app — only planning artifacts (.planning/, CLAUDE.md) are present. Phase 1 must build everything from scratch: the contact list page, the create/edit form, the detail page, the delete flow, and the file-based persistence layer. Nothing related to contacts currently exists.

## Requirements

1. **Contact list page**: A page that lists all saved contacts; shows an empty state when no contacts exist.
   - Current: No contact list page or UI exists
   - Target: A dedicated page renders all contacts (name visible in each row); when the contact list is empty, shows a message ("No contacts yet" or equivalent) plus an add button
   - Acceptance: Page renders correctly at 0 contacts (empty state + add button visible), 1 contact (contact shown in list), and 3+ contacts (all shown)

2. **Add contact**: User can create a contact by filling in all four required fields.
   - Current: No create form or add flow exists
   - Target: A form (separate page or modal) lets the user enter name, role, company, and notes; all four fields are required; on valid submit the contact is saved and the user is returned to the list
   - Acceptance: Submitting with all four fields saves the contact and it appears in the list; submitting with any field blank shows a validation error and does not save the contact

3. **Contact detail and edit**: User can view a contact's full details and update any field.
   - Current: No detail or edit view exists
   - Target: Each contact in the list links to a detail page showing all four fields; any field can be edited and saved; all four fields remain required on edit
   - Acceptance: Editing a field and saving persists the new value (confirmed by navigating away and back); attempting to save with any field cleared shows a validation error

4. **Delete contact with confirmation**: User can permanently remove a contact after confirming.
   - Current: No delete action exists
   - Target: A delete button on the contact detail page triggers a confirmation prompt ("Are you sure?"); confirming removes the contact; canceling leaves it unchanged
   - Acceptance: Confirming deletion removes the contact from the list and it does not reappear on refresh; canceling deletion leaves the contact unchanged

5. **File-based persistence**: All contact data survives page refreshes via local file storage.
   - Current: No storage layer exists; the app has no backend
   - Target: Contact data is written to a file on disk (format decided in discuss-phase: JSON or SQLite); the server reads this file on startup; create/edit/delete operations update the file immediately
   - Acceptance: Create a contact, reload the page — contact still appears; delete a contact, reload — contact is gone; edit a contact, reload — edited values shown

## Boundaries

**In scope:**
- Contact list page (index view with empty state)
- Create contact form — all four fields required: name, role, company, notes
- Contact detail page with inline or form-based editing
- Delete contact with confirmation dialog
- File-based persistence layer (local disk, format TBD in discuss-phase)
- Minimal Node/Express (or equivalent) server to serve the app and handle file I/O

**Out of scope:**
- Search or filter contacts — v2 backlog; list view only in Phase 1
- Expertise level tagging — Phase 2
- Relationship depth tagging — v2 backlog
- Value tracking (favors/projects) — Phase 3
- Pinned notes — Phase 4
- Follow-up reminders — Phase 5
- Authentication / login — no-auth app in v1
- Sorting or pagination — v2 backlog
- CSV import — v2 backlog
- Mobile-specific UI — web only

## Constraints

- **Storage**: File on disk (not a hosted database, not browser localStorage); exact format (JSON vs SQLite) is an implementation decision for discuss-phase
- **Required fields**: All four fields (name, role, company, notes) are required on both create and edit — partial contacts are not valid
- **Delete confirmation**: Deletion MUST require explicit user confirmation — no immediate-delete allowed
- **Platform**: Web app only; no mobile considerations in Phase 1
- **No auth**: Single-user, unauthenticated app

## Acceptance Criteria

- [ ] Contact list page renders with 0 contacts — empty state message and add button are visible
- [ ] Contact list page renders with 1+ contacts — each contact appears in the list with its name visible
- [ ] Creating a contact with all four fields filled saves it and it appears in the contact list
- [ ] Attempting to save with any field blank shows a validation error; contact is not saved
- [ ] Editing a contact field and saving persists the change (navigating away and returning shows the new value)
- [ ] Attempting to save an edit with any field blank shows a validation error; change is not saved
- [ ] Clicking delete on a contact shows a confirmation prompt before removing it
- [ ] Confirming deletion removes the contact from the list; it does not reappear on page refresh
- [ ] Canceling deletion leaves the contact unchanged
- [ ] All contacts persist across a full page refresh (file-based persistence verified)

## Ambiguity Report

| Dimension           | Score | Min  | Status | Notes                                              |
|---------------------|-------|------|--------|----------------------------------------------------|
| Goal Clarity        | 0.92  | 0.75 | ✓      | CRUD + persistence fully specified                 |
| Boundary Clarity    | 0.82  | 0.70 | ✓      | Adjacent phases explicitly excluded                |
| Constraint Clarity  | 0.70  | 0.65 | ✓      | Storage type locked; format deferred to discuss    |
| Acceptance Criteria | 0.85  | 0.70 | ✓      | 10 pass/fail criteria covering all requirements    |
| **Ambiguity**       | 0.16  | ≤0.20| ✓      |                                                    |

## Interview Log

| Round | Perspective      | Question summary                    | Decision locked                                          |
|-------|------------------|-------------------------------------|----------------------------------------------------------|
| 1     | Researcher       | Where does contact data live?       | File on disk (JSON or SQLite) — not localStorage, not DB |
| 1     | Researcher       | Any fields beyond name/role/company/notes? | No — four fields only                             |
| 2     | Researcher+Simplifier | What does the UI look like?    | List page + separate detail/edit page per contact        |
| 2     | Simplifier       | Empty state handling?               | Empty message + add button                               |
| 3     | Boundary Keeper  | Delete with confirmation or immediate? | Confirmation prompt required before delete             |
| 3     | Boundary Keeper  | Which fields are required?          | All four fields required on create and edit              |

---

*Phase: 01-contact-management*
*Spec created: 2026-05-30*
*Next step: /gsd-discuss-phase 1 — implementation decisions (tech stack, file format, routing, component structure)*
