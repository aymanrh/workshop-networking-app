# Pitfalls Research

**Domain:** Personal CRM / contact-and-event memory tool (single-user, web, mobile-friendly)
**Researched:** 2026-05-12
**Confidence:** HIGH (corroborated across Monica, Dex, Clay reviews + CRM-adoption research + solo-dev post-mortems)

---

## Critical Pitfalls

These are the failure modes that historically kill personal-CRM projects — either the *user* abandons the tool, or the *developer* abandons the build. Each one is sourced from real complaints about Monica, Dex, and Clay, and from CRM-adoption research.

---

### Pitfall 1: Capture friction kills daily use

**What goes wrong:**
The user meets someone, intends to log them, but the act of opening the app and filling out a form takes longer than the social window allows. After a few weeks of skipped captures the database has gaps, the user no longer trusts it ("I know I met more people than this"), and the tool gets abandoned. This is the #1 failure mode for personal CRMs — every Monica/Dex review surfaces it, and CRM-adoption literature names "data-entry burden" as the single largest cause of CRM failure. Monica's own GitHub issue #5195 ("Reducing friction when entering data daily") exists *because users were quitting over this*.

**Why it happens:**
- Developers model the data domain first (Person, Event, Tag, Company, Role, Note...) and build a form that covers the model. Every required field is one more reason to defer logging.
- Mobile capture is treated as "responsive desktop" rather than the primary capture surface. Two-step forms, modals that lose state on back-button, missing autosave.
- The phone keyboard is small. Users typo. Validation errors require resubmits. Each retry compounds friction.
- "I'll just remember to log it later" — but later means lying in bed half-asleep, or never.

**How to avoid:**
- **30-second budget** for the minimum viable capture: name + how-we-met + one note. Everything else is optional and progressive.
- Single-column mobile form, single screen, no modals, no required fields beyond `name`.
- **Autosave to local draft on every keystroke** (IndexedDB) so a phone lockscreen or accidental back-button never costs data.
- Smart defaults: prefill "where we met" with the most recent event, prefill date with today, no required tags.
- **Two capture surfaces minimum:** (1) full-form "new contact" for the deliberate add, (2) quick-add "just a name + note" for mid-conversation/in-bed capture, promote to full record later.
- Measure capture time during dogfooding — if a typical add takes >30s on a phone with a real keyboard, the form is wrong.

**Warning signs:**
- During dogfooding the developer keeps skipping captures because "it's late, I'll do it tomorrow."
- The form has more than one required field beyond name.
- Adding a contact requires more than one screen transition on mobile.
- Captured records have systematically empty fields beyond name+note.

**Phase to address:**
**Phase 1 (foundational data model + capture UX must ship together).** The capture flow is not a Phase-N polish item — it is the core product. If capture isn't fast on day one, the dogfooding data the developer needs to validate the rest of the roadmap will never exist.

---

### Pitfall 2: Mobile experience treated as desktop-shrunk

**What goes wrong:**
The web app works fine on a laptop but is painful on a phone. Inputs are too small to tap, the keyboard hides the active field, page reloads lose form state, "save" button is below the fold, full-page reloads on every interaction. Monica reviewers cite this exact issue: *"the layout is only partially responsive on mobile, and manipulating data on a phone is difficult."* Dex users complain the desktop version isn't as responsive as the mobile version, and pages load with stale state. The user *only* opens the app on mobile in the real capture moments, so a bad mobile UX = no captures = dead product.

**Why it happens:**
- Developer builds on a 27" monitor, never tests on a phone until late.
- "Responsive design" is interpreted as CSS breakpoints rather than mobile-first interaction design.
- Server-rendered full-page reload pattern (Monica's flaw) makes every click feel sluggish on a 4G connection.
- Tap targets default to whatever the framework provides (often <44px).

**How to avoid:**
- **Mobile-first dev**: developer builds with a phone simulator open at all times, and dogfoods captures from a real phone within the first week.
- Tap targets ≥ 44×44 px (iOS HIG / Material guidance).
- Single-column forms; never two-column on mobile.
- Avoid full-page reloads for capture and edit — use client-side navigation or partial updates.
- Sticky save bar at the bottom of the viewport, above the keyboard.
- Test on a real phone over a throttled 3G connection, not just on localhost desktop Chrome devtools.
- Consider PWA installability so the app behaves like a native shortcut from the home screen, with offline draft support.

**Warning signs:**
- Tap accuracy issues during dogfooding ("I keep tapping the wrong button").
- Capture flow requires two-handed phone use.
- Sticky elements jump when keyboard appears.
- Save button below fold.

**Phase to address:**
**Phase 1 (capture UX phase).** Mobile constraints shape the entire interaction model — adding mobile polish in Phase 5 means refactoring everything built in Phases 1–4.

---

### Pitfall 3: Over-engineered data model paralyzes both capture and developer

**What goes wrong:**
The developer designs a "real" CRM schema upfront — Person, Organization, Role, Email, Phone, Address, Tag, Event, EventRole, Relationship, RelationshipStrength, Birthday, Anniversary, CustomField... — then has to ship a form that touches it all. Capture friction explodes (Pitfall 1). Reports break. Migrations multiply. Monica reviewers describe *"information paralysis, too many fields you can fill with irrelevant information."* CRM-architecture research warns of "property sprawl": teams routinely create 200+ custom properties when 40 would suffice, producing reporting bottlenecks and user confusion.

**Why it happens:**
- Developers love modeling. It's the most fun part of the build.
- The "what if I want X later" instinct fires hard for personal projects.
- Monica/Salesforce schemas are visible online and tempt copy-paste of complexity.
- Premature normalization of contact channels (phone, email, LinkedIn, X, WhatsApp) when the PROJECT.md already says channels are v2.

**How to avoid:**
- **Start with five entities max**: Person, Event, EventAttendance (join), Tag, Note. Nothing else in v1.
- Stuff that *looks* structured but doesn't need to be (company, role) lives as **plain text fields on Person**, not as foreign keys to a Company table — until search/filter needs prove otherwise.
- Tags are **freeform text**, not a typed taxonomy. Autocomplete from existing tags but never block creation.
- Custom fields, contact channels, relationship strength: all deferred per PROJECT.md — *do not pre-build the tables*.
- Resist gendered fields, required organization, required birthdays — Monica's Hacker News thread shows users dropped the app over mandatory gender alone.
- If unsure whether to add a field, **don't**. Adding later is easy; removing once you have data is expensive.

**Warning signs:**
- Schema has >6 tables in v1.
- Person table has >10 columns.
- A "lookup table" exists for something with <20 instances (just enum it or freeform it).
- Form has dropdowns that are usually left at default.
- Developer says "I need to refactor the schema before I can ship X" repeatedly.

**Phase to address:**
**Phase 1 (data model).** Get this wrong and every later phase pays interest.

---

### Pitfall 4: Search that doesn't scale past a few hundred contacts

**What goes wrong:**
The app uses `LIKE '%query%'` on the contacts table. At 50 contacts it's instant. At 500 it's tolerable. At 2,000 it's a noticeable pause. At 10,000 (which a power user reaches over several years) the search is a multi-second CPU stall and the app feels broken. *"Core promise: never forget who I met"* — broken when finding someone takes 3 seconds and fuzzy matches don't work. Apple Contacts threads document this exact failure: users with 3,000+ contacts report 15s+ search delays.

Clay's own search is criticized: *"uses its own search syntax that isn't intuitive; users cannot filter by network strength and often don't see people in results who should match."*

**Why it happens:**
- Default ORM query patterns produce `LIKE '%term%'`.
- Developer tests with seed data of 20 contacts — performance issues invisible.
- Fuzzy matching ("Jon" finding "Jonathan", typo tolerance) is *not* free with LIKE.
- No index on the columns that matter (full-text-indexed name, tags, notes, company).
- Cross-field search ("the guy named Tom from the AWS conference") requires either denormalized search column or full-text index.

**How to avoid:**
- **Use SQLite FTS5 (or Postgres `tsvector` + GIN index, or `pg_trgm` for fuzzy) from day one.** SQLite FTS5 takes a 1s LIKE-scan down to ~20ms with bm25 ranking. The setup cost is one CREATE VIRTUAL TABLE and a trigger.
- Index on `name`, `notes`, `tags`, `company` together so cross-field queries work.
- Use trigram or prefix matching so "jon" matches "Jonathan" and "Jon" — exact-substring is not enough.
- Test search performance with **seeded fake data of at least 2,000 contacts** before declaring search done.
- Show event/tag context next to results ("Tom from AWS re:Invent 2024") so the user can disambiguate without opening each result.

**Warning signs:**
- Search uses `WHERE name LIKE '%' || ? || '%'` or equivalent ORM call.
- No tests over realistic-sized datasets.
- Typo in query returns zero results.
- Search excludes notes (so "we talked about pottery" doesn't find Tom).

**Phase to address:**
**Phase 2 (browse/search/filter phase).** Build FTS in from the start of this phase; do not "swap LIKE for FTS later" — too easy to forget.

---

### Pitfall 5: Stale-contact view becomes a guilt machine, gets ignored, then disabled

**What goes wrong:**
The "haven't talked to in X days" view starts as a helpful prompt. Within weeks it lists 200 people. Every visit guilt-trips the user. They stop opening that screen. Soon they stop opening the app. Reminder-fatigue research: *"64% of users will delete an app if they receive five or more notifications a week"* and the same dynamic applies to in-app red badges and dashboards. Monica's reminder system has been criticized for being unrelenting. Smart Contact Reminder explicitly markets *"fuzzy contact reminders so you don't always talk to contacts on the same day of the week"* — a direct reaction to this failure pattern.

**Why it happens:**
- Naive implementation: "show everyone with `last_contact_at < NOW() - INTERVAL '90 days'`" produces an unbounded list.
- No notion of relationship tier — your dentist and your closest friend get equal weight.
- No snooze, no dismiss, no "this person is not someone I follow up with."
- Push notifications (when added in v2) compound the problem.

**How to avoid:**
- **No push notifications in v1.** PROJECT.md correctly defers real follow-up reminders to v2. Honor that.
- The v1 staleness view is **pull, not push** — user navigates to it deliberately, doesn't get nagged.
- Cap the view: top N (e.g., 10) stalest contacts, not the full backlog.
- Allow **"not a follow-up person"** flag on contacts (mark someone as low-priority/archived from staleness without deleting them).
- Allow **"snooze" / "mark as touched"** without requiring a real interaction log — pressure relief.
- Resist scoring/streaks/gamification — the goal is durable memory, not engagement metrics.
- When v2 adds real reminders, default cadence to *quiet* (monthly digest, not daily push) and let user opt-in to more.

**Warning signs:**
- Staleness list grows unbounded over time.
- All contacts treated as equally "needing follow-up."
- No way to dismiss someone from the list.
- The developer themselves starts dreading the staleness screen during dogfooding.

**Phase to address:**
**Phase 3 (staleness view phase).** Build snooze/exclude mechanics in the same phase as the staleness view — don't ship the view without them.

---

### Pitfall 6: Lossy export / no real backup story → user can't trust the tool with sensitive data

**What goes wrong:**
The user accumulates years of intimate social memory. Something breaks — bad migration, server gone, account locked, app abandoned — and the data is unrecoverable, or recoverable only as a tangled CSV that flattens the relational structure. CRM-migration research: *"A CSV export flattens relational relationships into rows and columns, silently destroying the associations that make your data useful."* For a memory tool, partial data loss is a betrayal of the core promise.

**Why it happens:**
- Export is treated as a Phase-N feature, not Phase-1.
- Export uses a single flat CSV that loses event-attendance edges and tag-many-to-many.
- No automated backup; "I'll back up manually" never happens.
- Self-hosted database with no off-site backup.
- vCard 2.1 vs 3.0 vs 4.0 format mismatches break round-trip.

**How to avoke:**
- **Export = first-class Phase-1 feature.** PROJECT.md lists "exportable at any time" as an Active requirement — treat it that way.
- Export format is **full relational dump** (JSON or SQLite file), not just CSV of contacts. Include events, attendance edges, tags, notes, timestamps.
- Provide a secondary CSV-of-contacts and vCard export for sharing with external tools, but the *primary* export must preserve all relationships.
- **Round-trip test**: import your own export back into a fresh instance and verify byte-for-byte (or row-count-for-row-count) equivalence. Automate this as a test.
- **Automated daily backup** of the DB to an off-host location (e.g., S3 or a separate Vercel/Fly volume snapshot) from day one of going live.
- Version the export schema so future format changes don't orphan old exports.

**Warning signs:**
- Export is only CSV.
- No "import" feature exists to prove round-trip works.
- Backups not automated.
- No tested restore procedure.
- Schema migration tooling not in place when DDL changes ship.

**Phase to address:**
**Phase 1 (foundational), and verified in every subsequent phase via a "round-trip" smoke test.** Export and backup are crosscutting — every new field added must also be added to the export.

---

### Pitfall 7: Solo developer abandons their own tool

**What goes wrong:**
This is the meta-pitfall that subsumes most others. Personal projects die from one or more of: scope creep, perfectionism, no clear "done," fatigue when the dogfooding novelty wears off, demoralization at the first long bug, or the developer never actually using their own tool because some other pitfall (1, 2, 4, 5) made dogfooding painful. *"Unnecessary tweaks, indecisive UI decisions, and perfectionism are core reasons developers spend more time on things than necessary."* *"Complexity, in excess, is a motivator killer."*

**Why it happens:**
- No external accountability. No deadline. No coworker. No customer waiting.
- Easy to keep building, hard to ship.
- The developer enjoys engineering more than using the tool, so they over-engineer it and never use it.
- After the first 50 captures, the novelty fades and the daily-use motivation has to come from real utility — but utility hasn't materialized yet because the search / staleness / browse features aren't shipped.
- Hosting bills, dependency upgrades, framework deprecations create maintenance drag without offsetting reward.

**How to avoid:**
- **Ship Phase 1 to production within 2–4 weeks of starting.** A tool you don't use isn't a tool. Real dogfooding starts when the tool runs on your phone, not on localhost.
- **Vertical slices, not horizontal layers.** Phase 1 = "I can capture a contact on my phone and find them again next week." Not "the auth system is robust."
- **Pick a boring stack** that you won't have to maintain. Don't experiment with the framework AND build the app at the same time. PROJECT.md says "solid defaults" — honor that.
- **Cap hosting cost at free-tier**. PROJECT.md states this; respect it. If the bill grows, the project becomes a chore.
- **Pre-commit to anti-features.** PROJECT.md already lists multi-user, native app, real-time chat, social as out-of-scope. Re-read this list at every phase transition before adding anything new.
- **Limit aesthetic perfectionism**. PROJECT.md says shippable > pretty. Set a hard rule: no design iteration past "functional and tolerable" in v1.
- **Track use, not features**. The success metric for v1 is "I open this app at least 3x a week and the data I added 6 months ago is still there and findable." Not "feature count."

**Warning signs:**
- Three weeks in and nothing is deployed to a real domain.
- Developer is reading framework docs rather than logging contacts.
- Feature backlog grows faster than features ship.
- "I need to redo X" appears in commit messages.
- More commits to CI/tooling than to app code.
- Developer stopped using the dev instance "because it has bugs I'll fix later."

**Phase to address:**
**All phases, but enforced at every phase transition.** Add a transition checklist item: "Did I actually use this phase's output in real life this week? If no, why not?"

---

### Pitfall 8: Privacy missteps with sensitive social data

**What goes wrong:**
The user logs intimate, private observations about real people — health issues, relationship status, gossip, things told in confidence. A breach, a leaked backup, an accidentally-shared URL, or a third-party analytics SDK silently shipping note contents to a vendor would be a serious privacy violation for the user *and* for the unconsenting subjects. Monica's HN thread flags this: *"Privacy concerns emerged regarding storing intimate details about others without consent."* General web-security research highlights that personal contact info is high-value to attackers and that encryption-in-transit-but-not-at-rest is a common failure mode.

**Why it happens:**
- Single-user apps skip auth hardening ("only I use it").
- Cloud DBs aren't encrypted at rest by default everywhere.
- Free analytics SDKs ship form contents to vendors.
- "Share contact externally" feature accidentally exposes more than the user thinks (e.g., includes private notes in the share link).
- Backups stored without encryption.
- Search indexes on third-party services (e.g., Algolia) get a copy of every note.

**How to avoid:**
- **No third-party analytics or telemetry** that touches note/contact contents. Use only first-party, anonymized usage counts if anything.
- **HTTPS-only**, HSTS, secure cookies — table stakes.
- **Encrypted backups** off-host. If using S3, enable SSE-S3 or SSE-KMS.
- **Database encryption at rest** — choose hosts/databases that provide this by default (managed Postgres on Fly/Neon/Supabase typically do).
- **Sane auth from day one**: a real password (or passkey/magic-link), real session cookies, no "I'll add auth later." Even single-user, an exposed dev endpoint with no auth becomes a data leak the day it's accidentally indexed.
- **Share-a-contact feature**: explicit allowlist of fields to include in the share — never share private notes by default.
- **Rate-limit the auth endpoint** to prevent credential brute force.
- **No third-party search/index services** processing note contents in v1 (FTS5/Postgres FTS run locally in your DB — keep it that way).
- Document a threat model in one page. PROJECT.md already calls this out — make it explicit before Phase 1 ships.

**Warning signs:**
- Notes appear in browser console logs / error reports / Sentry payloads.
- Auth is "deferred to later."
- Backups stored unencrypted.
- Third-party JS on the capture page.
- Share-contact URLs are unguessable but unauthenticated (URL-as-password without expiry).

**Phase to address:**
**Phase 1 (foundational security baseline), revisited before any "share externally" feature ships.**

---

## Moderate Pitfalls

### Pitfall 9: Event lifecycle state machine forgotten or ad-hoc

**What goes wrong:**
PROJECT.md says events have a lifecycle: planned → attended → memory. If this isn't a state machine with clear transitions, you end up with future-dated events that never get "attended," past events that still show in upcoming, and ambiguity around "did I go or not?". The app's browse-by-event view becomes inconsistent.

**Prevention:**
- Model event state explicitly (`planned | attended | missed | cancelled`). Auto-transition `planned → past-but-unconfirmed` after the date, but require explicit "mark attended" with attendee selection before promoting to `memory`.
- Make the "review past event, mark attendees, add notes" flow a deliberate UX surface — it's a primary capture moment, not an afterthought.
- Date-only events (no time) are fine for v1; don't get drawn into timezone hell.

**Phase to address:** Phase 2 (event lifecycle phase).

---

### Pitfall 10: Tag explosion and inconsistency

**What goes wrong:**
Freeform tags are great until you have "aws", "AWS", "Aws", "aws-conference", "AWSreInvent" all referring to the same thing. Filtering becomes useless. *"When tags are scattered or inconsistent, your system feels messy, and automation becomes harder to trust."*

**Prevention:**
- Normalize case on save (lowercase).
- Strict autocomplete that prefers existing tags over new — show existing matches prominently before letting user create new.
- Tag-merge UI in admin/settings (rename tag X to tag Y across all contacts).
- Show tag usage counts so the user can spot rarely-used near-duplicates.

**Phase to address:** Phase 2 (tags/filter phase).

---

### Pitfall 11: Time / timezone confusion on event dates

**What goes wrong:**
Storing event dates in local time without a timezone, then displaying them on a phone in a different timezone, produces off-by-one-day bugs. "I met them on October 14" becomes "October 13" or "October 15" depending on the device.

**Prevention:**
- For an event "date" (no time) — store as `DATE`, render as `DATE`, never round-trip through timestamp.
- For activity logs with timestamps — store UTC, render in user's local TZ.
- Never use JavaScript `Date` for date-only fields; use ISO date strings or a date-only library.

**Phase to address:** Phase 1 (data model phase).

---

### Pitfall 12: Search results don't surface "context I need to recognize them"

**What goes wrong:**
Search returns a list of names. User sees "Tom Smith" and can't tell if it's the Tom from AWS or the Tom from their friend's wedding. They click each one to disambiguate. Capture's value (rich context) is wasted at retrieval time.

**Prevention:**
- Result row shows: name, most-recent event, top 2 tags, snippet of note matching the query.
- Highlight the query match in the snippet.
- Sort by relevance (bm25 from FTS5) with recency as tiebreaker.

**Phase to address:** Phase 2 (search phase).

---

## Minor Pitfalls

### Pitfall 13: No "I added a duplicate" prevention

When capture is fast, duplicates happen ("Did I already add this person?"). A name-similarity check at capture time ("Did you mean: Tom Smith (met at AWS 2024)?") prevents this cheaply.

**Prevention:** On capture-name-blur, fuzzy-match against existing names and show top 3 as "Possibly already added: …" with a tap to merge. Phase 1.

---

### Pitfall 14: Birthday/anniversary feature creep before v3

PROJECT.md defers custom fields (birthday, etc.) to v3. Resist adding a "just one birthday field" — it becomes the wedge for full custom-field complexity. Notes field is sufficient for v1; if the user really wants to remember a birthday they can write "birthday Oct 14" in notes.

**Prevention:** Stick to PROJECT.md scope. If birthdays are critical, plan v3 properly — don't bolt one on.

---

### Pitfall 15: Account / auth hosted via OAuth-only

PROJECT.md says "no third-party logins." Build email+password (or passkey/magic-link) auth — do not rely on Google/GitHub OAuth as the only login. OAuth-only auth means losing access if the OAuth provider locks the account.

**Prevention:** Self-contained auth from day one. Phase 1.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Plain `LIKE '%q%'` search instead of FTS | 30-line save | Multi-second searches at 1k+ contacts; full retrofit needed | Never — FTS5 is a 1-hour setup |
| CSV-only export (no JSON full dump) | Fast to build | Lossy round-trip; user can't trust backups; relational structure dies | Only as a *secondary* export alongside JSON |
| No auth in v1 ("just me") | Skips a week | Single accidental exposure = full data leak; retrofit means migrating sessions | Never for cloud-hosted |
| No automated backup ("I'll do it manually") | Skips a day | Single host outage / dropped DB = total data loss | Never for cloud-hosted |
| Big upfront schema (Person, Org, Role, Channel, ...) | Feels "proper" | Capture friction; migration debt; deferred features pre-built and unused | Never — defer per PROJECT.md scope |
| Full-page reload UI (server-rendered every click) | Simple framework | Mobile feels sluggish; capture friction (the killer) | Acceptable only if individual interactions stay <300ms perceived |
| Skip mobile testing until "later" | Faster dev loop | Mobile UX bugs compound; capture surface is broken on the primary device | Never — capture is mobile-first per PROJECT.md |
| No tag normalization | Saves a function | Tag explosion; filter unusable at 100+ tags | Acceptable for v1 if tag-merge UI ships in v2 |
| Local-time dates (no UTC discipline) | Avoids reading TZ docs | Off-by-one-day bugs across device timezone changes | Never |
| Third-party analytics on capture pages | Free metrics | Note contents leak to vendor; privacy promise broken | Never on pages that touch contact data |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Cloud DB (Neon/Supabase/Fly Postgres) | Trusting platform-default backup, never testing restore | Test a full restore to a scratch instance quarterly; document the runbook |
| Vercel / Fly hosting | Free-tier cron not available → no automated backup | Use external cron (cron-job.org, GitHub Actions schedule) hitting a `/internal/backup` endpoint |
| Image hosting (deferred to v3 per PROJECT.md) | Hot-linking to social media avatars | Don't — they 404 or change. Wait for v3, then own the storage |
| Email-magic-link auth provider (e.g., Resend, Postmark) | Provider sees the email + login link | Acceptable for personal tool; document it. Avoid sending note contents through any provider |
| OAuth (Google sign-in, deferred) | Sign-in *and* contact-import via same OAuth scope | Even if you add OAuth later, keep contact import as a separate opt-in scope |
| Push notifications (v2) | Default cadence too aggressive | Start with weekly digest; require opt-in for daily |
| LinkedIn/Google contact import (v2) | Bulk import floods the database; user can't tell new from old | Mark imported records with a flag; require explicit "promote to followed" before they appear in staleness view |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `LIKE '%q%'` search | Search visibly pauses | Use SQLite FTS5 / Postgres FTS with bm25 ranking | ~500 contacts on mobile, 2k on desktop |
| N+1 queries on contact list (load tags per contact in a loop) | List page slow, gets worse over time | Eager-load tags via JOIN or separate aggregated query | ~200 contacts |
| Loading all contacts to render list | Initial page load slow, memory spikes on phone | Paginate or virtualize the list (50 visible at a time) | ~500 contacts |
| Full-text index without column filtering | Search returns junk matches in note text when user wanted name | Weighted FTS columns: name >> tag >> company >> note | Search becomes "useless" feeling at any scale; severity grows with note volume |
| Re-indexing FTS on every write synchronously | Capture flow slow on phone | FTS5 contentless+external content table, or async update via trigger | ~100 captures |
| No DB vacuum / autovacuum off | DB file grows, slows everything | Default SQLite auto_vacuum=incremental, or Postgres autovacuum on | Years in; surprises you |

Expected scale for this project: 1 user, plausibly 1k–5k contacts over years, plausibly 100–500 events. Solutions above are sized for that scale, not for 100k+.

---

## Security Mistakes

Domain-specific issues beyond OWASP basics.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Single-user app with no auth ("only I use it") | One leaked URL = full social graph leak | Real auth (passkey/email-magic-link/password+TOTP) from Phase 1 |
| Share-contact URL is unguessable token but never expires | Once shared anywhere, content is forever accessible | Time-limited share URLs (24h default) and/or one-time-view |
| Note contents in error logs / Sentry breadcrumbs | Third-party vendor receives intimate notes | Scrub note fields from error payloads; use Sentry's `beforeSend` to drop sensitive fields |
| Database backups stored unencrypted in cheap object storage | Bucket misconfig = full data exposure | Always-encrypted backups; rotate the encryption key; private bucket with no public ACL |
| Logging request bodies in webserver access logs | Capture-form contents in logs | Log only paths/status; never bodies of `/contacts` POST routes |
| Auth cookies not `Secure` + `HttpOnly` + `SameSite=Lax` | Session hijack via XSS or unencrypted hop | Set all three flags; serve over HTTPS only |
| Backup files emailed to self ("offsite backup") | Email provider has all your data forever | Use S3/B2 with private encryption keys instead |
| No rate limit on auth endpoint | Credential stuffing | Per-IP and per-account rate limits; lockout-with-backoff |
| Note search reflects user input via FTS5 unescaped match expression | Crafted query DoS or syntax errors leaking schema | Use parameterized FTS5 `MATCH` with prefix-only operators; sanitize FTS metachars |

---

## UX Pitfalls

Common user-experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Required fields beyond name in capture form | User skips capture mid-conversation | Only name is required; everything else optional or auto-filled |
| No "save as draft" on mobile back-button | Phone lockscreen mid-capture = lost data | Autosave to IndexedDB on every keystroke; resume on next open |
| Staleness view shows everyone | Guilt; ignored; abandoned | Top-N view; allow exclude/snooze |
| Search results = just names | Can't distinguish people; clicks through each | Show event + tags + matching snippet inline |
| Modal forms on mobile | Modal scroll traps, keyboard hides save button | Full-page forms with sticky save bar |
| Edit form different from create form | Cognitive load; mistakes | Same form, same field order, autosave-on-blur |
| No undo on delete | Accidental deletion = data loss | Soft-delete with 30-day recovery |
| Empty state shows nothing useful | New user / fresh install confused | "Add your first contact" CTA, sample event |
| Tap targets <44px | Mis-taps; frustration | Enforce 44×44 minimum |
| Date pickers that require typing | Slow on mobile | Native `<input type="date">` |
| "Are you sure?" on every action | Friction; muscle-memory dismisses real warnings | Only confirm destructive bulk operations |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Capture flow:** Often missing autosave to local draft — verify by killing tab mid-capture and confirming draft is recovered.
- [ ] **Capture flow:** Often missing real-mobile testing — verify by capturing 5 contacts on an actual phone with thumbs while standing.
- [ ] **Search:** Often missing fuzzy/prefix matching — verify "Jon" finds "Jonathan" and "Smth" finds "Smith".
- [ ] **Search:** Often missing context in results — verify a result row shows enough to disambiguate two same-named contacts.
- [ ] **Search:** Often missing performance at scale — verify with 2,000 seeded contacts that p95 search latency is <100ms.
- [ ] **Export:** Often missing full relational dump — verify the export, fed back into import, reproduces the exact database state.
- [ ] **Export:** Often missing test for new fields — verify every field added in a phase appears in export *and* re-imports correctly.
- [ ] **Backup:** Often missing automation — verify a backup ran in the last 24h without manual intervention.
- [ ] **Backup:** Often missing restore test — verify you have actually restored from a backup at least once.
- [ ] **Staleness view:** Often missing exclude/snooze — verify you can mark a contact as not-a-follow-up.
- [ ] **Staleness view:** Often missing cap — verify the view doesn't grow unboundedly.
- [ ] **Auth:** Often missing rate limiting — verify auth endpoint locks out after N failed attempts.
- [ ] **Auth:** Often missing HTTPS-only enforcement — verify HTTP requests redirect and `Secure` cookie flag is set.
- [ ] **Events:** Often missing transition from planned→attended — verify a past-dated event prompts you to mark attendees.
- [ ] **Tags:** Often missing case normalization — verify "AWS" and "aws" are the same tag.
- [ ] **Mobile:** Often missing real-device testing — verify capture works on a real phone over a real cellular connection.
- [ ] **Mobile:** Often missing sticky save button — verify save is reachable without scrolling when keyboard is open.
- [ ] **Schema migration:** Often missing rollback path — verify every migration has a tested down-migration or backup-restore plan.
- [ ] **Privacy:** Often missing analytics scrubbing — verify no third-party request payloads contain note text.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Capture friction (P1) | MEDIUM | Profile real captures with timer; identify slowest field; ruthlessly cut requireds; add quick-add path. Re-test on phone. |
| Mobile UX broken (P2) | MEDIUM-HIGH | Audit each screen on real phone; rebuild forms single-column; remove modals; add sticky bottom bar. |
| Over-engineered model (P3) | HIGH | Migrate to a simpler schema; collapse Company/Role into Person string fields; deprecate unused tables. Backup before migration. |
| Search doesn't scale (P4) | LOW-MEDIUM | Drop in FTS5 virtual table; trigger-sync content; swap query in repository. ~1 day. |
| Annoying staleness/reminders (P5) | LOW | Cap list size; add snooze/exclude; soften notification cadence. |
| Lossy export (P6) | MEDIUM | Build JSON full-relational exporter; add round-trip test; verify against current data. |
| Solo dev abandoning (P7) | VARIES | Re-read PROJECT.md core value; ship one tiny working thing within a week; capture 5 real contacts immediately. If still stuck, descope aggressively. |
| Privacy slip (P8) | HIGH-CRITICAL | Rotate auth secrets; rotate DB credentials; audit logs; check for third-party SDK leaks; consider breach disclosure to self/subjects. |
| Tag explosion (P10) | LOW | Tag-merge UI; case normalization migration. Few hours. |
| Date/TZ bugs (P11) | MEDIUM | Audit all date columns; migrate display logic; verify with spot checks across timezones. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P1: Capture friction | Phase 1 (capture UX) | Time 5 real captures on phone; all under 30s |
| P2: Mobile UX | Phase 1 (capture UX) | Capture from real phone over cellular, with thumb only |
| P3: Over-engineered model | Phase 1 (data model) | Schema diagram shows ≤5 entities; PR review challenges every column |
| P4: Search scale | Phase 2 (browse/search) | Seed 2,000 contacts; p95 search <100ms; typo tolerance works |
| P5: Staleness annoyance | Phase 3 (staleness view) | View capped, exclude+snooze present, no push notifs in v1 |
| P6: Lossy export | Phase 1 + every phase | Round-trip import-export test green in CI on every phase |
| P7: Solo dev abandons | All phases (transition checklist) | Each phase transition: "Did I dogfood this real-life this week?" |
| P8: Privacy missteps | Phase 1 (security baseline) | Auth, HTTPS, encrypted backups, no 3rd-party analytics on data routes |
| P9: Event lifecycle ad-hoc | Phase 2 (events) | Explicit state column; past-event prompts attendance review |
| P10: Tag explosion | Phase 2 (tags/filter) | Case-normalized on save; autocomplete prefers existing |
| P11: TZ/date bugs | Phase 1 (data model) | Date-only fields use DATE not TIMESTAMP; verify across TZs |
| P12: Result rows lack context | Phase 2 (search) | Result row UX includes event + tag + matched snippet |
| P13: Duplicate captures | Phase 1 (capture) | Name-blur fuzzy match shows possible duplicates |
| P14: Birthday creep | Every phase (scope discipline) | Re-read PROJECT.md "Out of Scope" + "Deferred" before adding fields |
| P15: OAuth-only auth | Phase 1 (auth) | Self-contained auth path works without any third party |

---

## Sources

### Primary user-feedback sources (Monica, Dex, Clay reviews)
- [Atomic Review: Monica Personal CRM (Paolo Belcastro)](https://paolo.blog/blog/atomic-review-monica-personal-crm/) — HIGH confidence, detailed user-side critique
- [Monica Personal CRM Review (Dex blog)](https://getdex.com/blog/monica-review/) — biased source but consistent with others
- [Atomic Review: Dex Personal CRM (Paolo Belcastro)](https://paolo.blog/blog/atomic-review-dex-personal-crm/) — HIGH
- [Dex CRM Review 2024 (The Process Hacker)](https://theprocesshacker.com/blog/dex-crm-review) — MEDIUM
- [Clay.earth review (Muncly)](https://muncly.com/clay-earth-review-is-this-an-end-game-personal-crm/) — MEDIUM
- [Clay reviews on AppSumo](https://appsumo.com/products/clay/reviews/) — MEDIUM
- [Hacker News: Monica open-source personal CRM](https://news.ycombinator.com/item?id=21850155) — HIGH (direct user comments)
- [Monica GitHub Issue #5195: reducing daily-entry friction](https://github.com/monicahq/monica/issues/5195) — HIGH (Monica's own users reporting friction)

### CRM adoption / friction research
- [Why CRM Adoption Fails — Hey DAN](https://heydan.ai/articles/why-crm-adoption-fails-and-how-to-finally-fix-it) — MEDIUM
- [Affinity: CRM Adoption Rates](https://www.affinity.co/blog/crm-adoption-rates) — MEDIUM
- [Monday.com: CRM data capture friction](https://monday.com/blog/crm-and-sales/crm-data-capture/) — MEDIUM
- [Dynamics Success: Psychology of CRM Resistance](https://www.dynamicssuccess.com/post/psychology-of-crm-resistance) — MEDIUM

### Mobile UX / form design
- [Smashing Magazine: Best Practices for Mobile Form Design](https://www.smashingmagazine.com/2018/08/best-practices-for-mobile-form-design/) — HIGH
- [Zuko Analytics: Mobile Form UX](https://www.zuko.io/blog/8-tips-to-optimize-your-mobile-form-ux) — MEDIUM
- [Zuko: Form fields with biggest UX problems](https://www.zuko.io/blog/which-form-fields-cause-the-biggest-ux-problems) — MEDIUM
- [Smashing: UX in Contact Forms](https://www.smashingmagazine.com/2018/03/ux-contact-forms-essentials-conversions/) — MEDIUM

### Search performance (SQLite FTS5 / Postgres)
- [SQLite FTS5 official docs](https://www.sqlite.org/fts5.html) — HIGH
- [SQLite Extensions: FTS5 (blog.sqlite.ai)](https://blog.sqlite.ai/fts5-sqlite-text-search-extension) — HIGH
- [TheLinuxCode: SQLite FTS5 in practice](https://thelinuxcode.com/sqlite-full-text-search-fts5-in-practice-fast-search-ranking-and-real-world-patterns/) — MEDIUM
- [Apple Community: slow contacts search at scale](https://discussions.apple.com/thread/254610022) — corroborates real-world LIKE-style scaling pain

### Notification / reminder fatigue
- [MagicBell: How to Help Users Avoid Notification Fatigue](https://www.magicbell.com/blog/alert-fatigue) — MEDIUM
- [ContextSDK: Avoiding Push Fatigue](https://contextsdk.com/blogposts/avoiding-push-fatigue-common-user-turn-offs) — MEDIUM
- [Appointment Reminders: What is Reminder Fatigue](https://www.appointmentreminders.com/what-is-reminder-fatigue/) — MEDIUM
- [Smart Contact Reminder on Google Play](https://play.google.com/store/apps/details?id=me.barta.stayintouch&hl=en) — its "fuzzy reminders" feature description is itself evidence of the pitfall

### Export / migration / data loss
- [ClonePartner: Ultimate CRM Data Migration Checklist](https://clonepartner.com/blog/the-ultimate-crm-data-migration-checklist-a-10-point-plan-for-a-zero-loss-transition) — MEDIUM
- [DEV: Mastering CSV and vCard Conversions](https://dev.to/dataformathub/seamless-contact-format-migration-mastering-csv-and-vcard-conversions-4fkj) — MEDIUM
- [Pipeline CRM: Data Migration Checklist](https://pipelinecrm.com/crm-guides/crm-data-migration-checklist/) — MEDIUM

### Solo developer / personal project failure
- [Smashing: Solo Development — Learning To Let Go of Perfection](https://www.smashingmagazine.com/2025/01/solo-development-learning-to-let-go-of-perfection/) — HIGH
- [DEV: Why do you abandon your personal projects?](https://dev.to/denisveleaev/why-do-you-abandon-your-personal-projects-4bc0) — MEDIUM (community thread)
- [DEV: Why Many Developers Abandon Their First Projects](https://dev.to/iohan/why-many-developers-abandon-their-first-projects-53me) — MEDIUM
- [1000.software: Why Solo Developers Burn Out](https://www.1000.software/post/why-solo-developers-burn-out-and-how-even-a-little-help-changes-everything) — MEDIUM

### Privacy / sensitive personal data
- [BeagleSecurity: How to store and secure sensitive data in web applications](https://beaglesecurity.com/blog/article/how-to-store-and-secure-sensitive-data-in-web-applications.html) — MEDIUM
- [Securiti: Sensitive Data Exposure](https://securiti.ai/blog/sensitive-data-exposure/) — MEDIUM
- [MDN: Privacy on the Web](https://developer.mozilla.org/en-US/docs/Web/Privacy) — HIGH

### Data model / schema discipline
- [HyphaDev: HubSpot Custom Objects and Data Architecture](https://www.hyphadev.io/blog/complete-guide-hubspot-crm-data-architecture) — MEDIUM
- [OnePageCRM: Custom Fields vs Tags](https://www.onepagecrm.com/blog/custom-fields-or-tags-to-best-segment-your-data/) — MEDIUM
- [Capsule CRM: Best practices for tags and custom fields](https://capsulecrm.com/support/setup-and-configuration/best-practices-for-tags-custom-fields-and-datatags/) — MEDIUM

### Feature creep / scope discipline
- [Under30CEO: What is Feature Creep (and how to avoid it)](https://www.under30ceo.com/avoid-feature-creep/) — MEDIUM
- [Azamba: 4 Common Causes of CRM Scope Creep](https://www.azamba.com/2018/02/28/4-common-causes-of-crm-scope-creep-and-4-simple-solutions/) — MEDIUM
- [ProjectStrategizer: What Is Feature Creep](https://www.projectstrategizer.com/blog/feature-creep) — MEDIUM

### PWA / offline mobile forms
- [Monterail: Make Your PWA Work Offline (Dynamic Data)](https://www.monterail.com/blog/pwa-offline-dynamic-data) — MEDIUM
- [MDN: PWA Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — HIGH
- [Medium: Offline POSTs with Progressive Web Apps](https://medium.com/web-on-the-edge/offline-posts-with-progressive-web-apps-fc2dc4ad895) — MEDIUM

---
*Pitfalls research for: personal CRM / contact-and-event memory tool (NetMemory)*
*Researched: 2026-05-12*
