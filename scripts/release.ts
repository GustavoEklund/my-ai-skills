import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/repo.ts'

const REPO_SLUG = 'GustavoEklund/my-ai-skills'
const BUMPS = ['major', 'minor', 'patch'] as const
type Bump = (typeof BUMPS)[number]

const bump = process.argv[2] as Bump | undefined
if (!bump || !BUMPS.includes(bump)) {
  console.error('usage: npm run release -- <major|minor|patch>')
  process.exit(1)
}

const run = (cmd: string, args: string[]): string =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim()

if (run('git', ['status', '--porcelain']) !== '') {
  console.error('working tree is dirty: commit or stash before releasing')
  process.exit(1)
}

const pkgPath = join(ROOT, 'package.json')
const pluginPath = join(ROOT, '.claude-plugin/plugin.json')
const changelogPath = join(ROOT, 'CHANGELOG.md')

const pkgRaw = readFileSync(pkgPath, 'utf8')
const pkg = JSON.parse(pkgRaw) as { version: string }
const [major, minor, patch] = pkg.version.split('.').map(Number) as [number, number, number]
const next =
  bump === 'major' ? `${major + 1}.0.0` : bump === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`

const changelog = readFileSync(changelogPath, 'utf8')
const unreleased = /^## \[Unreleased\]\n([\s\S]*?)(?=^## \[|^\[unreleased\]:)/m.exec(changelog)
if (!unreleased) {
  console.error('CHANGELOG.md has no `## [Unreleased]` section')
  process.exit(1)
}
const notes = unreleased[1]!.trim()
if (notes === '') {
  console.error('`## [Unreleased]` is empty: there is nothing to release')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)
const previous = /^## \[(\d+\.\d+\.\d+)\]/m.exec(changelog)?.[1]

// Fresh `[Unreleased]`, the notes moved under a dated heading, and the link
// refs at the bottom rewritten so the compare URLs stay honest.
let updated = changelog.replace(
  unreleased[0],
  `## [Unreleased]\n\n## [${next}] - ${today}\n\n${notes}\n\n`,
)
updated = updated.replace(/^\[unreleased\]: .*$/m, `[unreleased]: https://github.com/${REPO_SLUG}/compare/v${next}...HEAD`)
const newRef = previous
  ? `[${next}]: https://github.com/${REPO_SLUG}/compare/v${previous}...v${next}`
  : `[${next}]: https://github.com/${REPO_SLUG}/releases/tag/v${next}`
updated = updated.replace(/^(\[unreleased\]: .*)$/m, `$1\n${newRef}`)

writeFileSync(changelogPath, updated)
writeFileSync(pkgPath, pkgRaw.replace(`"version": "${pkg.version}"`, `"version": "${next}"`))
const pluginRaw = readFileSync(pluginPath, 'utf8')
writeFileSync(pluginPath, pluginRaw.replace(`"version": "${pkg.version}"`, `"version": "${next}"`))

// Validate after the bump, so a release can never ship an inconsistent repo.
run('npm', ['run', 'check'])

run('git', ['add', 'package.json', '.claude-plugin/plugin.json', 'CHANGELOG.md'])
run('git', ['commit', '-m', `chore(release): v${next}`])
run('git', ['tag', '-a', `v${next}`, '-m', `v${next}`])

console.log(`released v${next}`)
console.log(`push with: git push origin main --follow-tags`)
