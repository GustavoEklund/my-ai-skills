import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROMOTED_BUCKETS, ROOT, loadSkills, type Skill } from './lib/repo.ts'

const BEGIN = '<!-- BEGIN SKILLS -->'
const END = '<!-- END SKILLS -->'

const cell = (text: string): string => text.replaceAll('|', '\\|').replaceAll('\n', ' ')

function invocationCell(skill: Skill): string {
  if (skill.invocation === 'user only') return `\`/${skill.name}\``
  if (skill.invocation === 'model only') return 'model only'
  return `model + \`/${skill.name}\``
}

/** The full table, including internal buckets. Its Description column is the input to overlap triage. */
function claudeTable(skills: Skill[]): string {
  const rows = skills.map((s) => {
    const kind = s.isAlias ? `alias → \`${s.delegatesTo}\`` : 'content'
    return `| [\`${s.name}\`](${s.dir}/SKILL.md) | ${s.bucket} | ${kind} | ${invocationCell(s)} | ${cell(s.description)} | ${cell(s.boundary ?? '—')} |`
  })
  return [
    '| Skill | Bucket | Kind | Invocation | Description | Boundary |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n')
}

/** Promoted skills only: this is what the plugin ships, so it is what a reader installs. */
function readmeTables(skills: Skill[]): string {
  const sections: string[] = []
  for (const bucket of PROMOTED_BUCKETS) {
    const inBucket = skills.filter((s) => s.bucket === bucket)
    if (inBucket.length === 0) continue
    sections.push(
      `### ${bucket}`,
      '',
      '| Skill | Invocação | Descrição |',
      '| --- | --- | --- |',
      ...inBucket.map((s) => `| [\`${s.name}\`](${s.dir}/SKILL.md) | ${invocationCell(s)} | ${cell(s.description)} |`),
      '',
    )
  }
  return sections.join('\n').trimEnd()
}

function replaceBlock(source: string, body: string, file: string): string {
  const start = source.indexOf(BEGIN)
  const end = source.indexOf(END)
  if (start === -1 || end === -1) throw new Error(`${file} is missing the ${BEGIN} / ${END} markers`)
  return `${source.slice(0, start + BEGIN.length)}\n\n${body}\n\n${source.slice(end)}`
}

const check = process.argv.includes('--check')
const skills = loadSkills()

const targets: { file: string; body: string }[] = [
  { file: 'CLAUDE.md', body: claudeTable(skills) },
  { file: 'README.md', body: readmeTables(skills) },
]

let stale = 0
for (const { file, body } of targets) {
  const abs = join(ROOT, file)
  const current = readFileSync(abs, 'utf8')
  const next = replaceBlock(current, body, file)
  if (current === next) continue
  if (check) {
    console.log(`\x1b[31merror\x1b[0m ${file}\n      skill index is out of date, run \`npm run index\``)
    stale++
  } else {
    writeFileSync(abs, next)
    console.log(`updated ${file}`)
  }
}

if (check && stale === 0) console.log(`\x1b[32m✓\x1b[0m index: up to date (${skills.length} skills)`)
process.exit(stale === 0 ? 0 : 1)
