'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Competition = {
  id: string
  slug: string
  name: string
  category: string | null
  format_status: string
  points_provisional?: boolean
}

type GroupTable = {
  code: string
  teams: {
    position: number
    team: { name: string; code: string } | null
    played: number
    won: number
    drawn: number
    lost: number
    points: number | null
  }[]
}

type Fixture = {
  id: string
  stage: string | null
  bracket_slot: string | null
  venue: string | null
  starts_at: string | null
  status: string
  team_a: { name: string; id?: string } | null
  team_b: { name: string; id?: string } | null
  result: {
    winner_team_id: string | null
    is_draw: boolean
    score_a?: number | null
    score_b?: number | null
  } | null
}

type Detail = {
  competition: Competition
  formatPending?: boolean
  groups: GroupTable[]
  fixtures: Fixture[]
  knockouts: Fixture[]
  sfRules: { sf_index: number; home_group: string; away_group: string }[]
  pointsProvisional?: boolean
}

const TABS = ['Overview', 'Groups', 'Fixtures', 'Standings', 'Knockouts'] as const

export function TournamentCentre() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [slug, setSlug] = useState('')
  const [tab, setTab] = useState<(typeof TABS)[number]>('Groups')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/public/tournament')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        const list = (data.competitions || []) as Competition[]
        setCompetitions(list)
        const firstActive = list.find((c) => c.format_status === 'active') || list[0]
        if (firstActive) setSlug(firstActive.slug)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!slug) return
    setDetail(null)
    void (async () => {
      try {
        const res = await fetch(`/api/public/tournament?competition=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        setDetail(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed')
      }
    })()
  }, [slug])

  const basketballPair = useMemo(() => {
    const men = competitions.find((c) => c.slug === 'basketball-men')
    const women = competitions.find((c) => c.slug === 'basketball-women')
    return { men, women }
  }, [competitions])

  if (loading) {
    return <p className="text-[var(--speed-muted)]">Loading tournament…</p>
  }
  if (error) {
    return <p className="text-[var(--speed-crimson)]">{error}</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block text-sm text-[var(--speed-muted)]">
          Competition
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full min-w-[16rem] border border-white/15 bg-black/40 px-3 py-2.5 text-white sm:w-auto"
          >
            {competitions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {c.format_status === 'pending' ? ' (TBA)' : ''}
              </option>
            ))}
          </select>
        </label>

        {(slug === 'basketball-men' || slug === 'basketball-women') && (
          <div className="flex gap-2">
            {basketballPair.men && (
              <button
                type="button"
                onClick={() => setSlug('basketball-men')}
                className={`border px-3 py-2 text-xs tracking-wide ${
                  slug === 'basketball-men'
                    ? 'border-[var(--speed-gold)] text-[var(--speed-gold)]'
                    : 'border-white/20 text-white/70'
                }`}
              >
                MEN
              </button>
            )}
            {basketballPair.women && (
              <button
                type="button"
                onClick={() => setSlug('basketball-women')}
                className={`border px-3 py-2 text-xs tracking-wide ${
                  slug === 'basketball-women'
                    ? 'border-[var(--speed-gold)] text-[var(--speed-gold)]'
                    : 'border-white/20 text-white/70'
                }`}
              >
                WOMEN
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-3" aria-label="Tournament sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-semibold tracking-[0.14em] ${
              tab === t ? 'text-[var(--speed-gold)]' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      {!detail ? (
        <p className="text-[var(--speed-muted)]">Loading…</p>
      ) : detail.formatPending ? (
        <div className="border border-dashed border-white/20 px-5 py-14 text-center">
          <p className="font-display text-2xl tracking-[0.08em] text-white">Format to be announced</p>
          <p className="mt-3 text-sm text-[var(--speed-muted)]">
            {detail.competition.name} format is not decided yet. Groups and fixtures will appear
            here once SportsCom configures them.
          </p>
        </div>
      ) : (
        <>
          {(tab === 'Overview' || tab === 'Groups' || tab === 'Standings') && (
            <div className="space-y-6">
              {detail.pointsProvisional && (
                <p className="text-xs text-[var(--speed-muted)]">
                  Group points use provisional 3 / 1 / 0 (editable by SportsCom).
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {detail.groups.map((g) => (
                  <div key={g.code} className="border border-white/10 overflow-hidden">
                    <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2">
                      <p className="font-display text-sm tracking-[0.2em] text-[var(--speed-gold)]">
                        GROUP {g.code}
                      </p>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] tracking-[0.16em] text-white/40">
                        <tr>
                          <th className="px-3 py-2 font-normal">#</th>
                          <th className="px-3 py-2 font-normal">Team</th>
                          <th className="px-2 py-2 font-normal">P</th>
                          <th className="px-2 py-2 font-normal">W</th>
                          <th className="px-2 py-2 font-normal">D</th>
                          <th className="px-2 py-2 font-normal">L</th>
                          <th className="px-3 py-2 text-right font-normal">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.teams.map((row) => (
                          <tr key={row.team?.code || row.position} className="border-t border-white/5">
                            <td className="px-3 py-2.5 text-white/45">{row.position}</td>
                            <td className="px-3 py-2.5 text-white">{row.team?.name}</td>
                            <td className="px-2 py-2.5 text-white/70">{row.played}</td>
                            <td className="px-2 py-2.5 text-white/70">{row.won}</td>
                            <td className="px-2 py-2.5 text-white/70">{row.drawn}</td>
                            <td className="px-2 py-2.5 text-white/70">{row.lost}</td>
                            <td className="px-3 py-2.5 text-right text-white">
                              {row.points ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Fixtures' && (
            <ul className="space-y-2">
              {detail.fixtures.length === 0 && (
                <li className="text-sm text-[var(--speed-muted)]">No published group fixtures yet.</li>
              )}
              {detail.fixtures.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/matches/${f.id}`}
                    className="block border border-white/10 px-4 py-3 text-sm transition hover:border-white/25"
                  >
                    <p className="font-display text-lg tracking-[0.04em] text-white">
                      {f.team_a?.name || 'TBD'} <span className="text-white/35">VS</span>{' '}
                      {f.team_b?.name || 'TBD'}
                    </p>
                    <p className="mt-1 text-[var(--speed-muted)]">
                      {f.venue || 'Venue TBA'}
                      {f.starts_at
                        ? ` · ${new Date(f.starts_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}`
                        : ' · Time TBA'}
                      {' · '}
                      {f.status}
                      {f.result?.is_draw
                        ? ` · Draw${
                            f.result.score_a != null
                              ? ` ${f.result.score_a}–${f.result.score_b}`
                              : ''
                          }`
                        : f.result
                          ? ` · ${
                              f.result.score_a != null
                                ? `${f.result.score_a}–${f.result.score_b}`
                                : 'Result'
                            }`
                          : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tab === 'Knockouts' && (
            <div className="space-y-6">
              <div className="text-sm text-[var(--speed-muted)]">
                <p className="font-display text-xs tracking-[0.2em] text-[var(--speed-gold)]">
                  SEMI-FINAL PAIRINGS
                </p>
                <ul className="mt-2 space-y-1">
                  {detail.sfRules.map((r) => (
                    <li key={r.sf_index}>
                      SF{r.sf_index}: Winner Group {r.home_group} vs Winner Group {r.away_group}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="space-y-2">
                {detail.knockouts.map((f) => (
                  <li key={f.id} className="border border-white/10 px-4 py-3">
                    <p className="font-display text-xs tracking-[0.2em] text-[var(--speed-gold)]">
                      {(f.bracket_slot || f.stage || '').toUpperCase()}
                    </p>
                    <p className="mt-1 font-display text-xl tracking-[0.04em] text-white">
                      {f.team_a?.name || 'Group winner TBD'}{' '}
                      <span className="text-white/35">VS</span>{' '}
                      {f.team_b?.name || 'Group winner TBD'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--speed-muted)]">
                      {f.starts_at
                        ? new Date(f.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                        : 'Unscheduled'}
                      {f.venue ? ` · ${f.venue}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
