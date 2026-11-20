export type MatchRow = {
  team_a_id: string
  team_b_id: string
  winner_team_id: string | null
  is_draw: boolean
  approval_status: string
}

export type TeamStanding = {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number | null
  pointsConfigured: boolean
}

export function computeGroupStandings(
  teamIds: string[],
  matches: MatchRow[],
  pts: { win: number | null; draw: number | null; loss: number | null },
): TeamStanding[] {
  const configured = pts.win != null && pts.draw != null && pts.loss != null
  const map = new Map<string, TeamStanding>()
  for (const id of teamIds) {
    map.set(id, {
      teamId: id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: configured ? 0 : null,
      pointsConfigured: configured,
    })
  }

  for (const m of matches) {
    if (m.approval_status !== 'approved') continue
    const a = map.get(m.team_a_id)
    const b = map.get(m.team_b_id)
    if (!a || !b) continue
    a.played += 1
    b.played += 1
    if (m.is_draw) {
      a.drawn += 1
      b.drawn += 1
      if (configured) {
        a.points = (a.points || 0) + (pts.draw as number)
        b.points = (b.points || 0) + (pts.draw as number)
      }
    } else if (m.winner_team_id === m.team_a_id) {
      a.won += 1
      b.lost += 1
      if (configured) {
        a.points = (a.points || 0) + (pts.win as number)
        b.points = (b.points || 0) + (pts.loss as number)
      }
    } else if (m.winner_team_id === m.team_b_id) {
      b.won += 1
      a.lost += 1
      if (configured) {
        b.points = (b.points || 0) + (pts.win as number)
        a.points = (a.points || 0) + (pts.loss as number)
      }
    }
  }

  const rows = [...map.values()]
  rows.sort((x, y) => {
    if (configured) {
      const pd = (y.points || 0) - (x.points || 0)
      if (pd !== 0) return pd
    }
    if (y.won !== x.won) return y.won - x.won
    if (y.drawn !== x.drawn) return y.drawn - x.drawn
    return x.teamId.localeCompare(y.teamId)
  })
  return rows
}
