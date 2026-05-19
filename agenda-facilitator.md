# Facilitator Guide — Internal Use Only

> **Not for participants**

The workshop runs entirely on the **`setup`** branch. Everything is built **live** in 2 hours with GSD. **`main`** is the finished v1 — use it as a reference for sanity-checks (`git show main:...`) but never have participants check it out mid-session.

---

## Pre-Workshop Checklist

- [ ] WhatsApp group created and all registrants invited
- [ ] Both setup links shared in WhatsApp group: `setup.html` (Claude Code track) **and** `setup-codex.html` (Codex track)
- [ ] Groups assigned from registration data (balanced by role + experience)
- [ ] Repo accessible — `main` and `setup` branches both visible on GitHub
- [ ] GH Pages deploy green — open `/workshop-networking-app/setup/setup.html` and confirm it renders
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

| Time | Activity | Step | Facilitator Note |
|------|----------|------|------------------|
| 0:00–0:10 | Welcome + Icebreaker | — | Goal: networking + learning + sharing. Pick one icebreaker prompt from section below. |
| 0:10–0:20 | Spec-driven AI dev intro + Soft skills | — | Hook: "Your prompt is your spec." Connect TDD/BDD to GSD. Slides 42, 43, 83 from your deck. |
| 0:20–0:30 | Step 3: `/gsd-new-project` | workshop.md · Step 3 | Show the command live on your screen. Start the 8-min timer. Cue groups to answer each question together, BA voice first. |
| 0:30–0:50 | Tour the planning output | — | Open `PITFALLS.md` first — most valuable for non-technical. Then `ROADMAP.md`. Show how `.planning/research/` was generated. Compare with `main`: `git show main:.planning/research/PITFALLS.md`. |
| 0:50–1:05 | Step 4: `/gsd-discuss-phase 1` | workshop.md · Step 4 | Focus on the "Decisions" section in `CONTEXT.md` — this is where the AI's discretion would otherwise live. Ask: "If you hadn't been asked, what would have happened?" |
| 1:05–1:30 | Step 5: Execute + run + test | workshop.md · Step 5 | `/gsd-execute-phase 1` will take 3–8 min. While it runs, narrate what GSD is doing (plan → atomic plans → wave-based execution → verification). Then `npm install` (~1 min) → `npm run dev` → `npm test`. |
| 1:30–1:45 | UAT discussion + Ship | workshop.md · Step 5 | Open `01-VERIFICATION.md` on screen. Walk through the "needs human" rows. Then `/gsd-ship` + `/gsd-new-milestone`. Teaser: "Milestone 2 is integrations + CI/CD. Workshop 2 covers that." |
| 1:45–2:00 | Q&A + Wrap-up | — | Start with 1–2 seeded questions if room is quiet. Key takeaway: spec + discuss + verify = human in the loop. |

---

## Talking Points + Concept Hooks

**Before Step 3 (`/gsd-new-project`):**

> "Your prompt IS your spec. What you tell the AI right now determines the roadmap, the requirements, the architecture, and the tests. Take your time here — the AI will do exactly what you describe, not what you meant."

**Between Step 3 and the planning-output tour:**

> "This is spec-driven development. `ROADMAP.md` is the spec. The AI will write code against it — not against your memory, not against a Slack message. Your job is to verify the spec reflects your intent before any code is written."

**Before Step 4 (`/gsd-discuss-phase 1`):**

> "BDD in practice. `CONTEXT.md` is your Gherkin before the Gherkin. The decisions captured here tell the planner exactly what to build. Everything left to the agent's discretion is a test case you don't yet have."

**During UAT discussion on `01-VERIFICATION.md`:**

> "Is the testing pyramid still the same? The AI wrote the code AND the tests. What does a human still own? `VERIFICATION.md` is where the AI admits what it couldn't check. That's your role."

**When shipping:**

> "This is the scaffold. Supabase auth, real database, email reminders, CI/CD gates — that's milestone 2. Today shows the workflow. The integrations are Workshop 2."

---

## Watch For

- **Groups racing through `/gsd-new-project` answers** — slow them down. One short, opinionated sentence per answer beats a fast paragraph.
- **Technical participants taking over** — redirect with "What does the BA think about this?" or "What would the tester verify?"
- **`/gsd-execute-phase 1` taking longer than 8 min** — keep the room engaged with the slides on GSD internals; do *not* let groups jump ahead and run commands out of order.
- **`npm install` slow on weak Wi-Fi** — start it as soon as `execute-phase` finishes; talk over it.
- **Groups stuck on GSD questions** — remind them: "One sentence answer is enough. The AI will ask follow-up questions."
- **Anyone trying to `git checkout main` mid-session** — gently stop them. We compare with `git show main:...` only. Checking out main blows away their `.planning/` work.

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
