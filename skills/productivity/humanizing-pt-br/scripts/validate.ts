/**
 * This skill is written against `humanizer`'s numbering: its substitution table
 * names the patterns that do not survive the language change. Re-vendoring
 * `humanizer` at a release that renumbers or drops a pattern would leave those
 * references pointing at the wrong thing, silently.
 *
 * Discovered and run by `npm run lint`.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const skillDir = dirname(dirname(fileURLToPath(import.meta.url)))
const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8')
const source = readFileSync(join(skillDir, '..', 'humanizer', 'SKILL.md'), 'utf8')
const problems: string[] = []

const sourcePatterns = [...source.matchAll(/^### (\d+)\. /gm)].map((m) => Number(m[1]))
for (const [, ref] of skill.matchAll(/§(\d+)/g)) {
  if (!sourcePatterns.includes(Number(ref))) {
    problems.push(`§${ref} does not exist in humanizer, which has ${sourcePatterns.length} patterns`)
  }
}

// Ranges are written as "§1 through §9" and read by a human, so only the
// endpoints are checked above. The local P-numbering gets the same treatment
// humanizer gives its own.
const local = [...skill.matchAll(/^### P(\d+)\. /gm)].map((m) => Number(m[1]))
const expected = local.map((_, i) => i + 1)
if (local.length === 0 || local.join(',') !== expected.join(',')) {
  problems.push(`Portuguese patterns must be numbered P1 upward with no gaps, found [${local.join(', ')}]`)
}
for (const [, ref] of skill.matchAll(/\(P(\d+)\)|→ P(\d+)|Use instead \| P(\d+)/g)) {
  if (ref !== undefined && !local.includes(Number(ref))) problems.push(`cross-reference P${ref} does not exist`)
}

for (const problem of problems) console.error(problem)
process.exit(problems.length === 0 ? 0 : 1)
