/** Official SPEED 2026–27 group draws + SF pairings (master brief). Resolved by team name. */

export type GroupCode = 'A' | 'B' | 'C' | 'D'

export type CompetitionSeed = {
  slug: string
  sportSlug: string
  name: string
  category: 'open' | 'men' | 'women' | null
  formatStatus: 'active' | 'pending'
  groups: Record<GroupCode, string[]>
  /** SF1 / SF2 as [homeGroup, awayGroup] — Part 6 purple cells */
  semiFinals: [[GroupCode, GroupCode], [GroupCode, GroupCode]]
}

export const PENDING_COMPETITIONS: CompetitionSeed[] = [
  {
    slug: 'athletics',
    sportSlug: 'athletics-relays',
    name: 'Athletics',
    category: null,
    formatStatus: 'pending',
    groups: { A: [], B: [], C: [], D: [] },
    semiFinals: [
      ['A', 'C'],
      ['B', 'D'],
    ],
  },
  {
    slug: 'swimming',
    sportSlug: 'swimming-relays',
    name: 'Swimming',
    category: null,
    formatStatus: 'pending',
    groups: { A: [], B: [], C: [], D: [] },
    semiFinals: [
      ['A', 'C'],
      ['B', 'D'],
    ],
  },
]

export const ACTIVE_COMPETITIONS: CompetitionSeed[] = [
  {
    slug: 'cricket',
    sportSlug: 'cricket',
    name: 'Cricket',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['Buzzballers', 'ROI Rebels', '34 Carat'],
      B: ['The Dark Triads', 'IPM', 'Kootlers International'],
      C: ['Maestros', 'Jagerbomb', 'Macallan 12'],
      D: ['Heisenberg', 'Joint Bros', 'Magnum Brewtalists'],
    },
    semiFinals: [
      ['A', 'C'],
      ['B', 'D'],
    ],
  },
  {
    slug: 'football',
    sportSlug: 'football',
    name: 'Football',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['Maestros', 'IPM', 'Buzzballers'],
      B: ['Heisenberg', 'Jagerbomb', 'Magnum Brewtalists'],
      C: ['34 Carat', 'The Dark Triads', 'Joint Bros'],
      D: ['Kootlers International', 'ROI Rebels', 'Macallan 12'],
    },
    semiFinals: [
      ['A', 'C'],
      ['B', 'D'],
    ],
  },
  {
    slug: 'badminton',
    sportSlug: 'badminton',
    name: 'Badminton',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['IPM', 'Jagerbomb', 'ROI Rebels'],
      B: ['Kootlers International', 'Heisenberg', 'Macallan 12'],
      C: ['Joint Bros', 'The Dark Triads', 'Maestros'],
      D: ['Buzzballers', '34 Carat', 'Magnum Brewtalists'],
    },
    semiFinals: [
      ['B', 'C'],
      ['A', 'D'],
    ],
  },
  {
    slug: 'table-tennis',
    sportSlug: 'table-tennis',
    name: 'Table Tennis',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['Kootlers International', 'Magnum Brewtalists', 'Heisenberg'],
      B: ['The Dark Triads', 'Macallan 12', 'Jagerbomb'],
      C: ['34 Carat', 'IPM', 'Maestros'],
      D: ['ROI Rebels', 'Joint Bros', 'Buzzballers'],
    },
    semiFinals: [
      ['B', 'C'],
      ['A', 'D'],
    ],
  },
  {
    slug: 'basketball-men',
    sportSlug: 'basketball',
    name: 'Basketball Men',
    category: 'men',
    formatStatus: 'active',
    groups: {
      A: ['Maestros', 'Joint Bros', 'Macallan 12'],
      B: ['Magnum Brewtalists', 'Heisenberg', 'The Dark Triads'],
      C: ['ROI Rebels', 'Jagerbomb', '34 Carat'],
      D: ['IPM', 'Buzzballers', 'Kootlers International'],
    },
    semiFinals: [
      ['B', 'D'],
      ['A', 'C'],
    ],
  },
  {
    slug: 'basketball-women',
    sportSlug: 'basketball',
    name: 'Basketball Women',
    category: 'women',
    formatStatus: 'active',
    groups: {
      A: ['Magnum Brewtalists', 'IPM', 'Buzzballers'],
      B: ['Heisenberg', 'Joint Bros', 'The Dark Triads'],
      C: ['Macallan 12', 'Maestros', 'Kootlers International'],
      D: ['Jagerbomb', 'ROI Rebels', '34 Carat'],
    },
    semiFinals: [
      ['B', 'C'],
      ['A', 'D'],
    ],
  },
  {
    slug: 'volleyball',
    sportSlug: 'volleyball',
    name: 'Volleyball',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['IPM', 'Joint Bros', 'Maestros'],
      B: ['34 Carat', 'Jagerbomb', 'Macallan 12'],
      C: ['Heisenberg', 'Magnum Brewtalists', 'The Dark Triads'],
      D: ['Buzzballers', 'ROI Rebels', 'Kootlers International'],
    },
    semiFinals: [
      ['B', 'D'],
      ['A', 'C'],
    ],
  },
  {
    slug: 'throwball',
    sportSlug: 'throwball',
    name: 'Throwball',
    category: 'open',
    formatStatus: 'active',
    groups: {
      A: ['Maestros', 'Magnum Brewtalists', 'Kootlers International'],
      B: ['Buzzballers', 'IPM', 'ROI Rebels'],
      C: ['Jagerbomb', '34 Carat', 'Macallan 12'],
      D: ['Joint Bros', 'Heisenberg', 'The Dark Triads'],
    },
    semiFinals: [
      ['B', 'A'],
      ['D', 'C'],
    ],
  },
]

export const ALL_COMPETITION_SEEDS = [...ACTIVE_COMPETITIONS, ...PENDING_COMPETITIONS]

/** Validate: 12 unique teams, 3 per group, 4 groups */
export function validateCompetitionDraw(c: CompetitionSeed): string[] {
  const errors: string[] = []
  if (c.formatStatus !== 'active') return errors
  const all: string[] = []
  for (const g of ['A', 'B', 'C', 'D'] as GroupCode[]) {
    const teams = c.groups[g]
    if (teams.length !== 3) errors.push(`${c.slug} Group ${g}: expected 3 teams, got ${teams.length}`)
    all.push(...teams)
  }
  if (all.length !== 12) errors.push(`${c.slug}: expected 12 team slots, got ${all.length}`)
  const uniq = new Set(all)
  if (uniq.size !== 12) errors.push(`${c.slug}: duplicate or missing teams (${uniq.size} unique)`)
  return errors
}

export function roundRobinPairs(teamCodes: [string, string, string]): [string, string][] {
  const [a, b, c] = teamCodes
  return [
    [a, b],
    [b, c],
    [c, a],
  ]
}

export function generationKey(
  competitionSlug: string,
  stage: string,
  groupOrSlot: string,
  codeA: string,
  codeB: string,
): string {
  const [x, y] = [codeA, codeB].sort()
  return `${competitionSlug}|${stage}|${groupOrSlot}|${x}|${y}`
}
