# my-ai-skills

Gustavo Eklund's personal collection of agent skills. One skill per directory,
versioned as a single collection, guarded by a lint, and shipped as a Claude
Code plugin.

> These skills carry my assumptions, my paths, and my way of working. Read them
> for reference, but prefer writing your own: a skill copied from someone else
> arrives with their context attached.

## Installation

**As a Claude Code plugin** (pinned version, the recommended route):

```
/plugin marketplace add GustavoEklund/my-ai-skills
/plugin install gustavo-eklund-skills@gustavo-eklund-skills
```

**By symlink** (development loop, always on `main`):

```sh
git clone https://github.com/GustavoEklund/my-ai-skills.git ~/Projects/my-ai-skills
cd ~/Projects/my-ai-skills && npm install && npm run link
```

`npm run link` creates one symlink per skill in `~/.claude/skills` and
`~/.agents/skills`, so a `git pull` is enough to update everything. Harnesses
read `SKILL.md` at startup: restart the agent after adding a skill.

## Skills

<!-- BEGIN SKILLS -->

### productivity

| Skill | Invocation | Description |
| --- | --- | --- |
| [`grill-me`](skills/productivity/grill-me/SKILL.md) | `/grill-me` | Starts a grilling session, a relentless round-based interview that pressure-tests a plan or design before any of it gets built. |
| [`grilling`](skills/productivity/grilling/SKILL.md) | model + `/grilling` | Interrogates the user about a plan, design, or decision until every branch is settled, asking batched rounds of numbered questions that each carry a recommended answer. Use when the user wants to pressure-test thinking before committing to it, or says grill me, poke holes in this, or challenge this plan. |

<!-- END SKILLS -->

Skills in the `meta/` bucket are not published in the plugin. They exist only
to maintain this repository, and load as project skills through
`.claude/skills/`.

## How the repository works

The full contract is in [CLAUDE.md](CLAUDE.md): layout, buckets, the allowed
frontmatter fields, the difference between a content skill and an alias skill,
and the versioning rules.

The reason any of this tooling exists: every description is preloaded into the
system prompt, so two skills that fire in the same situation are not merely
wasted context, they are an ambiguous choice handed to the model. Two layers
guard against it:

- **`npm run lint`** validates frontmatter, name uniqueness, alias rules, body
  length, links, the plugin manifest, version agreement and changelog shape,
  and compares descriptions against each other looking for redundancy.
- **[`authoring-skills`](skills/meta/authoring-skills/SKILL.md)** carries the
  judgement a script cannot make: before a skill is created, it forces its
  trigger surface to be compared against the index and a choice to be made
  between extending, carving a stated boundary, or extracting shared content.

`npm run index` regenerates the index in this README and in CLAUDE.md from the
filesystem, and `npm run index:check` (which CI runs) fails when the two
diverge. A stale index is worse than no index.

## Versioning

[Semantic Versioning](https://semver.org/) across the whole collection, and
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) in
[CHANGELOG.md](CHANGELOG.md). MAJOR when a skill is removed, renamed, or
changes its invocation contract; MINOR when a skill is added or gains a
capability; PATCH when only the wording changes.

`npm run release -- <major|minor|patch>` cuts the version, and pushing the tag
opens the GitHub Release with that changelog section as its body.

## Credits

- The method behind [`grilling`](skills/productivity/grilling/SKILL.md) comes
  from the skill of the same name by
  [Matt Pocock](https://github.com/mattpocock/skills) (MIT), rewritten here.
  The content/alias pairing is his convention too.
- The idea of keeping one repository of skills symlinked into several harnesses
  comes from [Fabio Akita's my-skills](https://github.com/akitaonrails/my-skills).

## License

[MIT](LICENSE).
