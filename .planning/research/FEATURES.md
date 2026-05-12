# Feature Landscape: Personal Networking App

**Domain:** Personal CRM / networking
**Researched:** 2026-05-12
**Overall confidence:** HIGH for table-stakes and anti-features; MEDIUM for closeness-tracking specifics (vendors are intentionally vague in public docs); HIGH for the MVP recommendation given the locked scope.

## Executive Summary

The personal-CRM category is small, opinionated, and surprisingly mature. Across Dex, Clay/Mesh, Monica HQ, Folk, UpHabit, Cardhop, and Covve, the same five primitives appear in nearly every product: **contacts with notes, tags or groups, keep-in-touch reminders on a cadence, an interaction timeline, and last-touch tracking**. Everything beyond that — relationship-strength scoring, AI enrichment, browser-extension capture, calendar/email sync — is differentiator territory and is exactly what separates the "good enough notebook" tier from products people actually pay for. The category has also matured to the point that there is broad consensus on what personal CRMs deliberately *don't* do: no deal pipelines, no lead scoring, no email sequences, no mandatory activity fields, no multi-user. Those are business-CRM affordances and they actively make personal-CRM workflows worse.

For our v1, the locked scope ("core triangle + follow-ups + notes" — People, Events, Profile, Home dashboard with follow-ups, ~6 screens, IndexedDB-only, 2.5 weeks) maps almost perfectly onto the table-stakes set plus two differentiators that genuinely belong in v1 because they are *the* product wedge: **closeness/warmth as a first-class state** (★/🔥/❄) and **event-as-container-for-people**. Closeness is what makes our app feel different from a Notion table on first glance; event-as-container is what makes 30-second capture feasible (the where-we-met defaults to "the event you just added"). Smart decay, auto-cooling alerts, and goal dashboards are tempting but explicitly deferred — they require data the user hasn't yet logged enough of to make the feature feel intelligent rather than noisy.

Real products to model against: **Dex** for the keep-in-touch cadence pattern, **Clay/Mesh** for the high/medium/low strength UI, **Folk** for groups-with-pipelines (we take the groups idea, reject the pipeline part), **Monica** for the recurring-stay-in-touch interval, **UpHabit** for the preset-or-custom tag pattern, and **Cardhop** for the natural-language single-input quick-add (aspirational stretch goal; v1 ships with a fast form, not parsing).

## Table Stakes

| Feature | Why Expected | Complexity (Next.js + IndexedDB) | Examples (Products) | Notes |
|---|---|---|---|---|
| **Contact list with search** | Every personal CRM since 2018 has this; users won't try a product without it. | Low | Dex, Clay, Monica, Folk, UpHabit, Cardhop, Covve | Search by name + tag is the minimum bar; fuzzy is nice-to-have. Dexie supports `.where().startsWithIgnoreCase()` natively. |
| **Per-person notes** | The single most-used field across every personal CRM; Monica's entire identity is "remember everything." | Low | All of them | One free-text field per person is sufficient for v1; appending vs editing is a design choice (we should pick append-with-timestamp — that's what Cardhop does with its timestamp button and what makes the timeline feature work for free). |
| **Tags** | Universal across category. Folk groups, Monica labels, UpHabit tags, Clay groups — same concept. | Low | All of them | Multi-tag per person is standard. Preset + custom is the UpHabit pattern and it works. |
| **Last-touch tracking** | This is what makes the CRM "nudge" — without it, follow-ups are meaningless. | Low | Dex, Clay, Monica, UpHabit, Covve | Stored as `lastContactedAt: Date` on the person; updated when user explicitly logs a touch or edits a note. Auto-detection from email/calendar is a Dex/Clay differentiator we don't have (no integrations). |
| **Follow-up reminders** | Defining feature of the entire category. "Personal CRM that reminds you to keep in touch" is literally Dex's tagline. | Low–Med | Dex, Clay, Monica, UpHabit, Folk | Fixed-date is table stakes; interval ("every 3 months") is also table stakes — see Deep Dive B. |
| **Where-we-met (event association)** | Distinguishes networking-CRM from generic contacts. Folk groups people "by events you met them at." | Med | Folk, Dex (via calendar sync), Clay | We get this for free if Event is a first-class entity (which our scope already commits to). |
| **Closeness/warmth tracking** | Not *every* product has this explicitly, but every product *needs* the user to have some sense of who matters more — Clay/Mesh exposes it as high/medium/low, Dex hints via Kanban stages. | Low (manual) / High (auto-decay) | Clay/Mesh (high/med/low), Dex (Kanban stages) | See Deep Dive A. Manual + 3-tier is table stakes; auto-decay is differentiator. |
| **Person profile page** | Once a person is added, you need somewhere to *see* them. All products have a profile/detail view. | Low | All of them | Notes + tags + event-met + timeline of touches is the standard set. |
| **Empty / loading / error states** | "Linear/Notion polish" floor — without these the app feels half-built. | Low | Linear, Notion (reference aesthetic) | Skeleton loaders, empty-state illustrations or messages, error toasts. Cheap to add, expensive in user perception if missing. |

## Differentiators

| Feature | Value Proposition | Complexity | Examples | Notes |
|---|---|---|---|---|
| **3-tier closeness state (★/🔥/❄)** | Replaces flat contact lists with a glanceable hierarchy — the user knows immediately who's a "close" relationship vs a cooling one. Visually carries the brand. | Low (manual) | Clay/Mesh (high/med/low), implicit in Dex | **In v1.** Manual setting only — no auto-decay. Cheap to build, huge UX payoff. |
| **Smart lists / saved filters** | "Show me cooling people I haven't talked to in 60 days" — turns the data into actionable lists. | Med | Cardhop (Focus Filtering), Folk (segments) | **Defer to v2.** We get 80% of the value just from filter-by-closeness + filter-by-tag on the People page. Saved filters aren't worth the schema cost in 2.5 weeks. |
| **Timeline view per person** | Shows interaction history at a glance; Dex calls this "the timeline" and treats it as core. Cardhop has a timestamp button that builds the same thing manually. | Low–Med | Dex, Cardhop, Clay | **In v1, in minimal form.** Our scope already commits to "timeline of touch points" on the profile. Simplest implementation: append-only list of `{timestamp, note}` entries — no separate "touch" entity needed. |
| **Goal-oriented dashboard ("5 people/month")** | Turns the CRM into a productivity tool with explicit targets. | Med | Wave Connect, some Notion templates | **Defer.** Already on the out-of-scope list as "gamification." Don't reintroduce. |
| **Event-as-container-for-people** | Lets the user think in terms of "the event I just went to" rather than typing each person from scratch. The 30-second capture promise depends on this. | Med | Folk (groups-by-event), Dex (calendar-linked), Wave Connect (event analytics) | **In v1.** Already in scope. See Deep Dive D. |
| **Auto-decay of warmth state** | Closeness drops automatically as last-touch ages — surfaces relationships before they're forgotten. | High | Implied by Clay's "relationship strength scoring catches fading connections before they go cold" | **Defer.** Requires tuned thresholds and enough user data to feel right; in a workshop demo with seed data, auto-decay would mostly look broken or arbitrary. Manual closeness + visible "last seen N days ago" gets us most of the value. |
| **Cooling alerts ("haven't talked in 3 months")** | Proactive surfacing of fading relationships. | Med–High | Mesh ("relationship strength scoring catches fading connections"), Dex's keep-in-touch nudges | **Defer.** Listed as out-of-scope ("smart suggestions") in PROJECT.md. Implicitly served by interval-based follow-ups. |
| **Quick-capture from anywhere** | "Adding takes seconds, not minutes" — Dex, Wave, Covve all emphasize this. | Med | Dex (Cmd+K), Folk (browser extension), Cardhop (natural-language input) | **In v1, in form-based version.** Floating "+" button → modal with name + minimum fields. See Deep Dive C. |
| **Recurring keep-in-touch cadence** ("every 3 months") | Dex's signature feature. Distinct from one-shot reminders. | Med | Dex, Monica, UpHabit | **In v1, single-shot only.** Reduce scope: support fixed-date reminders ("remind me on May 20") in v1; recurring intervals are a v2 win. Justification below in Deep Dive B. |
| **AI conversation prompts / pre-meeting briefs** | Dex/Clay's premium differentiator. | High | Dex (AI features), Clay (Nexus AI) | **Out of scope.** PROJECT.md already excludes this. |
| **Auto-enrichment from LinkedIn/email** | Clay, Dex, Folk all do this. Eliminates manual typing. | Very High | Clay, Dex, Folk, Covve | **Out of scope.** "No integrations" is a locked decision. |
| **Birthdays / important dates** | Monica's bread and butter; also in Dex. | Low | Monica, Dex, Cardhop | **Defer.** Could be reintroduced cheaply later — it's just another reminder type — but adds field complexity to the add-person form which fights the 30-second goal. |

## Anti-Features (Deliberately Skip)

| Anti-Feature | Why Avoid (Personal vs Business CRM) | What to Do Instead |
|---|---|---|
| **Sales pipelines / deal stages (Kanban with $ values)** | Business CRMs sell on this. Folk leans this way and reviewers flag it as feeling salesy. Personal-CRM users don't have deals — they have relationships. | Use the 3-tier closeness state. It's the personal-CRM-shaped analog of "lead stage." |
| **Lead scoring** | Numeric scoring belongs in B2B sales ops. Applied to friends, it's creepy and reductive. | Closeness is qualitative (★/🔥/❄), not numeric. No 0–100 score. |
| **Email blast / outbound sequences** | Outbound automation is the heart of business CRM (HubSpot, Salesforce, Pipedrive). Inappropriate for personal networking and breaks the no-integrations rule. | Single-person reminders only. No "send to all" anywhere in the UI. |
| **Mandatory activity log fields** | Business CRMs force "log this call: outcome, next step, duration" because of pipeline reporting. Personal-CRM users abandon products that demand structured logs. | Notes are free-text. Optional timestamp. Nothing required. |
| **Multi-user / team collaboration / sharing** | Personal CRM is personal. The moment you add seats and permissions, the entire UX changes. | Single-user only. No share buttons, no @mentions, no permissions surface. (Also free: no auth needed.) |
| **Forecasting / reports / analytics dashboards** | Pipeline value, conversion rates, won/lost ratios — business-CRM concerns. | Home dashboard shows *counts* (people / follow-ups / events) and today's actionable items — not analytics. |
| **Custom fields / custom objects** | Salesforce's killer-feature-and-curse. Lets users build their own schema. Massive complexity for a workshop demo. | Fixed schema: name, role, company, tags, notes, closeness, follow-up date, event-met. That's it. Cardhop and Dex both lock the schema and ship faster for it. |
| **Activity types taxonomy ("call/email/meeting/note")** | Business CRMs enumerate activity types for reporting. We don't report. | One activity type: "touch" (a note with a timestamp). Free-text content. |
| **Companies as a first-class entity** | B2B CRMs model Company → Contacts → Deals. We don't need it; `company` is a string field on a person. | Store company as a tag *or* a person attribute. No separate Companies table. |
| **Bulk import wizards / CSV mapping** | Business onboarding pattern. Adds enormous surface area. | Toggleable seed data covers the demo. CSV import is a v2 conversation. |
| **Workflow / automation builder** | HubSpot Workflows, Zapier-style triggers. Vast scope. | Hand-set reminders. No "when X then Y" engine. |
| **Mandatory onboarding flow** | Already excluded in PROJECT.md, but worth restating: business CRMs use long onboarding to extract structured data. We skip onboarding entirely. | Seed-data toggle on first run. |

## Deep Dive: Closeness / Warmth Tracking

**How real products model this:**

- **Clay/Mesh** is the clearest reference: a relationship-strength indicator (high / medium / low) sits in the upper-right of every contact card. It's the only product in the category that makes this a first-class, glanceable visual element. Reviewers consistently call it out as "uniquely valuable" and the thing that "catches fading connections before they go cold." The mechanism appears to be a hybrid — auto-influenced by interaction recency from email/calendar sync, but also user-adjustable. (CONFIDENCE: MEDIUM — vendor docs are vague on the exact algorithm.)
- **Dex** does not have an explicit closeness label, but its "keep-in-touch" Kanban board implicitly organizes contacts by follow-up stage, which functions as a closeness proxy. The cadence-per-contact setting (weekly / monthly / quarterly / yearly) is *the* way Dex users encode "how close is this person" — close people get weekly cadence, distant people get yearly.
- **Monica** has no closeness label per se but uses "relationship intensity" through how many details you've recorded about someone (family members, food prefs, etc.). It's an implicit/emergent signal, not an explicit setting.
- **Folk and UpHabit** lean on groups/tags to express closeness (e.g., a "close friends" tag) — but this is brittle and depends on user discipline.

**The trade-off:** Auto-decay (closeness automatically drops as last-touch ages) is technically appealing but requires (a) tuned thresholds, (b) enough data to feel right, and (c) a UX that explains the change so users don't think the app is broken. None of these work in a 2.5-week workshop demo with toggleable seed data.

**Recommendation for us:**

- Make closeness a **first-class, manual, 3-tier enum** on the person: `close` (★) / `warm` (🔥) / `cooling` (❄).
- Display prominently on the person card and profile — this is the visual signature of the app.
- Filter the People list by closeness as a core affordance.
- **No auto-decay in v1.** Display `last seen N days ago` as a separate, factual indicator the user can act on without the system changing closeness behind their back.
- The icons (★/🔥/❄) are already in PROJECT.md and are visually distinctive — keep them.
- Storage: single `closeness: 'close' | 'warm' | 'cooling'` field on the person entity. Default to `warm` for new captures (most networking contacts start "interested but not close").

## Deep Dive: Follow-up Reminder Mechanics

**The three patterns across the category:**

1. **Fixed-date reminders** ("Remind me on May 20 to message Sara") — present in Dex, Monica, Folk, UpHabit, virtually every product. Simplest UI, simplest data model. Universally expected.
2. **Recurring interval / cadence** ("Remind me every 3 months") — Dex's defining feature. Monica supports this. UpHabit calls them "preset or custom intervals." The cadence options users actually want: weekly / monthly / quarterly / yearly. (CONFIDENCE: HIGH — Dex docs and UpHabit page both confirm.)
3. **Smart / decay-based** ("Remind me when warmth drops") — implied by Clay/Mesh's "fading connections" alerts but rarely surfaced as an explicit reminder type. Closer to a notification feature than a reminder.

**Notification mechanism in real products:** Almost all use **in-app badge counts + a "Today" or "Due" list on the home dashboard**. Browser/push notifications are rare in personal-CRM web apps (Dex uses them on mobile native, not on web). Email reminders exist on Dex/Monica's paid tiers and would require a backend — out of scope for us.

**Recommendation for us:**

- **v1 ships fixed-date reminders only.** Set a follow-up date when adding a person (optional field, already in our requirements). Home dashboard shows "Today's follow-ups" — a list of people whose `followUpDate` is today or overdue.
- **Mark-as-done** clears the follow-up (delete the date, or set a "completed" flag — both work; prefer deleting for simpler data).
- **Do not build recurring intervals in v1.** They sound cheap but introduce a scheduler concept (compute next-due-date when current is marked done) and a way to edit/cancel a cadence. That's 2–3 extra screens we don't have budget for.
- **No browser push notifications** — in-app badge + the home dashboard "Today's follow-ups" list is enough. This also keeps us in the local-only model with no service-worker permissions dance.
- **v2 path** (deferred but cheap to layer on): add `cadence: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null` on the person. When a follow-up is marked done, compute the next `followUpDate` from cadence. This is the entire Dex feature in a few lines.

## Deep Dive: Quick-Capture UX (Core Value)

This is **the** product's wedge — PROJECT.md explicitly states: *"Adding a new person right after a meetup takes under 30 seconds and feels effortless."* Everything in the UI architecture should serve this.

**What makes capture feel fast in real products:**

- **Cardhop's natural-language single input** — "Add Sara Kim, designer at Figma, met at Config" — is the gold standard but requires parsing. (Aspirational only; we won't build a parser in 2.5 weeks.)
- **Dex's Cmd+K command bar** — keyboard-driven add from anywhere. Very fast for power users on desktop. Worth implementing as a *stretch*, not v1 must.
- **Folk's browser extension** — captures from a LinkedIn page in one click. Not applicable to us (no integrations).
- **Wave Connect / Covve's QR or card scan** — out of scope (no camera, no OCR).
- **Optimistic save** — every product writes the person to local state before the API confirms. We don't have an API; Dexie writes are local and effectively instant.
- **Smart defaults** — Folk auto-suggests groups based on context; Dex pre-fills calendar-met info. Both depend on integrations we don't have, **except**: defaulting `event-met` to the most-recently-created event is a free win that mirrors the user's mental flow ("I just got back from the meetup, now I'm adding the people I met there").

**Concrete pattern recommendation for v1:**

- **Globally-available "+" floating action button** (mobile) / **persistent "Add Person" button in sidebar** (desktop) — visible from every screen. No drilling into "People" first.
- **Single modal/sheet with progressive disclosure:**
  - Required, prominent: **Name** (single text field, autofocus on open).
  - Visible-but-optional inline: role/company (one field, "Designer at Figma" — single string, no parsing required), tags (chip input), follow-up date (date input).
  - Collapsed-by-default: notes (textarea behind "Add a note" toggle).
  - Smart default: `event-met` pre-filled with the most-recent event (with an X to clear, and a select to change).
  - Smart default: `closeness` pre-set to `warm` (🔥) — change with a one-tap toggle.
- **Single primary button: "Save".** Optimistic save — write to Dexie, close modal, navigate to person profile (or stay on current screen with a "Added — open" toast).
- **30-second budget check:** name (3s) + role/company (5s) + tags (5s) + closeness toggle if needed (2s) + save (1s) = ~16s without notes. With notes (10s) = ~26s. Within budget.
- **Keyboard polish (desktop stretch):** Cmd+K opens add-person modal. Enter saves. Esc cancels. This is the Linear/Notion polish floor.

The "single visible name field, everything else optional and discoverable" pattern is what makes it feel like 30 seconds rather than a form-fill chore. **The biggest UX risk is putting too many "required" markers on the form** — resist this.

## Deep Dive: Event-as-Container Pattern

**How real products do it:**

- **Dex** auto-logs calendar events as interactions on linked contacts. Requires calendar sync; the user doesn't manually create events.
- **Folk** lets users create groups labeled by event ("Met at AWS re:Invent 2024") and bulk-add contacts to them. Groups are slightly broader than events but the pattern is the same — a named container of people.
- **Wave Connect** explicitly supports events as tagged entities with analytics ("who I met at the conference"). Closest analog to what we want.
- **Clay/Mesh** does not strongly emphasize events but has groups.
- **Monica, Cardhop, Covve** do not have events as a first-class entity.

**What makes it work:** Event as a first-class entity is more powerful than tag-as-event because (a) events have their own metadata (date, location) that doesn't fit cleanly on a tag, (b) the timeline view per event ("who did I meet here?") is a genuinely useful reverse lookup, and (c) it gives the add-person flow a smart default (event-met = most recent event).

**Recommendation for us:**

- Event is a **first-class entity**: `{ id, name, date, location?, tags?[], createdAt }`.
- Person → Event is a **many-to-one** relation initially (each person has one "where we met" event), with a path to many-to-many in v2 if needed. Keeping it 1:1 in v1 avoids a junction table.
- **Adding people to an event:** support both directions:
  - From the event page: "+ Add person met here" — same quick-capture modal with `eventMetId` pre-filled.
  - From the add-person modal: `event-met` field with select of recent events + "Create new event" inline option.
- **Bulk-add at the event:** in v1, "add another person" returns you to the empty form with event still selected. This is the workshop-demo win — adding 4 people from "Config 2026" feels rhythmic, not repetitive.
- **Browse:** Events page shows upcoming + past sections. Tapping an event shows attendees list (filter People where `eventMetId == thisEvent`).
- **No calendar integration** — events are manually created. This is consistent with the local-only constraint.

## Deep Dive: Tag Systems That Don't Explode

**The taxonomy-explosion problem is real and documented:** A nonprofit ended up with 2,000 tags; a fintech had 1,400 customer-contact-reason dropdown entries, most duplicates. Personal-CRM users hit this faster than they expect — "designer," "Designer," "design," and "ui-design" all coexist after a month.

**Patterns that scale (from real products and content-taxonomy research):**

1. **Preset + custom** (UpHabit's pattern) — ship a curated starter list (e.g. "designer / engineer / founder / investor / friend / family / coworker / mentor"), let users add their own. Most users will stick to presets, which keeps the long tail small.
2. **Autocomplete on existing tags** — when a user starts typing "des...", show "designer (5)" before they create "design." Reduces near-duplicates dramatically.
3. **Lowercase + trim normalization on save** — silently converts "Designer" → "designer" before write. Aggressive but effective.
4. **No tag deletion gestures from the person — only from a global "manage tags" view** — prevents accidental "this tag is on 12 people, you sure?" friction.
5. **Show tag counts somewhere** ("designer · 5 people") so users get feedback about which tags are pulling weight.

**Recommendation for us:**

- **Tags table** in IndexedDB: `{ id, name (lowercase), createdAt }`. Person → Tags is many-to-many via a junction table or a `tagIds: string[]` array on the person (array is simpler in Dexie, fine for our scale).
- **Tag input is a chip-style autocomplete:** type, see matches, Enter to commit or pick from dropdown. Suggest from existing tags first; create new only if no exact match.
- **Normalize on write** (lowercase, trim whitespace).
- **No auto-suggested tags from notes content in v1** — that's an NLP feature with low signal at our scale.
- **No preset starter tags in v1** — they'd inflate seed data and the user can add their own quickly. The autocomplete-on-existing pattern is what prevents explosion; presets are a v2 nicety.
- **Tag-based filtering on the People list** — top filter bar with active-tag chips.
- **Don't build a "manage tags" CRUD screen in v1.** It's polish, not core. Tags that become unused are harmless.

## Feature Dependencies

```
Person entity
  ├── needs → Tags entity (for tag filter on People list)
  ├── needs → Event entity (for event-met field)
  ├── enables → Notes (free-text field on person)
  ├── enables → Closeness state (enum field)
  ├── enables → Follow-up reminders (date field)
  └── enables → Last-touch tracking (date field)

Event entity
  ├── enables → Event-as-container (attendees query)
  └── enables → Smart default in quick-capture (recent event)

Follow-up date (on Person)
  ├── enables → Today's follow-ups on Home dashboard
  └── enables → Follow-up count badge

Closeness state
  ├── enables → Closeness filter on People list
  └── enables → Visual hierarchy on person cards

Seed data toggle
  ├── depends on → All entities existing first
  └── enables → Non-empty workshop demo

Home dashboard
  ├── depends on → People entity (counts)
  ├── depends on → Events entity (upcoming list)
  └── depends on → Follow-up date (today's follow-ups)
```

Ship order is therefore approximately: schema/Dexie setup → People (list + add + profile) → Tags → Events → Follow-ups on Person → Home dashboard → seed data → polish.

## MVP Recommendation

**Prioritize (v1, ship for workshop on 2026-05-30):**

1. **People entity + list + search + filter by closeness/tag** — the spine of the app.
2. **Quick-capture flow** — globally-available "+" → modal with name + minimum fields + smart event-met default. The headline UX moment.
3. **Person profile** — notes (append-with-timestamp), tags, closeness state, event-met, follow-up date.
4. **3-tier closeness state (★/🔥/❄)** — first-class visual, manual setting only.
5. **Tags** — chip autocomplete on add; tag-filter on list.
6. **Events entity + list + profile** — upcoming/past split, attendees list per event.
7. **Fixed-date follow-up reminders** — set per person, surfaced on Home dashboard's "Today" list.
8. **Home dashboard** — counts (people / follow-ups / events), today's follow-ups, upcoming events.
9. **Toggleable seed data on first run** — Sara Kim, Kareem Tate, Mason Lee + sample events already in PROJECT.md.
10. **Responsive layout** — mobile-first, desktop sidebar + master-detail.
11. **Empty / loading / error states** — the Linear/Notion floor.

**Defer (v2 or later):**

- **Recurring keep-in-touch cadences** (every 3 months) — cheap to layer on once fixed-date works; not worth scoping into v1.
- **Auto-decay of warmth state** — needs tuning; would look broken in a fresh demo.
- **Cooling alerts / smart suggestions** — same reason; explicitly out of scope in PROJECT.md.
- **Timeline view per event (touch history)** — partially served by the per-person notes-with-timestamps; full event timeline is more.
- **Goal dashboard / "5 people/month"** — out-of-scope (gamification).
- **Birthdays / dates** — adds form fields that fight the 30-second goal.
- **Saved filters / smart lists** — minimal payoff vs cost.
- **Bulk-add UI for events** — the v1 "add another" loop is sufficient.
- **Tag management screen / preset tags** — autocomplete prevents most explosion.
- **Cmd+K command bar** — keyboard polish; stretch only.
- **CSV import/export** — workshop demo doesn't need it.
- **Email/calendar/LinkedIn integrations** — locked out by no-integrations constraint.
- **AI conversation prompts / OCR / parsing** — locked out by no-AI constraint.

## Workshop-Demo Fit

**Great to show live (each phase ends with a "look at this" moment):**

- **Quick-capture flow** — the 30-second demo. Add 3 people in 90 seconds during the workshop, audience sees the value instantly.
- **Closeness icons on the People list** — visual punch; communicates "this isn't just contacts" in one screen.
- **Home dashboard's "Today's follow-ups"** — the "CRM that nudges you" moment. With seed data the dashboard already has follow-ups due.
- **Event → attendees** — bulk-add 3 people to a single event; reverse-lookup feels powerful.
- **Responsive switch (mobile ↔ desktop)** — resize the browser live; shadcn + Tailwind makes this look effortless.
- **Empty state → seed-data toggle → populated state** — good narrative arc for the demo.

**Background / foundational (worth building but unlikely to demo):**

- Dexie schema and migration setup — invisible but enables everything.
- Tag normalization — invisible quality bar.
- Loading skeletons — only visible if you slow the network in DevTools (worth doing once for the demo).
- Error states — only visible if you break IndexedDB intentionally.

**Risk to flag:** the 30-second-capture story is the *only* demoable claim that is unfalsifiable in advance. Plan the workshop demo around adding ~3 specific people with names already memorized, so capture timing is consistent. Building the form for 30 seconds is the engineering work; choosing the demo names so it lands as 30 seconds is presentation work.

## Sources

High-confidence (vendor docs and product pages):

- [Dex — Product Overview](https://getdex.com/product/) — vendor source, accessed 2026-05-12 (HIGH)
- [Dex — Core Features Documentation](https://getdex.com/docs/dex-core) — vendor source (HIGH)
- [Dex — Mobile App](https://getdex.com/mobile/) — vendor source (HIGH)
- [Clay/Mesh — Product Page](https://clay.earth/) and [me.sh](https://me.sh/) — vendor sources (HIGH)
- [Monica HQ — Product](https://www.monicahq.com/) and [Documentation](https://docs.monicahq.com/) — open-source product, vendor source (HIGH)
- [Folk — Product](https://www.folk.app/) — vendor source (HIGH)
- [UpHabit — Top 5 Personal CRM Features](https://uphabit.com/2023/01/06/top-5-personal-crm-features/) — vendor blog, 2023 (HIGH)
- [Cardhop — Flexibits product page](https://flexibits.com/cardhop) — vendor source (HIGH)
- [Dex — Best CRM for Small Business comparison](https://getdex.com/blog/best-crm-for-small-business/) — vendor blog (MEDIUM, vendor-biased)
- [Dex vs Clay/Mesh comparison](https://getdex.com/blog/dex-vs-clay/) — vendor blog (MEDIUM, vendor-biased)
- [Dex — Mesh Review](https://getdex.com/blog/mesh-review/) — vendor blog (MEDIUM)

Independent reviews and analyses (2025–2026):

- [Wave Connect — Best Personal CRM Tools in 2026](https://wavecnct.com/blogs/personal-crm) — comparative review (MEDIUM, vendor-adjacent)
- [Folk — Top 10 Personal CRM Tools for 2026](https://www.folk.app/articles/best-personal-crm) — vendor list, useful for feature comparisons (MEDIUM)
- [Folk — Top 5 Personal CRMs guide](https://www.folk.app/articles/personal-crm-guide) — vendor guide (MEDIUM)
- [Use Apify — Clay Personal CRM Review 2026 (Now Called Mesh)](https://use-apify.com/blog/clay-personal-crm-review-2026) — independent review (HIGH for Clay/Mesh specifics)
- [Productive with Chris — Clay Review 2025](https://productivewithchris.com/tools/clay-personal-crm/) — independent review (HIGH)
- [Muncly — Clay.earth Review](https://muncly.com/clay-earth-review-is-this-an-end-game-personal-crm/) — independent review (MEDIUM)
- [It's FOSS — Monica](https://itsfoss.com/monica/) — independent review (HIGH for Monica)
- [OnePageCRM — 7 Best Personal CRM Tools in 2026](https://www.onepagecrm.com/blog/best-personal-crm/) — comparative review (MEDIUM, vendor-adjacent)
- [The Process Hacker — Dex CRM Review 2024](https://theprocesshacker.com/blog/dex-crm-review) — independent review (HIGH for Dex)
- [Nathan Ganser on Medium — Dex Personal CRM Full Review](https://medium.com/nat-personal-relationship-manager/dex-personal-crm-full-review-in-2020-f5fce911c0cf) — independent review from a competing PCRM author (HIGH)

Domain and pattern research:

- [Sentisum — Best Practice for Building a Tagging Taxonomy](https://www.sentisum.com/insights-article/best-practice-for-building-a-tagging-taxonomy) — taxonomy explosion patterns (HIGH)
- [Enterprise Knowledge — Navigating System Limitations for Taxonomy](https://enterprise-knowledge.com/navigating-system-limitations-for-taxonomy-implementation/) — taxonomy governance (HIGH)
- [LogRocket — Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) — IndexedDB/Dexie state-of-the-art (HIGH)
- [Dexie.js homepage](https://dexie.org/) — library reference (HIGH)
- [MRIA — CRM Data Model Explained](https://mriacrm.com/crm-data-model-explained-contacts-companies-deals-and-beyond/) — generic CRM data model (HIGH, but applies more to business CRM)
- [Andrew Today — How to Build a 100X Personal CRM](https://www.andrew.today/p/how-to-build-a-100x-personal-crm) — personal-CRM thinkpiece (LOW, single source)

Anti-feature framing (business vs personal CRM):

- [Wave Connect — 6 Best Personal CRM Tools (2025)](https://wavecnct.com/blogs/the-6-best-personal-crm-tools-in-2025) — explicit business-vs-personal framing (HIGH)
- [Monday — Personal CRM Software: 10 Best Tools For 2026](https://monday.com/blog/crm-and-sales/personal-crm-software/) — comparative (MEDIUM)

---
*Research conducted 2026-05-12 by gsd-project-researcher. Confidence ratings reflect vendor-claim verifiability; vendor docs are HIGH for "feature exists" but LOWER for "how the algorithm works" since most personal-CRM products keep their internal scoring private.*
