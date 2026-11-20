/** Sport-specific metrics shapes stored in speed_match_results.metrics JSONB.
 *  Do not invent match rules — only capture what SportsCom enters.
 */

export type ScoreSchemaKey =
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'badminton'
  | 'table-tennis'
  | 'throwball'
  | 'generic'

export function scoreSchemaForSport(sportSlug: string, competitionSlug?: string): ScoreSchemaKey {
  if (sportSlug === 'cricket') return 'cricket'
  if (sportSlug === 'football') return 'football'
  if (sportSlug === 'basketball' || competitionSlug?.startsWith('basketball')) return 'basketball'
  if (sportSlug === 'volleyball') return 'volleyball'
  if (sportSlug === 'badminton') return 'badminton'
  if (sportSlug === 'table-tennis') return 'table-tennis'
  if (sportSlug === 'throwball') return 'throwball'
  return 'generic'
}

export type CricketMetrics = {
  schema: 'cricket'
  team_a?: { runs?: number; wickets?: number; overs?: string }
  team_b?: { runs?: number; wickets?: number; overs?: string }
  margin?: string
}

export type FootballMetrics = {
  schema: 'football'
  team_a_goals?: number
  team_b_goals?: number
}

export type BasketballMetrics = {
  schema: 'basketball'
  team_a_points?: number
  team_b_points?: number
  periods?: number[]
}

export type SetsMetrics = {
  schema: 'volleyball' | 'badminton' | 'table-tennis' | 'throwball'
  sets?: { a: number; b: number }[]
  sets_won_a?: number
  sets_won_b?: number
}

export function buildMatchSummary(input: {
  competitionName: string
  teamA: string
  teamB: string
  isDraw: boolean
  winnerName?: string | null
  scoreA?: number | null
  scoreB?: number | null
  metrics?: Record<string, unknown> | null
}): string {
  const { competitionName, teamA, teamB, isDraw, winnerName, scoreA, scoreB, metrics } = input
  const schema = metrics?.schema

  if (isDraw) {
    const score =
      scoreA != null && scoreB != null ? ` · ${scoreA}-${scoreB}` : ''
    return `${competitionName.toUpperCase()} · ${teamA} drew with ${teamB}${score}`
  }

  if (schema === 'cricket') {
    const a = metrics?.team_a as CricketMetrics['team_a']
    const b = metrics?.team_b as CricketMetrics['team_b']
    if (a?.runs != null && b?.runs != null) {
      const aw = a.wickets != null ? `/${a.wickets}` : ''
      const bw = b.wickets != null ? `/${b.wickets}` : ''
      return `${competitionName.toUpperCase()} · ${winnerName} defeated ${
        winnerName === teamA ? teamB : teamA
      } · ${a.runs}${aw} vs ${b.runs}${bw}`
    }
  }

  if (scoreA != null && scoreB != null) {
    return `${competitionName.toUpperCase()} · ${winnerName} defeated ${
      winnerName === teamA ? teamB : teamA
    } · ${scoreA}-${scoreB}`
  }

  return `${competitionName.toUpperCase()} · ${winnerName} defeated ${
    winnerName === teamA ? teamB : teamA
  }`
}
