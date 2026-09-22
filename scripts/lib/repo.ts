import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Buckets that ship in the plugin and appear in README.md. */
export const PROMOTED_BUCKETS = ['engineering', 'productivity'] as const
/** Buckets that exist but are not shipped. */
export const INTERNAL_BUCKETS = ['meta'] as const
export const BUCKETS = [...PROMOTED_BUCKETS, ...INTERNAL_BUCKETS] as const

export type Invocation = 'model + user' | 'user only' | 'model only'

export type Skill = {
  /** Repo-relative path to the SKILL.md. */
  file: string
  /** Repo-relative path to the skill directory. */
  dir: string
  bucket: string
  /** Directory basename, which must equal frontmatter `name`. */
  dirName: string
  frontmatter: Record<string, unknown>
  metadata: Record<string, unknown>
  body: string
  name: string
  description: string
  delegatesTo: string | undefined
  boundary: string | undefined
  /** Set when the skill's text came from another repository, so drift can be tracked. */
  upstream: string | undefined
  upstreamVersion: string | undefined
  isAlias: boolean
  isPromoted: boolean
  invocation: Invocation
}

export function readJson(relPath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, relPath), 'utf8'))
}

export function readText(relPath: string): string {
  return readFileSync(join(ROOT, relPath), 'utf8')
}

/** Every SKILL.md under the repo, wherever it sits. Depth is validated by the lint, not here. */
export function findSkillFiles(): string[] {
  const found: string[] = []
  const walk = (abs: string): void => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const child = join(abs, entry.name)
      // Do not follow symlinks: .claude/skills points back into skills/.
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) walk(child)
      else if (entry.name === 'SKILL.md') found.push(relative(ROOT, child))
    }
  }
  walk(ROOT)
  return found.sort()
}

function invocationOf(fm: Record<string, unknown>): Invocation {
  if (fm['disable-model-invocation'] === true) return 'user only'
  if (fm['user-invocable'] === false) return 'model only'
  return 'model + user'
}

export function loadSkill(file: string): Skill {
  const parsed = matter(readFileSync(join(ROOT, file), 'utf8'))
  const fm = (parsed.data ?? {}) as Record<string, unknown>
  const metadata = (fm.metadata ?? {}) as Record<string, unknown>
  const dir = dirname(file)
  const segments = dir.split('/')
  const delegatesTo = metadata['delegates-to']

  return {
    file,
    dir,
    bucket: segments.length >= 2 ? segments[1]! : '',
    dirName: segments[segments.length - 1]!,
    frontmatter: fm,
    metadata,
    body: parsed.content,
    name: typeof fm.name === 'string' ? fm.name : '',
    description: typeof fm.description === 'string' ? fm.description : '',
    delegatesTo: typeof delegatesTo === 'string' ? delegatesTo : undefined,
    boundary: typeof metadata.boundary === 'string' ? metadata.boundary : undefined,
    upstream: typeof metadata.upstream === 'string' ? metadata.upstream : undefined,
    upstreamVersion: metadata['upstream-version'] === undefined ? undefined : String(metadata['upstream-version']),
    isAlias: typeof delegatesTo === 'string',
    isPromoted: (PROMOTED_BUCKETS as readonly string[]).includes(segments[1] ?? ''),
    invocation: invocationOf(fm),
  }
}

/** Skills sitting at the canonical `skills/<bucket>/<name>/SKILL.md` depth, sorted by name. */
export function loadSkills(): Skill[] {
  return findSkillFiles()
    .filter((f) => f.split('/').length === 4 && f.startsWith('skills/'))
    .map(loadSkill)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function exists(relPath: string): boolean {
  try {
    statSync(join(ROOT, relPath))
    return true
  } catch {
    return false
  }
}
