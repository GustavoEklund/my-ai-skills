export type Level = 'error' | 'warn'

export type Finding = {
  level: Level
  where: string
  message: string
}

export function createReport(): {
  error: (where: string, message: string) => void
  warn: (where: string, message: string) => void
  findings: Finding[]
} {
  const findings: Finding[] = []
  return {
    error: (where, message) => void findings.push({ level: 'error', where, message }),
    warn: (where, message) => void findings.push({ level: 'warn', where, message }),
    findings,
  }
}

export function print(findings: Finding[], label: string): number {
  const errors = findings.filter((f) => f.level === 'error')
  const warnings = findings.filter((f) => f.level === 'warn')

  for (const finding of findings) {
    const tag = finding.level === 'error' ? '\x1b[31merror\x1b[0m' : '\x1b[33mwarn \x1b[0m'
    console.log(`${tag} ${finding.where}\n      ${finding.message}`)
  }

  if (findings.length > 0) console.log('')
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`\x1b[32m✓\x1b[0m ${label}: clean`)
  } else {
    console.log(`${label}: ${errors.length} error(s), ${warnings.length} warning(s)`)
  }
  return errors.length === 0 ? 0 : 1
}
