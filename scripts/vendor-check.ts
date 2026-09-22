/**
 * Compares each vendored skill's `metadata.upstream-version` against the
 * latest release its upstream publishes.
 *
 * Advisory, and deliberately outside CI: it needs the network, and an upstream
 * release is news to act on, not a build to break. Run it when you want to know
 * whether a vendored skill has fallen behind.
 */
import { loadSkills } from './lib/repo.ts'

const GITHUB_REPO = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/

async function latestRelease(owner: string, repo: string): Promise<string | undefined> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers })
  if (!response.ok) return undefined
  const release = (await response.json()) as { tag_name?: string }
  return release.tag_name?.replace(/^v/, '')
}

const vendored = loadSkills().filter((s) => s.upstream !== undefined)
if (vendored.length === 0) {
  console.log('no vendored skills')
  process.exit(0)
}

let behind = 0
for (const skill of vendored) {
  const match = GITHUB_REPO.exec(skill.upstream!)
  if (!match) {
    console.log(`\x1b[33m?\x1b[0m ${skill.name}: upstream ${skill.upstream} is not a GitHub repository, check it by hand`)
    continue
  }

  const latest = await latestRelease(match[1]!, match[2]!)
  if (latest === undefined) {
    console.log(`\x1b[33m?\x1b[0m ${skill.name}: could not read the latest release of ${match[1]}/${match[2]}`)
    continue
  }

  if (latest === skill.upstreamVersion) {
    console.log(`\x1b[32m✓\x1b[0m ${skill.name}: ${skill.upstreamVersion}, current`)
  } else {
    behind++
    console.log(`\x1b[33m→\x1b[0m ${skill.name}: vendored ${skill.upstreamVersion}, upstream is at ${latest}`)
    console.log(`  ${skill.upstream}/compare/v${skill.upstreamVersion}...v${latest}`)
  }
}

if (behind > 0) console.log(`\n${behind} vendored skill(s) behind upstream. Re-vendor, then update metadata.upstream-version.`)
