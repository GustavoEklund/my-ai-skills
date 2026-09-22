# Changelog

All notable changes to this project are recorded in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versioning follows [Semantic Versioning](https://semver.org/). What counts
as MAJOR, MINOR and PATCH is defined in [CLAUDE.md](CLAUDE.md).

## [Unreleased]

### Added

- `humanizer`: rewrites AI-sounding prose so it reads like the writer without
  changing what it says, working from 25 numbered tells grouped by the default
  choice each one represents. Vendored from
  [blader/humanizer](https://github.com/blader/humanizer) v3.0.0 (MIT), body
  unmodified.
- Vendoring convention: `metadata.upstream` and `metadata.upstream-version`
  record where a skill's text came from, the lint requires the upstream
  `LICENSE` beside it, and `npm run vendor:check` reports which vendored skills
  have fallen behind their upstream release.
- Per-skill validators: a skill may ship `scripts/validate.ts` for invariants
  the repository lint cannot know about, and `npm run lint` runs it. `humanizer`
  uses one to keep its patterns numbered without gaps and its `§` references
  resolving.

### Changed

- Everything in the repository is written in English now, including the README,
  this changelog, and the plugin manifests.

### Fixed

- The GitHub Release body no longer includes the link reference definitions
  from the end of `CHANGELOG.md`. Extraction stopped only at the next version,
  so the newest section dragged everything through to end of file.

## [0.1.0] - 2026-09-21

### Added

- `grilling`: a round-based interview that pressure-tests a plan or design
  until no decision is left implicit. Models the work as a graph of decisions,
  asks the whole frontier at once with a recommendation attached to every
  question, and closes with a summary separating what was settled, what was
  assumed, and what stays open.
- `grill-me`: a user-invoked entry point (`/grill-me`) delegating to
  `grilling`.
- `authoring-skills`: the procedure for adding, splitting, renaming or retiring
  skills without creating overlap with the ones already there.
- Lint (`npm run lint`) over frontmatter, name uniqueness, alias rules, body
  length, links, reference depth, the plugin manifest, version agreement,
  changelog shape, and similarity between descriptions.
- A generated index (`npm run index`) in `CLAUDE.md` and `README.md`, with
  `npm run index:check` in CI to keep it from going stale.
- Publication as a Claude Code plugin, with the repository serving as its own
  marketplace.

[unreleased]: https://github.com/GustavoEklund/my-ai-skills/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GustavoEklund/my-ai-skills/releases/tag/v0.1.0
