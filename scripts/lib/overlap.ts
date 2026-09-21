/**
 * Cheap, deterministic redundancy signal: two skills whose descriptions read
 * alike probably fire in the same situation. It cannot judge conceptual
 * overlap, which is what `authoring-skills` is for. It only makes the obvious
 * case impossible to merge by accident.
 */

/** Jaccard on character trigrams tolerates word order and inflection, which token sets do not. */
const TRIGRAM = 3

/** Below this, two descriptions share only the vocabulary any two skills share. */
export const WARN_AT = 0.35
/** Above this, a stated boundary is required before the pair can land. */
export const ERROR_AT = 0.5

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function trigrams(text: string): Set<string> {
  const normalized = normalize(text)
  const out = new Set<string>()
  for (let i = 0; i + TRIGRAM <= normalized.length; i++) {
    out.add(normalized.slice(i, i + TRIGRAM))
  }
  return out
}

export function similarity(a: string, b: string): number {
  const left = trigrams(a)
  const right = trigrams(b)
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const gram of left) if (right.has(gram)) shared++
  return shared / (left.size + right.size - shared)
}
