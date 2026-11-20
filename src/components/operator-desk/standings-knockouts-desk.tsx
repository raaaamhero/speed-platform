'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Competition = {
  id: string
  slug: string
  name: string
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
  team_a: { name: string } | null
  team_b: { name: string } | null
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
  knockouts: Fixture[]
  sfRules: { sf_index: number; home_group: string; away_group: string }[]
  pointsProvisional?: boolean
}

export function StandingsKnockoutsDesk() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [slug, setSlug] = useState('')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/public/tournament')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      const list = (data.competitions || []) as Competition[]
      setCompetitions(list)
      const first = list.find((c) => c.format_status === 'active') || list[0]
      if (first) setSlug(first.slug)
    })()
  }, [])

  useEffect(() => {
    if (!slug) return
    setDetail(null)
    void (async () => {
      const res = await fetch(`/api/public/tournament?competition=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      setDetail(data)
    })()
  }, [slug])

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">
          STANDINGS & KNOCKOUTS
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Progression</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Group tables from approved match results only. Semi-final pairings follow official
          competition rules. Enter KO scores in Match Results — never awards overall SPEED points.
        </p>
      </div>

      {error && <p className="text-sm text-[#c81e2c]">{error}</p>}

      <label className="block text-xs text-white/45">
        Competition
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full max-w-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
        >
          {competitions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
              {c.format_status === 'pending' ? ' (TBA)' : ''}
            </option>
          ))}
        </select>
      </label>

      {!detail ? (
        <p className="text-white/40">Loading…</p>
      ) : detail.formatPending ? (
        <div className="border border-dashed border-white/15 px-5 py-12 text-center">
          <p className="font-display text-xl tracking-[0.08em] text-white/50">Format pending</p>
        </div>
      ) : (
        <>
          {detail.pointsProvisional && (
            <p className="text-xs text-white/40">
              Group points provisional 3 / 1 / 0 · not overall SPEED championship points.
            </p>
          )}

          <div>
            <h3 className="font-display text-lg tracking-[0.08em]">Group standings</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {detail.groups.map((g) => (
                <div key={g.code} className="overflow-hidden border border-white/10">
                  <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2">
                    <p className="font-display text-sm tracking-[0.2em] text-[#e2b14a]">
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
                  {g.teams[0]?.team && g.teams.every((t) => t.played >= 2) && (
                    <p className="border-t border-white/10 px-4 py-2 text-xs text-[#e2b14a]/80">
                      Provisional group leader: {g.teams[0].team.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-[0.08em]">Semi-final pairings</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {detail.sfRules.map((r) => (
                <li key={r.sf_index} className="border border-white/10 px-4 py-3">
                  SF{r.sf_index}: Winner Group {r.home_group} vs Winner Group {r.away_group}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg tracking-[0.08em]">Knockout bracket</h3>
              <Link
                href="/ops/operator-desk/match-results"
                className="text-xs text-[#e2b14a] hover:underline"
              >
                Enter KO results →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {detail.knockouts.map((f) => (
                <li key={f.id} className="border border-white/10 px-4 py-3">
                  <p className="font-display text-xs tracking-[0.2em] text-[#e2b14a]">
                    {(f.bracket_slot || f.stage || '').toUpperCase()}
                  </p>
                  <p className="mt-1 font-display text-xl tracking-[0.04em]">
                    {f.team_a?.name || 'Group winner TBD'}{' '}
                    <span className="text-white/30">VS</span>{' '}
                    {f.team_b?.name || 'Group winner TBD'}
                  </p>
                  <p className="mt-1 text-sm text-white/40">
                    {f.starts_at
                      ? new Date(f.starts_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })
                      : 'Unscheduled'}
                    {f.venue ? ` · ${f.venue}` : ''}
                    {f.result?.is_draw
                      ? ' · Draw'
                      : f.result
                        ? f.result.score_a != null
                          ? ` · ${f.result.score_a}–${f.result.score_b}`
                          : ' · Result in'
                        : ''}
                  </p>
                </li>
              ))}
              {detail.knockouts.length === 0 && (
                <li className="text-sm text-white/40">No knockout shells yet.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
