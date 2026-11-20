import { describe, expect, it } from 'vitest'
import { buildMatchSummary, scoreSchemaForSport } from './score-schemas'

describe('score schemas', () => {
  it('maps sports to schemas', () => {
    expect(scoreSchemaForSport('cricket')).toBe('cricket')
    expect(scoreSchemaForSport('basketball', 'basketball-women')).toBe('basketball')
    expect(scoreSchemaForSport('unknown')).toBe('generic')
  })

  it('builds cricket-style announcement copy', () => {
    const s = buildMatchSummary({
      competitionName: 'Cricket',
      teamA: 'Kootlers International',
      teamB: 'Jagerbomb',
      isDraw: false,
      winnerName: 'Kootlers International',
      metrics: {
        schema: 'cricket',
        team_a: { runs: 145, wickets: 6 },
        team_b: { runs: 132, wickets: 8 },
      },
    })
    expect(s).toContain('CRICKET')
    expect(s).toContain('Kootlers International')
    expect(s).toContain('145/6')
    expect(s).toContain('132/8')
  })

  it('describes draws clearly', () => {
    const s = buildMatchSummary({
      competitionName: 'Football',
      teamA: 'A',
      teamB: 'B',
      isDraw: true,
      scoreA: 1,
      scoreB: 1,
    })
    expect(s).toContain('drew')
  })
})
