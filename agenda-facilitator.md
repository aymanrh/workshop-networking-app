# Facilitator Guide — Internal Use Only

> **Not for participants**

---

## Pre-Workshop Checklist

- [ ] WhatsApp group created and all registrants invited
- [ ] `setup.html` link shared in WhatsApp group
- [ ] Groups assigned from registration data (balanced by role + experience)
- [ ] Repo accessible and all 4 branches verified on GitHub
- [ ] Slides / screen ready for intro section
- [ ] Virtual rooms / breakout groups pre-configured
- [ ] Menti energizer questions loaded (pick 3 from list below)

---

## Group Assignment Table

Fill in from registration data. Aim for: 1–2 BA/PO + 1–2 Developer + 1–2 Tester per group. Mix experience levels.

| Name | Role (from reg) | Experience | Group # |
|------|-----------------|------------|---------|
| | BA/Dev/Tester | 0-1 / 2-4 / 5+ | 1 |
| | BA/Dev/Tester | 0-1 / 2-4 / 5+ | 1 |
| | BA/Dev/Tester | 0-1 / 2-4 / 5+ | 2 |
| | BA/Dev/Tester | 0-1 / 2-4 / 5+ | 2 |
| | BA/Dev/Tester | 0-1 / 2-4 / 5+ | 3 |

---

## 2-Hour Timing Table

| Time | Activity | Branch | Facilitator Note |
|------|----------|--------|------------------|
| 0:00–0:10 | Welcome + Icebreaker | — | Goal: networking + learning + sharing. Pick one icebreaker prompt from section below. |
| 0:10–0:20 | Spec-driven AI dev intro + Soft skills | — | Hook: "Your prompt is your spec." Connect TDD/BDD to GSD. Slides 42, 43, 83 from your deck. |
| 0:20–0:28 | Step 00: `/gsd new-project` | `00-empty` | Show the command. Start the 8-min timer. Switch to `01-planning` while they're still discussing. |
| 0:28–0:45 | Step 01: File tour + discuss-phase | `01-planning` | Open PITFALLS first — most valuable for non-technical. Then ROADMAP. Show discuss-phase command. |
| 0:45–1:00 | Step 02: Discussion output | `02-discussion` | Focus on "agent's discretion" section in `CONTEXT.md` — this is where surprises come from. |
| 1:00–1:30 | Step 03: App + tests + UAT | `03-milestone` | `npm install` might take 1–2 min. Start it, then talk while it installs. Keep report open during UAT discussion. |
| 1:30–1:40 | Ship + new milestone | `03-milestone` | Teaser: "Milestone 2 is integrations + CI/CD. Workshop 2 covers that." |
| 1:40–2:00 | Q&A + Wrap-up | — | Start with 1–2 seeded questions if room is quiet. Key takeaway: spec + discuss + verify = human in the loop. |

---

## Talking Points + Concept Hooks

**00-empty → 01-planning transition:**

> "Your prompt IS your spec. What you tell the AI right now determines the roadmap, the requirements, the architecture, and the tests. Take your time here — the AI will do exactly what you describe, not what you meant."

**01-planning → 02-discussion transition:**

> "This is spec-driven development. `ROADMAP.md` is the spec. The AI will write code against it — not against your memory, not against a Slack message. Your job is to verify the spec reflects your intent before any code is written."

**02-discussion → 03-milestone transition:**

> "BDD in practice. `CONTEXT.md` is your Gherkin before the Gherkin. The decisions captured here tell the planner exactly what to build. Everything left to the agent's discretion is a test case you don't yet have."

**During UAT discussion on 03:**

> "Is the testing pyramid still the same? The AI wrote the code AND the tests. What does a human still own? `VERIFICATION.md` is where the AI admits what it couldn't check. That's your role."

**When shipping:**

> "This is the scaffold. Supabase auth, real database, email reminders, CI/CD gates — that's milestone 2. Today shows the workflow. The integrations are Workshop 2."

---

## Watch For

- **Groups spending too long on 01-planning file tour** — cut to PITFALLS + ROADMAP only if time is tight
- **Technical participants taking over** — redirect with "What does the BA think about this?" or "What would the tester verify?"
- **`npm install` or E2E tests slow on 03-milestone** — start them early and fill with UAT discussion while they run
- **Groups stuck on GSD questions** — remind them: "One sentence answer is enough. The AI will ask follow-up questions."

---

## Icebreaker Prompts (pick one)

- "The most AI-assisted thing I've done is…" *(even if it's just autocorrect)*
- "My worst or funniest bug story…"
- "One thing I thought was magic until I understood how it worked…"

---

## Energizer — Would You Rather? (pick 3, set up in Menti)

**Easy openers:**

- Would you rather have 100 tabs open or lose the one tab you actually need?
- Would you rather deploy on a Friday evening or present to executives with no prep?
- Would you rather have all your bugs found by users or by your boss?

**AI themes:**

- Would you rather have AI write your code and you test it, or you write the code and AI tests it?
- Would you rather trust a feature that passed all tests or one a senior dev eyeballed and approved?

**T-shaped / soft skills:**

- Would you rather be a specialist who knows one thing deeply or a generalist who knows a bit of everything?
- Would you rather ship fast and fix later or ship slow and ship right?

---

## Q&A Seed Questions (use if room is quiet)

- "What skill do you think you'll use LESS because of AI? What might you stop developing?"
- "If the AI wrote the spec AND the tests AND the code — what is the tester's job?"
- "What's one thing from today you'd do differently in your current project?"
