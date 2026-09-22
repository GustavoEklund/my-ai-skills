/**
 * Invariants this skill's prose depends on, which the repository lint has no
 * way to know about. Adapted from upstream's `scripts/validate-package.py`,
 * minus the checks for files that collapsed into the repository-level ones.
 *
 * Discovered and run by `npm run lint`.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Upstream's own budget, tighter than the repository's 500. Honour it so the vendored text stays diffable. */
const MAX_LINES = 400

const skillDir = dirname(dirname(fileURLToPath(import.meta.url)))
const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8')
const problems: string[] = []

const numbers = [...skill.matchAll(/^### (\d+)\. /gm)].map((m) => Number(m[1]))
const expected = numbers.map((_, i) => i + 1)
if (numbers.length === 0 || numbers.join(',') !== expected.join(',')) {
  problems.push(`patterns must be numbered from 1 with no gaps, found [${numbers.join(', ')}]`)
}

// Renumbering is the change most likely to rot the prose in silence: the
// headings stay consistent while every §N pointing at them goes stale.
for (const [, ref] of skill.matchAll(/§(\d+)/g)) {
  if (!numbers.includes(Number(ref))) {
    problems.push(`cross-reference §${ref} points at a pattern that does not exist`)
  }
}

const lines = skill.split('\n').length
if (lines > MAX_LINES) problems.push(`SKILL.md is ${lines} lines, max ${MAX_LINES}`)

for (const problem of problems) console.error(problem)
process.exit(problems.length === 0 ? 0 : 1)
