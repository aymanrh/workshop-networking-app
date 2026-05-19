# Workshop Agenda — Participant

**2 hours · Groups of 5–7 · AI-Assisted Development with GSD**

---

## Your role today

| Role | Perspective |
|------|-------------|
| **BA / PO** | Product perspective |
| **Developer** | Technical feasibility |
| **Tester / QA** | Quality perspective |

Pre-assigned from your registration. Each group has all 3 roles — everyone contributes to every step.

---

We'll spend the whole 2 hours on the **`setup`** branch, building a real app live with GSD + Claude Code (or Codex). The finished v1 reference is on **`main`** — peek any time with `git show main:...` to see "what's this supposed to look like?".

---

## Agenda

| Time | Activity | What's happening |
|------|----------|------------------|
| 0:00 | **Welcome + Icebreaker** | Goals, agenda, housekeeping. Group intros with one themed prompt. |
| 0:10 | **Spec-driven AI dev — the big picture** | What is GSD? Why does TDD/BDD still matter with AI? How do we keep humans in the loop? |
| 0:20 | **Step 3 — Kick off the project** | Run `/gsd-new-project` and answer the 6–8 questions as a group. **Your prompt is your spec.** |
| 0:30 | **Tour the planning output** | Walk through `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, and the research files GSD just produced. Identify risks in `PITFALLS.md`. |
| 0:50 | **Step 4 — Discuss phase 1** | Run `/gsd-discuss-phase 1`. Surface the decisions the agent would otherwise make on its own. What did **you** decide vs. what the AI would have decided? |
| 1:05 | **Step 5 — Execute phase 1** | Run `/gsd-execute-phase 1`. Plan → code → tests → verification. Run the app, run the tests, open the HTML report. |
| 1:30 | **UAT + Ship** | Read `01-VERIFICATION.md` — what does a human still own? Run `/gsd-ship` and open milestone 2. |
| 1:45 | **Q&A + Wrap-up** | Open questions, key takeaways, what to try after today. |
| 2:00 | **End** | 👏 |

The step numbers match the headings in [workshop.md](workshop.md) — that's your live guide for the 2-hour session.

---

> **What you'll produce by the end:** A spec-driven project plan (`PROJECT.md` + `ROADMAP.md` + research), a phase 1 discussion context (`CONTEXT.md`), and a running app with passing tests and a verification report — all on your own machine, built by your group.
