import { describe, expect, it } from 'vitest'
import { applyJackpot, basePoints, jackpotAllowedForCategory } from './points'

describe('points engine', () => {
  it('awards team sport places', () => {
    expect(basePoints('team_sport', 1)).toBe(1000)
    expect(basePoints('team_sport', 2)).toBe(750)
    expect(basePoints('team_sport', 5)).toBe(0)
  })

  it('doubles jackpot first place', () => {
    const r = applyJackpot(1000, 1, true)
    expect(r.final).toBe(2000)
  })

  it('halves jackpot 2nd–4th', () => {
    expect(applyJackpot(750, 2, true).final).toBe(375)
    expect(applyJackpot(500, 3, true).final).toBe(250)
    expect(applyJackpot(250, 4, true).final).toBe(125)
  })

  it('deducts 500 below 4th with jackpot', () => {
    const r = applyJackpot(0, 5, true)
    expect(r.final).toBe(-500)
  })

  it('blocks jackpot on athletics/swimming categories', () => {
    expect(jackpotAllowedForCategory('athletics_swimming_relay')).toBe(false)
    expect(jackpotAllowedForCategory('team_sport')).toBe(true)
  })
})
