'use client'

import { useEffect, useMemo, useState } from 'react'
import { SPORTS } from '@/lib/rules/sports'
import { TEAMS } from '@/lib/rules/teams'

type Fixture = {
  id: string
  venue: string | null
  starts_at: string | null
  status: string
  published: boolean
  sport_name: string
  sport_slug: string
  team_a_name: string | null
  team_b_name: string | null
  team_a_code: string | null
  team_b_code: string | null
}

export default function OpsResultsPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [fixtureId, setFixtureId] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [jackpotTeam, setJackpotTeam] = useState(1)
  const [jackpotSport, setJackpotSport] = useState('cricket')

  async function load() {
    const res = await fetch('/api/ops/fixtures')
    if (res.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const data = await res.json()
    const list = (data.fixtures || []) as Fixture[]
    setFixtures(list)
    if (!fixtureId && list.length) {
      const open = list.find((f) => f.status !== 'completed')
      setFixtureId((open || list[0]).id)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = useMemo(
    () => fixtures.find((f) => f.id === fixtureId) || null,
    [fixtures, fixtureId],
  )

  const openFixtures = useMemo(
    () => fixtures.filter((f) => f.status !== 'completed' && f.team_a_name && f.team_b_name),
    [fixtures],
  )

  async function declareWinner(side: 'a' | 'b') {
    if (!fixtureId) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixture_id: fixtureId, winner: side }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(`${data.winner_name} declared winner · fixture marked completed`)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function placeJackpot(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const res = await fetch('/api/ops/jackpot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_number: jackpotTeam, sport_slug: jackpotSport }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Failed')
      return
    }
    setMsg(`Jackpot placed for team #${jackpotTeam} on ${jackpotSport}`)
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-3xl tracking-[0.08em]">Results & jackpot</h2>
        <p className="mt-2 text-sm text-[var(--speed-muted)]">
          Pick a scheduled fixture and declare who won. Match results do not add overall SPEED place
          points by themselves.
        </p>
      </div>

      {msg && <p className="text-sm text-[var(--speed-gold)]">{msg}</p>}

      <div className="space-y-4 border border-white/10 p-5">
        <h3 className="font-display text-xl tracking-[0.08em]">Declare match winner</h3>

        {openFixtures.length === 0 ? (
          <p className="text-sm text-[var(--speed-muted)]">
            No open fixtures with both teams. Create one under Fixtures first.
          </p>
        ) : (
          <>
            <label className="block text-sm">
              Fixture
              <select
                value={fixtureId}
                onChange={(e) => setFixtureId(e.target.value)}
                className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
              >
                {fixtures
                  .filter((f) => f.team_a_name && f.team_b_name)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.status === 'completed' ? '✓ ' : ''}
                      {f.sport_name}: {f.team_a_name} vs {f.team_b_name}
                      {f.starts_at
                        ? ` · ${new Date(f.starts_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}`
                        : ''}
                    </option>
                  ))}
              </select>
            </label>

            {selected && (
              <div className="border border-white/10 bg-white/[0.02] p-4">
                <p className="font-display text-xs tracking-[0.2em] text-[var(--speed-gold)]">
                  {selected.sport_name.toUpperCase()}
                </p>
                <p className="mt-2 font-display text-2xl tracking-[0.04em] text-white">
                  {selected.team_a_name}{' '}
                  <span className="text-white/35">VS</span> {selected.team_b_name}
                </p>
                <p className="mt-2 text-sm text-[var(--speed-muted)]">
                  {selected.venue || 'Venue TBA'}
                  {selected.starts_at
                    ? ` · ${new Date(selected.starts_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                      })}`
                    : ''}
                  {' · '}
                  {selected.status}
                </p>

                {selected.status === 'completed' ? (
                  <p className="mt-4 text-sm text-[var(--speed-muted)]">
                    Winner already declared for this fixture.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void declareWinner('a')}
                      className="speed-cta disabled:opacity-40"
                    >
                      {selected.team_a_name} won
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void declareWinner('b')}
                      className="speed-cta disabled:opacity-40"
                    >
                      {selected.team_b_name} won
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={placeJackpot} className="grid gap-3 border border-white/10 p-5 sm:grid-cols-2">
        <h3 className="font-display text-xl tracking-[0.08em] sm:col-span-2">Place jackpot</h3>
        <label className="text-sm">
          Team
          <select
            value={jackpotTeam}
            onChange={(e) => setJackpotTeam(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          >
            {TEAMS.filter((t) => t.code !== 'T11').map((t) => (
              <option key={t.number} value={t.number}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sport
          <select
            value={jackpotSport}
            onChange={(e) => setJackpotSport(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          >
            {SPORTS.filter((s) => s.countsTowardCap).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="speed-cta sm:col-span-2">
          Confirm jackpot
        </button>
      </form>
    </div>
  )
}
