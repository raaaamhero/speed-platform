import { COUNTED_SPORT_SLUGS, EXEMPT_SPORT_SLUGS, MAX_COUNTED_SPORTS, type SportSlug } from './sports'

export type CapCheck =
  | { ok: true; counted: number; slotsLeft: number; exempt: number }
  | { ok: false; counted: number; slotsLeft: number; exempt: number; reason: string }

const COUNTED = new Set<string>(COUNTED_SPORT_SLUGS)
const EXEMPT = new Set<string>(EXEMPT_SPORT_SLUGS)

export function splitSports(selected: readonly string[]) {
  const unique = [...new Set(selected)]
  const counted = unique.filter((s) => COUNTED.has(s))
  const exempt = unique.filter((s) => EXEMPT.has(s))
  const unknown = unique.filter((s) => !COUNTED.has(s) && !EXEMPT.has(s))
  return { unique, counted, exempt, unknown }
}

/** Server-side and client-side mirror of the registration 3-sport cap. */
export function checkSportCap(selected: readonly string[]): CapCheck {
  const { counted, exempt, unknown } = splitSports(selected)

  if (unknown.length > 0) {
    return {
      ok: false,
      counted: counted.length,
      slotsLeft: Math.max(0, MAX_COUNTED_SPORTS - counted.length),
      exempt: exempt.length,
      reason: `Unknown sport(s): ${unknown.join(', ')}.`,
    }
  }

  if (counted.length > MAX_COUNTED_SPORTS) {
    return {
      ok: false,
      counted: counted.length,
      slotsLeft: 0,
      exempt: exempt.length,
      reason: `You can choose at most ${MAX_COUNTED_SPORTS} counted sports. Athletics and Swimming do not count toward this limit.`,
    }
  }

  return {
    ok: true,
    counted: counted.length,
    slotsLeft: MAX_COUNTED_SPORTS - counted.length,
    exempt: exempt.length,
  }
}

export function isCountedSport(slug: SportSlug | string): boolean {
  return COUNTED.has(slug)
}
