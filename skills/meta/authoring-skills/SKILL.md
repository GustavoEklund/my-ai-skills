---
name: authoring-skills
description: Adds, splits, renames, or retires a skill in the my-ai-skills repository without creating overlap with the skills already there. Use when working inside this repository and a skill needs to be created, changed, merged, or removed.
---

The repository's rules live in [CLAUDE.md](../../../CLAUDE.md), and that file is the contract. This is the procedure for changing the skill set without making it redundant.

## 1. Write the trigger surface first

Before any file exists, write one sentence answering: *when should an agent reach for this?* Not what it does. When it fires.

That sentence is what collides with other skills, so it is the thing to compare. Two skills that do different work but fire in the same situation are a redundancy; two skills that do similar work in clearly different situations are not.

## 2. Triage against the index

Read the Description column of every row in the skill index in CLAUDE.md. For each existing skill whose trigger surface touches yours, pick one of three:

- **Extend.** The existing skill already fires in this situation and merely handles it badly. Improve that skill and add nothing. This is the right answer more often than it feels.
- **Carve.** Both skills are warranted and a real line divides them. State that line in one sentence; it becomes the `metadata.boundary` field on both skills. A boundary you cannot state in one sentence means the answer was actually Extend.
- **Extract.** Two skills need the same method. Move the method into a content skill and leave thin skills that call it.

If nothing touches it, say so explicitly before moving on. Silence is not the same as having checked.

## 3. Pick the shape

**Content skill.** Holds the instructions. Gerund name (`grilling`, `reviewing-migrations`). Model-invocable unless there is a reason it should not be.

**Alias skill.** An entry point and nothing else. Imperative name that reads like a command (`grill-me`). One-line body delegating to a content skill, `disable-model-invocation: true`, and `metadata.delegates-to` naming the target.

An alias earns its place only when the imperative name is one you will actually type, or when a second skill composes the same content. Otherwise the content skill is already reachable as `/<name>` and the alias is pure cost: every description is preloaded into the system prompt.

## 4. Scaffold

Path is `skills/<bucket>/<skill-name>/SKILL.md`, and `name` must equal the directory name. Buckets and the full frontmatter contract are in CLAUDE.md.

Descriptions are third person, say both what the skill does and when to use it, and stay under 1024 characters. Write them for a reader who has 40 other descriptions in front of them.

## 5. Close the loop

1. `npm run index` regenerates the index in CLAUDE.md and README.md from the filesystem.
2. `npm run lint`. Fix what it reports rather than working around it.
3. Record the change under `## [Unreleased]` in CHANGELOG.md, in the correct Keep a Changelog section. The version semantics are in CLAUDE.md, and getting the section right is what decides the next release number.
4. Promoted-bucket skills also go in `.claude-plugin/plugin.json`. The lint fails if you forget.
5. `npm run link` to pick it up on this machine. Restart the agent: harnesses read `SKILL.md` at startup.
