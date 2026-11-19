/** Rulebook points + jackpot. Stored separately as base / adjustment / final in the ledger. */

export type Place = 1 | 2 | 3 | 4

export const TEAM_SPORT_POINTS: Record<Place, number> = {
  1: 1000,
  2: 750,
  3: 500,
  4: 250,
}

export const ATHLETICS_SWIMMING_SINGLE: Record<Place, number> = {
  1: 250,
  2: 200,
  3: 150,
  4: 100,
}

export const ATHLETICS_SWIMMING_RELAY: Record<Place, number> = {
  1: 500,
  2: 400,
  3: 300,
  4: 200,
}

export type EventCategory = 'team_sport' | 'athletics_swimming_single' | 'athletics_swimming_relay'

export function basePoints(category: EventCategory, place: number): number {
  if (place < 1 || place > 4) return 0
  const p = place as Place
  if (category === 'team_sport') return TEAM_SPORT_POINTS[p]
  if (category === 'athletics_swimming_single') return ATHLETICS_SWIMMING_SINGLE[p]
  return ATHLETICS_SWIMMING_RELAY[p]
}

export interface JackpotResult {
  base: number
  adjustment: number
  final: number
  note: string
}

/**
 * Jackpot applies only to team sports (not Athletics/Swimming).
 * 1st → ×2, 2nd–4th → ×0.5, below 4th → −500 (no base).
 */
export function applyJackpot(base: number, place: number, jackpotActive: boolean): JackpotResult {
  if (!jackpotActive) {
    return { base, adjustment: 0, final: base, note: 'No jackpot' }
  }

  if (place === 1) {
    const final = base * 2
    return { base, adjustment: final - base, final, note: 'Jackpot win — doubled' }
  }

  if (place >= 2 && place <= 4) {
    const final = base / 2
    return { base, adjustment: final - base, final, note: 'Jackpot — halved' }
  }

  // Below 4th
  return { base: 0, adjustment: -500, final: -500, note: 'Jackpot miss — 500 deducted' }
}

export function jackpotAllowedForCategory(category: EventCategory): boolean {
  return category === 'team_sport'
}
