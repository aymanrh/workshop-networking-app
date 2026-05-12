# Requirements: NetMemory

**Defined:** 2026-05-12
**Core Value:** Never forget who I met — rich, durable context per person.

## v1 Requirements

Requirements for the initial release. Each maps to a roadmap phase. All twelve are P1 (must-ship) per FEATURES.md.

### Authentication & Hosting

- [ ] **AUTH-01**: Single hardcoded user account — no public sign-up, no registration flow
- [ ] **AUTH-02**: User can log in via magic-link or passkey (no third-party OAuth)
- [ ] **AUTH-03**: Session persists across browser refresh and survives mobile-tab eviction for at least 30 days
- [ ] **AUTH-04**: All traffic served over HTTPS with valid managed cert

### Contacts

- [ ] **CONT-01**: User can create a contact with a name (required) and optional company, role, and free-form notes
- [ ] **CONT-02**: User can apply any number of free-form tags to a contact
- [ ] **CONT-03**: User can edit any field of a contact at any time
- [ ] **CONT-04**: User can delete a contact (soft-delete acceptable; full audit not required in v1)
- [ ] **CONT-05**: User can view a contact-detail page showing all fields, tags, linked events, and the note timeline

### Events

- [ ] **EVNT-01**: User can create an event with a name, date(s), and optional location
- [ ] **EVNT-02**: Every event has a lifecycle state: `planned` → `attended` → `memory`
- [ ] **EVNT-03**: Planned events auto-promote to `attended` after a grace window past the event end date; `attended → memory` is a manual user action
- [ ] **EVNT-04**: User can edit any field of an event and can transition its state manually
- [ ] **EVNT-05**: User can view an event-detail page showing date, location, lifecycle state, attendee list, and event-level notes

### Contact ↔ Event Linkage

- [ ] **LINK-01**: User can link a contact to an event as "where we met" during capture
- [ ] **LINK-02**: User can add or remove additional event attendees on the event-detail page
- [ ] **LINK-03**: A contact's detail page shows every event they're linked to, with date and lifecycle state

### Notes Timeline

- [ ] **NOTE-01**: User can add timestamped notes to a contact at any time (append-only timeline; edits allowed within 24h)
- [ ] **NOTE-02**: User can add event-level notes (separate from contact notes) tied to the event entity
- [ ] **NOTE-03**: Notes update the contact's "last interaction" timestamp used by the staleness view

### Search & Filter

- [ ] **SRCH-01**: User can search by name, company, or note text via a single search box
- [ ] **SRCH-02**: Search results highlight the matching field and are typo-tolerant (trigram-based fuzzy match)
- [ ] **SRCH-03**: User can filter the contact list by one or more tags
- [ ] **SRCH-04**: User can filter the contact list by company
- [ ] **SRCH-05**: User can browse contacts by event ("everyone I met at X")
- [ ] **SRCH-06**: Search and filter perform under 300 ms on a dataset of 2,000 contacts

### Staleness View

- [ ] **STAL-01**: User can view a "haven't talked to in a while" list capped at the top 20 stalest contacts
- [ ] **STAL-02**: User can snooze a contact off the staleness list for a chosen duration (7/30/90 days)
- [ ] **STAL-03**: User can permanently exclude a contact from staleness surfacing (e.g., one-off acquaintances)
- [ ] **STAL-04**: No push notifications, email, or pop-up reminders in v1 — staleness is pull-based only

### Export

- [ ] **EXPT-01**: User can export full data as a single JSON file containing all contacts, events, tags, notes, and linkages
- [ ] **EXPT-02**: User can export contacts and events as CSV files (one per entity)
- [ ] **EXPT-03**: A round-trip export → import test produces no data loss (verified in hardening phase)

### Sharing

- [ ] **SHAR-01**: User can generate a revocable, signed, read-only share link for a single contact or event
- [ ] **SHAR-02**: Share links expire on a user-configurable schedule (1 hour / 1 day / 7 days / never)
- [ ] **SHAR-03**: User can revoke any active share link from a single management screen

### Mobile Capture UX (Cross-cutting)

- [ ] **UX-01**: A new contact can be created on a mobile browser in under 30 seconds with one required field (name) and the rest optional
- [ ] **UX-02**: All capture forms autosave drafts so flaky network or accidental navigation doesn't lose data
- [ ] **UX-03**: All capture and edit forms are usable one-handed with thumb-reach taps (≥44 px hit targets)
- [ ] **UX-04**: All primary screens (capture, contact list, event list, search) render correctly on 360 px viewport width

## v2 Requirements

Deferred per PROJECT.md. Tracked but not in v1 roadmap.

### Contact Channels

- **CHAN-01**: User can store multiple email addresses, phone numbers, and social handles (LinkedIn, X, WhatsApp) per contact
- **CHAN-02**: User can copy a channel value to clipboard with a single tap

### Reminders

- **REMIND-01**: User can configure follow-up cadence rules per contact or per tag
- **REMIND-02**: User receives email and/or push notifications when a contact crosses the staleness threshold

### Import

- **IMPRT-01**: User can import contacts from vCard (.vcf) files
- **IMPRT-02**: User can import contacts from a Google Contacts export
- **IMPRT-03**: User can import a previously exported JSON file (round-trip restore)

## v3 Requirements

Further deferred per PROJECT.md.

### Photos

- **PHOTO-01**: User can upload a photo per contact from camera or gallery
- **PHOTO-02**: Photos are EXIF-stripped on upload for privacy
- **PHOTO-03**: Photos display as avatars in the contact list and detail views

### Rich Profile

- **RICH-01**: User can rank relationship strength (stranger / acquaintance / friend / close) per contact
- **RICH-02**: User can add custom typed fields per contact (birthday, spouse name, kids, allergies, gift ideas)

## Out of Scope

Explicitly excluded — documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-user accounts / public sign-up | This is a personal memory tool — multi-tenant adds RLS, billing, invites, permissions UI for zero v1 value |
| Native iOS/Android apps | Responsive web is sufficient; native doubles the codebase for one user |
| Email / calendar / LinkedIn auto-sync | Vendor lock-in, OAuth surface, privacy constraint from PROJECT.md |
| In-app messaging / email composer | This app is memory, not communication — out of scope philosophically |
| Pipelines / deal stages | NetMemory is a memory tool, not a sales tool |
| Public profiles / social-network features | Privacy and scope risk; deferred indefinitely |
| AI message drafting / GPT relationship coach | Token cost, prompt-injection risk, not aligned with Core Value |
| Custom field UI builder | Too much surface for v1; freeform notes cover the gap |

## Traceability

Phase mapping will be filled in by the roadmapper. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01..04 | TBD | Pending |
| CONT-01..05 | TBD | Pending |
| EVNT-01..05 | TBD | Pending |
| LINK-01..03 | TBD | Pending |
| NOTE-01..03 | TBD | Pending |
| SRCH-01..06 | TBD | Pending |
| STAL-01..04 | TBD | Pending |
| EXPT-01..03 | TBD | Pending |
| SHAR-01..03 | TBD | Pending |
| UX-01..04 | TBD | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 37 ⚠️

---
*Requirements defined: 2026-05-12*
*Last updated: 2026-05-12 after initial definition*
