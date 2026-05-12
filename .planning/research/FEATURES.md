# Feature Research

**Domain:** Personal CRM / Contact-and-Event Memory App (single-user, web)
**Researched:** 2026-05-12
**Confidence:** HIGH (5+ real products surveyed, table-stakes pattern is consistent across all)

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these makes the product feel broken or pointless for "never forget who I met."

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Contact CRUD (name, notes, company/role, free-form fields) | Every personal CRM has this. Dex, Monica, Clay, Cloze, Notion templates all converge on it. Without it there is no product. | LOW | Schema must be flexible — free-form notes field is the highest-value attribute per Monica/Dex reviews. |
| Tags / categories on contacts | Universal. Notion templates use circle tiers (Heart/Trust/Encounter/Network); Airtable templates push custom categories; Dex uses "groups." Users need an organizing dimension beyond "name." | LOW | Many-to-many. Free-tagging beats predefined taxonomies for v1 (lower friction during capture). |
| "How we met" linkage (event ↔ contact relation) | The single field that turns a contact list into a memory tool. Airtable's CRM template explicitly models linked events↔contacts; Notion templates do the same. PROJECT.md Core Value depends on it. | MEDIUM | Requires events as a first-class entity, not a tag. Drives Phase ordering: events table must exist before contacts get meaningful "where met" data. |
| Fast text search across contacts (name + notes) | Every reviewed product has it. Dex, Clay, Monica all rank search as core. Users panic when they cannot recall a name but remember a detail. | LOW | SQL LIKE or full-text on a small dataset (<10k rows for one user). Postgres FTS is overkill but cheap. |
| Mobile-friendly capture UX | The Dex review highlights mobile + Chrome extension parity; Airtable docs emphasize "edit from your smartphone while talking." Capture happens on phone in the wild — desktop-only is dead on arrival. PROJECT.md explicitly flags this. | MEDIUM | Responsive web works (PROJECT.md decision). Forms must be touch-friendly, support quick-save with partial data, and tolerate flaky network. |
| Filter / browse contacts by tag, company, event | Cloze surfaces filtered lists; Notion templates ship 7 pre-built views; Airtable templates default to multi-view. Browsing without filtering is unusable past ~50 contacts. | LOW | Simple WHERE clauses on indexed columns. |
| Event detail view with attendee list | Required to support "who did I meet at X?" — the inverse of "where did I meet Y?" Airtable's linked-records pattern is the standard. | LOW | Inverse of the contact↔event relation; trivial once relation exists. |
| Edit / update contact over time | Monica, Dex, Cloze, Clay all treat the contact record as a growing dossier. Notes accrete; capture is never "done." | LOW | Standard CRUD; the discipline is making editing as cheap as creating. |
| Single-user authentication | Cloud-hosted personal data requires auth. PROJECT.md says no public signup but the user still needs login. Without auth, anyone on the URL sees the data. | LOW-MEDIUM | Hardcoded single account / magic link / passkey. No registration flow. No password reset complexity. |
| HTTPS / encryption-in-transit | PROJECT.md sensitivity constraint. Table stakes for any cloud-hosted personal data app in 2026. | LOW | Vercel / Fly handle this automatically with managed certs. |
| Data export (full backup) | PROJECT.md explicitly requires it. Monica's REST API export is its #1 cited differentiator vs Dex; "no export" = "data hostage" complaint across every CRM review. | LOW-MEDIUM | JSON dump of all tables is the lowest-effort answer. CSV per-table is the "I can open this in Excel" answer most users actually want. Offer both. |

### Differentiators (Competitive Advantage)

These align with the Core Value ("never forget who I met") and the explicit roadmap. They are where this product wins vs Notion/Airtable DIY and where it matches Dex/Cloze without their bloat.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Event-as-lifecycle entity (planned → attended → memory) | PROJECT.md decision. Most competitors treat events as a tag or a date field; this product treats them as state machines with prep notes pre-event and attendee+memory notes post-event. Cloze and Dex don't model planned events at all. | MEDIUM | Requires a state field + UI for transition. The "memory" stage is where attendee linkage and free-form recap notes live. |
| Sub-30s contact capture flow | PROJECT.md active requirement. Mobile reviewers of Dex/Clay/Monica universally complain that "logging an interaction takes too long." Beating that bar is a competitive moat for the in-the-wild use case. | MEDIUM | Requires: single-screen form, smart defaults (today's date, last-used event auto-selected), draft auto-save, optional fields collapsible. UX-driven, not algorithmic. |
| Simple staleness surfacing ("haven't talked to X in N days") | PROJECT.md active requirement. Covve and Dex both cite this as the highest-retention feature. Monica reviewers say its reminders are "the reason I open it." Differentiator vs Notion/Airtable templates which require manual queries. | LOW-MEDIUM | Computed view over `last_interaction_at` (which is `MAX(notes.created_at, events.attended_at)` for that contact). No notifications in v1 — surface visually in a "you might want to reach out" list. PROJECT.md defers real reminder cadence to v2, so this is the lightweight v1 form. |
| Share a single contact or event externally on demand | PROJECT.md active requirement. Unusual for personal CRMs — Monica has full export but no per-record share. Useful when the user wants to send a friend "here's everything I remember about Alice" without granting login. | MEDIUM | Read-only signed URL per record, time-boxed, revocable. Phase-2-ish in complexity but in v1 scope per PROJECT.md. |
| No third-party login dependency | PROJECT.md privacy constraint. Dex and Clay both require Google/LinkedIn OAuth and ingest your address book; the user has explicitly opted out of that model. Differentiator for users who distrust handing their social graph to a SaaS. | LOW | Self-hosted single-account auth (magic link or passkey). Side benefit: simpler to build than OAuth dance. |
| Memory-first UI framing (vs sales-pipeline framing) | Cloze and Dex review feedback consistently: "feels like sales software for friendships." Notion templates are flexible but cold. A UI that opens to "people you haven't seen lately" or "recent memories" rather than "contacts list" reinforces the Core Value. | LOW | Pure UX/copy choice; technically free. Decide once during design. |
| Single-account hosting (own cloud, own data) | PROJECT.md constraint. Monica's self-host story is its main draw vs Dex's SaaS lock-in. Building self-hostable from day one keeps the option open and prevents the data-hostage problem. | MEDIUM | Containerized deploy + plain Postgres + filesystem/object-storage for blobs. Mostly an architectural discipline, not a feature per se. |

### Anti-Features (Commonly Requested, Often Problematic)

Critical for this project — single-user scope means most "expected" features from team-CRM reviews can be cut without users noticing. PROJECT.md already lists several explicitly.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Email / calendar / LinkedIn auto-sync (Dex/Clay/Cloze core feature) | "Magic" contact ingestion feels powerful. | Massive OAuth/API surface, brittle integrations, vendor lock-in, regulatory exposure (Gmail OAuth review, LinkedIn ToS), and PROJECT.md explicitly says no third-party logins. Most reviews praise these features but their support churn dominates the products' bug trackers. | Manual capture optimized to sub-30s (a differentiator). Defer enrichment to v2 import phase per PROJECT.md. |
| In-app messaging / email composer | Cloze and Dex offer it; users assume "CRM = can email from here." | PROJECT.md explicitly out of scope ("about memory, not communication"). Building a mail composer drags in deliverability, SMTP setup, bounce handling, anti-spam — months of work for a feature the user does not want. | Surface contact details only. v2 may add copy-to-clipboard channels. |
| Native iOS/Android apps | Mobile capture is the most demanding moment, so "shouldn't this be native?" feels obvious. | PROJECT.md decision: responsive web is enough. Native means duplicate codebases, app store reviews, push-cert rotations, two release pipelines — too much surface for one user. | PWA features where helpful (add-to-home-screen, offline read). Responsive layout tuned for thumb reach. |
| Real-time push notifications for follow-up reminders | "An app that reminds me" is the most-requested feature in personal-CRM reviews. | PROJECT.md defers real reminders to v2. Push notifications require service workers, VAPID keys, per-platform quirks, and a notification preferences UI. Heavy infra for a v1 differentiator that has a degenerate text answer ("you might want to reach out" list). | Visual staleness view on the home screen. Pull-based, not push. v2 adds push. |
| Photo / avatar upload per contact | Visual identity is the #1 "feature gap" complaint in Monica's GitHub. | PROJECT.md defers to v3. Blobs mean object storage, image processing, EXIF stripping for privacy, thumbnailing — all infrastructure debt unrelated to the Core Value. | Initials avatar in v1; defer file uploads to v3 per PROJECT.md. |
| Multi-user / sharing accounts / team workspaces | Every reviewed product (except Monica self-host) leans toward this for revenue. | PROJECT.md explicit out-of-scope. Multi-tenant adds row-level security, billing, invite flows, permission UI — easily doubles the codebase. | Per-record share links (the differentiator) cover the realistic "show this to a friend" need without multi-tenancy. |
| Custom fields editor / form builder | Notion/Airtable templates win on this; users assume "real" CRMs have it. | PROJECT.md defers custom fields to v3. Custom-field UIs always grow: type system, validation, ordering, conditional visibility, migration. | Catch-all "notes" field is sufficient for v1 — Monica's review explicitly says notes is where the value lives anyway. |
| Pipelines / deal stages / sales funnels | Inherited assumption from business CRMs. | PROJECT.md decision; Dex's tagline literally markets "no pipelines, no deal stages." This is a memory tool, not a sales tool. | Event lifecycle (planned/attended/memory) provides the only state machine v1 needs. |
| Public sign-up / account creation flow | Standard SaaS pattern. | PROJECT.md explicit out-of-scope. Sign-up means email verification, password reset, abuse prevention, GDPR account-deletion — all costing weeks for a system that has exactly one user. | Single hardcoded account; provisioned at deploy. Magic link or passkey for re-auth. |
| AI relationship coach / GPT message drafting (Cloze "Email Ghostwriter," Clay's Nexus) | Trendy in 2025-26 reviews. | Token cost, model drift, output quality variance, prompt-injection risk on user notes, and PROJECT.md does not call it out. Tempting to bolt on, but not aligned with Core Value. | Defer indefinitely. If added, it belongs in v2+ behind a flag, on the user's own API key. |

## Feature Dependencies

```
[Auth (single-user)]
   └── [Contact CRUD]
   │      └── [Tags]
   │      └── [Search]
   │      └── [Filter/browse by tag+company]
   │      └── [Notes (append-only timeline on contact)]
   │              └── [Staleness view (computes last-interaction)]
   │
   └── [Event CRUD]
          └── [Event lifecycle states (planned → attended → memory)]
          │      └── [Event detail view]
          │
          └── [Contact ↔ Event linkage ("how we met")]   ← THE KEY EDGE
                  ├── enables → [Contact: "met at X" attribution]
                  ├── enables → [Event: attendee list]
                  └── enables → [Staleness view counts events as interactions]

[Export (full data dump)] ──depends on→ [Contact CRUD] + [Event CRUD] + [Tags] + [Notes]
[Share single record link] ──depends on→ [Contact CRUD] OR [Event CRUD]
[Mobile capture UX] ──enhances→ [Contact CRUD] + [Event CRUD]   (cross-cutting; not a separate phase)

[Photos] ──conflicts with→ [v1 scope]   (deferred to v3)
[Email/LinkedIn sync] ──conflicts with→ [v1 scope + privacy constraint]   (deferred to v2)
[Push reminders] ──conflicts with→ [v1 scope]   (deferred to v2)
```

### Dependency Notes

- **Contact↔Event linkage is the central edge.** Both contact and event tables must exist before the relation can be created. This drives phase ordering: events table cannot wait until "later" — it must land alongside contacts or the Core Value isn't deliverable.
- **Staleness view requires Notes (interaction log).** A contact with no notes and no event attendance has no "last interaction" — staleness collapses to "creation date." Notes must be modeled as timestamped append-only entries, not a single text blob.
- **Search depends on both contact attributes AND notes content.** Reviewers of Dex/Monica/Cloze converge on "I can never find that person whose name I forgot but I remember she liked sailing" — notes must be searchable, not just name/company.
- **Export depends on every entity being modelled cleanly first.** Adding export late means scrambling to serialize relations. Building it early (even just a JSON dump) forces good schema discipline.
- **Mobile UX is cross-cutting, not a phase.** Every capture/edit screen has to be mobile-first from day one; retrofitting responsive is far more expensive than building it in.
- **Share-link feature depends on auth being designed to support anonymous-but-signed access** — easier if planned from the auth phase rather than retrofitted.

## MVP Definition

### Launch With (v1)

The minimum needed to validate "never forget who I met." Each item maps directly to a PROJECT.md Active requirement.

- [ ] **Single-user auth (magic link or passkey)** — required for cloud hosting personal data
- [ ] **Contact CRUD** with name, company/role, free-form notes, tags — the foundational entity
- [ ] **Event CRUD** with date, name, location, lifecycle state (planned/attended/memory) — first-class entity per PROJECT.md decision
- [ ] **Contact ↔ Event linkage with "how we met" context** — the edge that delivers the Core Value
- [ ] **Notes as timestamped append-only entries on a contact** — interaction history that staleness depends on
- [ ] **Text search across name + notes + company** — table stakes; without it the dataset is write-only
- [ ] **Filter/browse contacts by tag, company, event** — table stakes for >50 contacts
- [ ] **Staleness view ("haven't interacted in N days")** — the v1 differentiator and PROJECT.md requirement
- [ ] **Mobile-responsive capture UX with sub-30s creation flow** — PROJECT.md requirement + competitive moat
- [ ] **Full data export (JSON + CSV)** — PROJECT.md requirement; non-negotiable for trust
- [ ] **Share a single contact or event via revocable signed link** — PROJECT.md requirement
- [ ] **HTTPS + encrypted-in-transit** — table stakes for personal cloud data

### Add After Validation (v1.x)

Small follow-ups that emerge from real use.

- [ ] **Tag management UI (rename, merge, delete)** — trigger: user accumulates duplicate/typo tags
- [ ] **Bulk operations (multi-select tag, archive)** — trigger: user passes ~200 contacts
- [ ] **Saved filters / pinned views** — trigger: user repeats the same filter combo weekly
- [ ] **Activity log / interaction history view on the contact detail page** — trigger: per-contact "what happened" gets hard to scan
- [ ] **Soft delete / undo trash** — trigger: first accidental deletion

### Future Consideration (v2+)

Already deferred by PROJECT.md or by this research.

- [ ] **Contact channels (email/phone/LinkedIn/X/WhatsApp + copy-to-clipboard)** — v2 per PROJECT.md
- [ ] **Real follow-up reminder cadences (push/email)** — v2 per PROJECT.md
- [ ] **Import from LinkedIn / Google Contacts / vCard** — v2 per PROJECT.md
- [ ] **Photos / avatars** — v3 per PROJECT.md
- [ ] **Relationship strength tiers** — v3 per PROJECT.md
- [ ] **Custom fields (birthday, spouse, gift ideas, allergies)** — v3 per PROJECT.md
- [ ] **AI summarization of a contact's history** — defer indefinitely; not aligned with Core Value
- [ ] **Browser extension for one-click capture** — defer; PWA + share-target may be enough

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Single-user auth | HIGH | LOW | P1 |
| Contact CRUD + tags + notes | HIGH | LOW | P1 |
| Event CRUD + lifecycle state | HIGH | MEDIUM | P1 |
| Contact ↔ Event linkage | HIGH | LOW | P1 |
| Mobile-responsive capture | HIGH | MEDIUM | P1 |
| Text search (name+notes) | HIGH | LOW | P1 |
| Filter/browse by tag/company/event | HIGH | LOW | P1 |
| Staleness view | HIGH | LOW | P1 |
| Full data export (JSON+CSV) | HIGH | LOW | P1 |
| Per-record share link | MEDIUM | MEDIUM | P1 |
| Tag management UI | MEDIUM | LOW | P2 |
| Bulk operations | MEDIUM | LOW | P2 |
| Saved filters / pinned views | MEDIUM | LOW | P2 |
| Soft delete / undo | MEDIUM | LOW | P2 |
| Contact channels (v2) | HIGH | MEDIUM | P3 |
| Push reminders (v2) | HIGH | HIGH | P3 |
| Import vCard/LinkedIn (v2) | MEDIUM | MEDIUM | P3 |
| Photos (v3) | MEDIUM | MEDIUM | P3 |
| Custom fields (v3) | MEDIUM | HIGH | P3 |
| Email/calendar sync (anti-feature) | — | — | NEVER |
| In-app messaging (anti-feature) | — | — | NEVER |
| Multi-user / sharing accounts (anti-feature) | — | — | NEVER |
| Sales pipelines (anti-feature) | — | — | NEVER |
| Native mobile apps (anti-feature) | — | — | NEVER |

**Priority key:**
- P1: Must have for v1 launch (12 items — these are the MVP scope)
- P2: Add when v1 is in real use and the friction surfaces
- P3: Already deferred to v2/v3 per PROJECT.md
- NEVER: Anti-features — explicitly do not build

## Competitor Feature Analysis

| Feature | Dex (getdex.com) | Clay/Mesh (clay.earth) | Monica (monicahq.com) | Cloze (cloze.com) | Notion/Airtable templates | NetMemory (this product) |
|---------|------------------|-------------------------|------------------------|--------------------|----------------------------|---------------------------|
| Contact CRUD + tags | Yes (groups) | Yes | Yes (rich PRM model) | Yes | Yes (template) | Yes — table stakes |
| Free-form notes per contact | Yes | Yes | Yes (strongest) | Yes | Yes | Yes — table stakes |
| Event as first-class entity (lifecycle) | No (date tag only) | No | Limited (activities) | No | Linked records (Airtable: yes; Notion: partial) | **Yes (planned→attended→memory)** — differentiator |
| Auto-sync email/calendar/LinkedIn | Yes (core) | Yes (core) | No (manual) | Yes (core) | No (manual) | **No (anti-feature)** — by design |
| Mobile capture optimized | Yes (native app) | Yes (native app) | Web-only, weak | Yes (native app) | Web-only, slow forms | **Yes (responsive PWA, sub-30s target)** — differentiator |
| Staleness / reconnect surfacing | Yes (reminders) | Yes (Nexus AI prompts) | Yes (reminders) | Yes (daily agenda) | Manual filter | **Yes (pull-based, no push in v1)** — table stakes |
| Push reminders | Yes | Yes | Yes (email) | Yes | No | No (v1) — deferred to v2 |
| Data export | Limited (CSV) | Limited | **Full REST API + JSON** | CSV | Native to platform | **Yes (JSON + CSV)** — table stakes per PROJECT.md |
| Self-host | No | No | **Yes (Docker)** | No | N/A | **Yes (architecturally)** — differentiator |
| No third-party login required | No | No | Yes | No | N/A | **Yes** — differentiator per PROJECT.md |
| Per-record share link | No | No | No | No | Partial (Notion public pages) | **Yes** — differentiator per PROJECT.md |
| Photos/avatars | Yes | Yes | Yes | Yes | Yes | No (v1) — deferred to v3 |
| Pricing | $12/mo SaaS | $0–$20/mo SaaS | Free self-host or $9/mo | $19.99/mo SaaS | Template cost | Single-user own-cloud, no fee |

**Key takeaways:**
- Dex/Clay/Cloze compete on auto-sync magic. NetMemory explicitly rejects that lane (PROJECT.md privacy constraint) and competes on capture speed + memory framing instead.
- Monica is the closest philosophical sibling (open-source, self-host, no sync). NetMemory's edge over Monica: better mobile UX, lifecycle-modeled events (Monica treats events as activities, not stateful entities), and per-record share links.
- Notion/Airtable templates have the most flexibility but the slowest capture (Airtable's own blog: "input data while talking" is aspirational — the reality is form-heavy). NetMemory wins on time-to-capture.
- No reviewed product offers a revocable per-record share link — this is a genuine whitespace differentiator backed by PROJECT.md.

## Sources

**Personal CRMs (direct product research):**
- [Dex — getdex.com](https://getdex.com/) — SaaS personal CRM, LinkedIn-centric, $12/mo. Reviewed via [Dex Review 2026 — Phi Consulting](https://phi.consulting/tools/dex) and [Dex Review on Muncly](https://muncly.com/dex-review-is-this-the-best-personal-contact-management-tool/).
- [Clay (now Mesh) — clay.earth](https://clay.earth/) — SaaS, multi-channel auto-sync, free–$20/mo. Reviewed via [Clay Personal CRM Review 2026 — use-apify](https://use-apify.com/blog/clay-personal-crm-review-2026) and [Clay.earth Review — Muncly](https://muncly.com/clay-earth-review-is-this-an-end-game-personal-crm/).
- [Monica — monicahq.com](https://www.monicahq.com/) and [Monica on GitHub](https://github.com/monicahq/monica) — open-source PRM, self-host, no auto-sync. Reviewed via [Monica Personal CRM Review — Dex blog](https://getdex.com/blog/monica-review/) and [Monica — itsfoss.com](https://itsfoss.com/monica/).
- [Cloze — ai.cloze.com](https://ai.cloze.com/) — SaaS, AI-powered daily agenda, has pivoted toward real estate. Reviewed via [Cloze CRM Review 2026 — Dex blog](https://getdex.com/blog/cloze-crm-review/) and [Cloze CRM Review — Automaton Army](https://automatonarmy.com/cloze-review/).

**Template-based personal CRMs:**
- [Notion Personal CRM Template marketplace](https://www.notion.com/templates/personal-crm) — circle tiers, multi-view pattern.
- [Airtable Personal CRM Template](https://www.airtable.com/templates/personal-crm/exp7KcHbb6laaJkjU) and [Airtable: How to nurture connections](https://blog.airtable.com/how-to-nurture-unexpected-connections-with-a-personal-crm/) — linked-records pattern for events↔contacts.

**Pattern research:**
- [Top 20 Personal CRM Tools — 1byte blog](https://blog.1byte.com/personal-crm-tools/) — landscape overview.
- [Best Personal CRM Software — crm.org](https://crm.org/crmland/personal-crm) — survey of 9 tools.
- [Contact Ghosting article — ContactsPlus](https://www.contactsplus.com/blog/contact-ghosting/) — staleness/reconnect feature framing.
- [How to find contacts not touched recently — Less Annoying CRM](https://www.lessannoyingcrm.com/help/how-to-find-contacts-that-havent-been-touched-recently) — concrete staleness UX precedent.
- [Best Personal CRM Tools 2026 — Wave Connect](https://wavecnct.com/blogs/personal-crm) — tested-and-reviewed comparison.

**Data portability:**
- [vCard / CSV / JSON export patterns — Datablist](https://www.datablist.com/learn/csv/convert-csv-vcard-vcf) and [convert.guru](https://convert.guru/contact-converter) — confirm CSV+JSON is the modern norm; vCard is for v2 import.

---
*Feature research for: personal CRM / contact-and-event memory app*
*Researched: 2026-05-12*
