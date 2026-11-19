import { describe, expect, it } from 'vitest'
import { checkSportCap } from './cap'

describe('checkSportCap', () => {
  it('accepts three counted sports', () => {
    const r = checkSportCap(['cricket', 'football', 'volleyball'])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.counted).toBe(3)
      expect(r.slotsLeft).toBe(0)
    }
  })

  it('accepts three counted plus both relays', () => {
    const r = checkSportCap([
      'cricket',
      'football',
      'volleyball',
      'athletics-relays',
      'swimming-relays',
    ])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.counted).toBe(3)
      expect(r.exempt).toBe(2)
    }
  })

  it('rejects four counted sports', () => {
    const r = checkSportCap(['cricket', 'football', 'volleyball', 'basketball'])
    expect(r.ok).toBe(false)
    expect(r.counted).toBe(4)
  })

  it('accepts athletics and swimming only', () => {
    const r = checkSportCap(['athletics-relays', 'swimming-relays'])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.counted).toBe(0)
      expect(r.slotsLeft).toBe(3)
    }
  })

  it('allows fewer than three counted', () => {
    const r = checkSportCap(['cricket'])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.slotsLeft).toBe(2)
  })

  it('dedupes selections', () => {
    const r = checkSportCap(['cricket', 'cricket', 'football'])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.counted).toBe(2)
  })
})
