import { readFileSync } from 'node:fs'
import { join, normalize as normalizePath } from 'node:path'
import { z } from 'zod'
import {
  BUCKETS,
  PROMOTED_BUCKETS,
  ROOT,
  exists,
  findSkillFiles,
  loadSkills,
  readJson,
  readText,
  type Skill,
} from './lib/repo.ts'
import { ERROR_AT, WARN_AT, similarity } from './lib/overlap.ts'
import { createReport, print } from './lib/report.ts'

/** Fields Claude Code actually reads. Anything else in frontmatter is a typo. */
const CLAUDE_CODE_FIELDS = [
  'name', 'description', 'when_to_use', 'argument-hint', 'arguments',
  'disable-model-invocation', 'user-invocable', 'allowed-tools', 'disallowed-tools',
  'model', 'effort', 'context', 'agent', 'background', 'hooks', 'paths', 'shell',
  'metadata', 'license', 'compatibility',
] as const

const MAX_NAME = 64
const MAX_DESCRIPTION = 1024
const MAX_BODY_LINES = 500
/** A body this short carries no instructions, so it is an entry point or a mistake. */
const ALIAS_BODY_LINES = 5

const metadataSchema = z.strictObject({
  'delegates-to': z.string().optional(),
  boundary: z.string().optional(),
  source: z.string().optional(),
})

const frontmatterSchema = z
  .looseObject({
    name: z.string(),
    description: z.string(),
    metadata: metadataSchema.optional(),
  })
  .superRefine((value, ctx) => {
    for (const key of Object.keys(value)) {
      if (!(CLAUDE_CODE_FIELDS as readonly string[]).includes(key)) {
        ctx.addIssue({ code: 'custom', message: `unknown frontmatter field \`${key}\`` })
      }
    }
  })

const report = createReport()
const { error, warn } = report

// --- structure -------------------------------------------------------------

for (const file of findSkillFiles()) {
  const segments = file.split('/')
  if (segments[0] !== 'skills' || segments.length !== 4) {
    error(file, 'SKILL.md must live at skills/<bucket>/<skill-name>/SKILL.md')
  }
}

const skills = loadSkills()
if (skills.length === 0) error('skills/', 'no skills found')

for (const skill of skills) {
  if (!(BUCKETS as readonly string[]).includes(skill.bucket)) {
    error(skill.file, `unknown bucket \`${skill.bucket}\`, expected one of ${BUCKETS.join(', ')}`)
  }
}

// --- frontmatter -----------------------------------------------------------

for (const skill of skills) {
  const parsed = frontmatterSchema.safeParse(skill.frontmatter)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      error(skill.file, `${path}${issue.message}`)
    }
    continue
  }

  const { name, description } = skill

  if (name.length > MAX_NAME) error(skill.file, `name is ${name.length} chars, max ${MAX_NAME}`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    error(skill.file, `name \`${name}\` must be lowercase letters, digits and single hyphens`)
  }
  if (/claude|anthropic/i.test(name)) {
    error(skill.file, `name \`${name}\` contains a reserved word (claude, anthropic)`)
  }
  if (name !== skill.dirName) {
    error(skill.file, `name \`${name}\` does not match directory \`${skill.dirName}\``)
  }

  if (description.trim() === '') error(skill.file, 'description is empty')
  if (description.length > MAX_DESCRIPTION) {
    error(skill.file, `description is ${description.length} chars, max ${MAX_DESCRIPTION}`)
  }
  if (/^\s*(I|We|You)\b/.test(description) || /\bI can help\b/i.test(description)) {
    error(skill.file, 'description must be third person ("Processes X", not "I can help you process X")')
  }
  // Aliases are never matched by the model, so their description is only the
  // label in the `/` menu and needs no trigger clause.
  if (!skill.isAlias && !/\buse (when|for|after|before|while)\b|\bwhen the user\b/i.test(description)) {
    warn(skill.file, 'description has no "when to use" clause, which is what Claude matches against')
  }
}

const byName = new Map<string, Skill[]>()
for (const skill of skills) {
  byName.set(skill.name, [...(byName.get(skill.name) ?? []), skill])
}
for (const [name, group] of byName) {
  if (group.length > 1) {
    error('skills/', `name \`${name}\` is used by ${group.map((s) => s.dir).join(' and ')}`)
  }
}

// --- alias rules -----------------------------------------------------------

const bodyLines = (skill: Skill): number => skill.body.split('\n').filter((l) => l.trim() !== '').length

for (const skill of skills) {
  const lines = bodyLines(skill)

  if (skill.isAlias) {
    if (lines > ALIAS_BODY_LINES) {
      error(skill.file, `alias body is ${lines} lines, max ${ALIAS_BODY_LINES}: instructions belong in \`${skill.delegatesTo}\``)
    }
    if (skill.frontmatter['disable-model-invocation'] !== true) {
      error(skill.file, 'alias must set `disable-model-invocation: true`, otherwise the model sees two doors to one room')
    }
    const target = byName.get(skill.delegatesTo!)?.[0]
    if (!target) error(skill.file, `delegates-to \`${skill.delegatesTo}\` is not a skill in this repository`)
    else if (target.isAlias) error(skill.file, `delegates-to \`${skill.delegatesTo}\` is itself an alias: point at the content skill`)
    if (!new RegExp(`["'\`]${skill.delegatesTo}["'\`]`).test(skill.body)) {
      warn(skill.file, `body does not mention \`${skill.delegatesTo}\`, so the delegation may be stale`)
    }
  } else if (lines <= ALIAS_BODY_LINES) {
    warn(skill.file, `body is ${lines} lines with no \`metadata.delegates-to\`: if this is an entry point, declare it`)
  }

  const total = skill.body.split('\n').length
  if (total > MAX_BODY_LINES) error(skill.file, `body is ${total} lines, max ${MAX_BODY_LINES}: split it into reference files`)
}

// --- links and reference depth --------------------------------------------

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g

function localLinks(markdown: string): string[] {
  return [...markdown.matchAll(LINK)]
    .map((m) => m[1]!)
    .filter((t) => !/^(https?:|mailto:|#)/.test(t))
    .map((t) => t.split('#')[0]!)
    .filter((t) => t !== '')
}

for (const skill of skills) {
  for (const target of localLinks(skill.body)) {
    if (target.includes('\\')) {
      error(skill.file, `link \`${target}\` uses backslashes: always forward slashes`)
      continue
    }
    const resolved = normalizePath(join(skill.dir, target))
    if (!exists(resolved)) {
      error(skill.file, `link \`${target}\` resolves to ${resolved}, which does not exist`)
      continue
    }
    // Only bundled files are subject to the one-level rule. Links out to repo
    // docs are navigation, not progressive disclosure.
    if (!resolved.startsWith(`${skill.dir}/`) || !resolved.endsWith('.md')) continue
    for (const nested of localLinks(readFileSync(join(ROOT, resolved), 'utf8'))) {
      const nestedResolved = normalizePath(join(skill.dir, target, '..', nested))
      if (nestedResolved.startsWith(`${skill.dir}/`) && nestedResolved.endsWith('.md')) {
        error(resolved, `references \`${nested}\`, but bundled files must be one level deep from SKILL.md`)
      }
    }
  }
}

// --- overlap ---------------------------------------------------------------

const content = skills.filter((s) => !s.isAlias)
for (let i = 0; i < content.length; i++) {
  for (let j = i + 1; j < content.length; j++) {
    const a = content[i]!
    const b = content[j]!
    const score = similarity(a.description, b.description)
    if (score < WARN_AT) continue

    const declared = (s: Skill, other: Skill): boolean => (s.boundary ?? '').includes(other.name)
    if (declared(a, b) && declared(b, a)) continue

    const detail = `descriptions are ${(score * 100).toFixed(0)}% alike: extend one, or declare \`metadata.boundary\` on both naming the other`
    if (score >= ERROR_AT) error(`${a.name} ~ ${b.name}`, detail)
    else warn(`${a.name} ~ ${b.name}`, detail)
  }
}

// --- plugin manifest -------------------------------------------------------

const pkg = readJson('package.json')
const plugin = readJson('.claude-plugin/plugin.json')

if (plugin.version !== pkg.version) {
  error('.claude-plugin/plugin.json', `version ${String(plugin.version)} does not match package.json ${String(pkg.version)}`)
}

const shipped = new Set((plugin.skills as string[] | undefined) ?? [])
for (const skill of skills) {
  const entry = `./${skill.dir}`
  if (skill.isPromoted && !shipped.has(entry)) {
    error('.claude-plugin/plugin.json', `promoted skill \`${skill.name}\` is missing from the skills array (${entry})`)
  }
  if (!skill.isPromoted && shipped.has(entry)) {
    error('.claude-plugin/plugin.json', `\`${skill.name}\` is in bucket \`${skill.bucket}\`, which does not ship`)
  }
  shipped.delete(entry)
}
for (const orphan of shipped) {
  error('.claude-plugin/plugin.json', `skills array lists \`${orphan}\`, which is not a skill in this repository`)
}

// --- changelog -------------------------------------------------------------

const changelog = readText('CHANGELOG.md')
if (!/^## \[Unreleased\]/m.test(changelog)) {
  error('CHANGELOG.md', 'missing `## [Unreleased]` section')
}

const released = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]!)
if (released.length === 0) {
  if (pkg.version !== '0.0.0') {
    error('CHANGELOG.md', `no released version yet, so package.json version should be 0.0.0, not ${String(pkg.version)}`)
  }
} else if (released[0] !== pkg.version) {
  error('CHANGELOG.md', `newest released version ${released[0]} does not match package.json ${String(pkg.version)}`)
}

const KNOWN_SECTIONS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']
for (const [, heading] of changelog.matchAll(/^### (.+)$/gm)) {
  if (!KNOWN_SECTIONS.includes(heading!.trim())) {
    error('CHANGELOG.md', `\`### ${heading!.trim()}\` is not a Keep a Changelog section (${KNOWN_SECTIONS.join(', ')})`)
  }
}

// --- promoted skills appear in README -------------------------------------

const readme = readText('README.md')
for (const skill of skills.filter((s) => s.isPromoted)) {
  if (!readme.includes(`${skill.dir}/SKILL.md`)) {
    error('README.md', `promoted skill \`${skill.name}\` is not linked: run \`npm run index\``)
  }
}

process.exit(print(report.findings, `lint (${skills.length} skills, buckets: ${PROMOTED_BUCKETS.join(', ')} promoted)`))
