/** Rulebook-derived sport catalogue. Counts toward the 3-sport cap unless exempt. */

export type SportSlug =
  | 'basketball'
  | 'badminton'
  | 'cricket'
  | 'football'
  | 'throwball'
  | 'volleyball'
  | 'table-tennis'
  | 'athletics-relays'
  | 'swimming-relays'

export interface SportDef {
  slug: SportSlug
  name: string
  countsTowardCap: boolean
  maxSquad: number
  playing: number
  substitutes: number
  /** Min players from each section in squad (Teams 1–10). Null = N/A */
  minSectionSquad: number | null
  /** Min on field from each section. Null = N/A */
  minSectionField: number | null
  /** Special gender rule for badminton / TT */
  requiresBoyAndGirlInSquad?: boolean
}

export const SPORTS: SportDef[] = [
  {
    slug: 'basketball',
    name: 'Basketball',
    countsTowardCap: true,
    maxSquad: 10,
    playing: 5,
    substitutes: 5,
    minSectionSquad: 3,
    minSectionField: 1,
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    countsTowardCap: true,
    maxSquad: 8,
    playing: 8,
    substitutes: 0,
    minSectionSquad: null,
    minSectionField: null,
    requiresBoyAndGirlInSquad: true,
  },
  {
    slug: 'cricket',
    name: 'Cricket',
    countsTowardCap: true,
    maxSquad: 15,
    playing: 11,
    substitutes: 4,
    minSectionSquad: 4,
    minSectionField: 3,
  },
  {
    slug: 'football',
    name: 'Football',
    countsTowardCap: true,
    maxSquad: 15,
    playing: 11,
    substitutes: 4,
    minSectionSquad: 4,
    minSectionField: 3,
  },
  {
    slug: 'throwball',
    name: 'Throwball',
    countsTowardCap: true,
    maxSquad: 11,
    playing: 7,
    substitutes: 4,
    minSectionSquad: 3,
    minSectionField: 2,
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    countsTowardCap: true,
    maxSquad: 10,
    playing: 6,
    substitutes: 4,
    minSectionSquad: 4,
    minSectionField: 2,
  },
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    countsTowardCap: true,
    maxSquad: 8,
    playing: 8,
    substitutes: 0,
    minSectionSquad: null,
    minSectionField: null,
    requiresBoyAndGirlInSquad: true,
  },
  {
    slug: 'athletics-relays',
    name: 'Athletics Relays',
    countsTowardCap: false,
    maxSquad: 4,
    playing: 4,
    substitutes: 0,
    minSectionSquad: 2,
    minSectionField: 2,
  },
  {
    slug: 'swimming-relays',
    name: 'Swimming Relays',
    countsTowardCap: false,
    maxSquad: 4,
    playing: 4,
    substitutes: 0,
    minSectionSquad: 2,
    minSectionField: 2,
  },
]

export const COUNTED_SPORT_SLUGS = SPORTS.filter((s) => s.countsTowardCap).map((s) => s.slug)
export const EXEMPT_SPORT_SLUGS = SPORTS.filter((s) => !s.countsTowardCap).map((s) => s.slug)
export const MAX_COUNTED_SPORTS = 3
