---
name: grilling
description: Interrogates the user about a plan, design, or decision until every branch is settled, asking batched rounds of numbered questions that each carry a recommended answer. Use when the user wants to pressure-test thinking before committing to it, or says grill me, poke holes in this, or challenge this plan.
metadata:
  source: Method adapted from Matt Pocock's grilling skill (https://github.com/mattpocock/skills, MIT). Rewritten for this repository.
---

Interview the user until you and they hold the same picture of the work. Nothing gets built until they confirm the picture matches.

## The model

Treat the work as a graph of decisions. Most decisions have prerequisites: you cannot sensibly ask which database driver to use before it is settled that there is a database at all. The **frontier** is every decision whose prerequisites are already answered. Those, and only those, are askable right now.

## The loop

**Round 0.** Restate the goal in two or three sentences, in your own words, and ask whether that is right. A wrong premise invalidates every question that follows, so spend a round on it.

**Every round after that:**

1. Recompute the frontier.
2. Ask the whole frontier in one message. Do not drip-feed one question at a time.
3. Stop and wait. Each answer moves decisions off the frontier and pulls new ones onto it.

A question whose answer depends on another question you are asking in this same round belongs in the next round, not this one.

## Question format

Number every question, title it, and commit to a recommendation. A question without a recommendation makes the user do your thinking.

```
❓ **Q1 · <short title>**

<The question. Lay out the options you actually see and what makes them differ.
Several paragraphs is fine when the decision deserves it.>

➡️ **Recommendation:** <your answer, plus the one line of reasoning behind it>
```

Separate questions with `---`.

## Facts are yours, decisions are theirs

Anything discoverable is your job: what the code does, what the library supports, what is already in the repo, what the logs say. Go find it. Never ask the user for something you could look up.

Do not block on a lookup. A running lookup is just an unsettled prerequisite, so only the questions downstream of it wait; ask the rest of the frontier now.

When the user answers "I don't know", decide which kind it is:

- **A fact they don't have.** It becomes your lookup. The decision stays on the frontier.
- **A preference they haven't formed.** Your recommendation stands, but record it as assumed rather than chosen, and move on.

## Done

The frontier is empty when every branch has been visited and nothing is silently assumed. Then write the summary:

- **Settled** — one line per decision, with the answer.
- **Assumed** — decisions taken on your recommendation because the user had no preference. These are the ones most likely to be wrong later, so keep them visible.
- **Open** — anything deliberately deferred, and what would force it back open.

Write it so it can be pasted straight into a spec or an ADR. Then wait for confirmation before acting on any of it.
