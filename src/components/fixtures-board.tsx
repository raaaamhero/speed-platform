'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type FixtureRow = {
  id: string
  title: string | null
  venue: string | null
  starts_at: string | null
  status: string
  sportName: string
  sportSlug: string
  teamA: string
  teamB: string
  competitionName?: string | null
  groupCode?: string | null
  stage?: string | null
  scoreA?: number | null
  scoreB?: number | null
  isDraw?: boolean
  winnerName?: string | null
  hasOfficialResult?: boolean
}

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s === 'live' || s === 'in_progress') return 'speed-status speed-status-live'
  if (s === 'completed' || s === 'final' || s === 'done') return 'speed-status speed-status-done'
  if (s === 'postponed' || s === 'abandoned' || s === 'cancelled')
    return 'speed-status opacity-70'
  return 'speed-status speed-status-upcoming'
}

function stageLabel(f: FixtureRow) {
  if (f.stage === 'semi_final') return 'Semi-final'
  if (f.stage === 'final') return 'Final'
  if (f.groupCode) return `Group ${f.groupCode}`
  return null
}

export function FixturesBoard({ fixtures }: { fixtures: FixtureRow[] }) {
  const [sport, setSport] = useState('all')
  const [status, setStatus] = useState('all')
  const [team, setTeam] = useState('all')

  const sports = useMemo(
    () => Array.from(new Set(fixtures.map((f) => f.sportName))).sort(),
    [fixtures],
  )
  const teams = useMemo(
    () =>
      Array.from(
        new Set(fixtures.flatMap((f) => [f.teamA, f.teamB]).filter((t) => t !== 'TBD')),
      ).sort(),
    [fixtures],
  )
  const statuses = useMemo(
    () => Array.from(new Set(fixtures.map((f) => f.status))).sort(),
    [fixtures],
  )

  const filtered = fixtures.filter((f) => {
    if (sport !== 'all' && f.sportName !== sport) return false
    if (status !== 'all' && f.status !== status) return false
    if (team !== 'all' && f.teamA !== team && f.teamB !== team) return false
    return true
  })

  return (
    <div>
      <p className="speed-kicker">MATCH CENTRE</p>
      <h1 className="mt-3 font-display text-[2.4rem] tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
        Fixtures & results
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--speed-muted)]">
        Official scores appear after SportsCom approval. Full detail on each completed match.
      </p>

      {fixtures.length === 0 ? (
        <div className="mt-10 border border-dashed border-white/15 px-5 py-14 text-center sm:mt-12 sm:px-6 sm:py-16">
          <p className="font-display text-xl tracking-[0.08em] text-[var(--speed-muted)] sm:text-2xl">
            No scheduled fixtures yet
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3">
            <label className="text-xs text-[var(--speed-muted)]">
              Sport
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="speed-input mt-1 w-full py-2.5 text-sm"
              >
                <option value="all">All sports</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--speed-muted)]">
              Team
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="speed-input mt-1 w-full py-2.5 text-sm"
              >
                <option value="all">All teams</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--speed-muted)]">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="speed-input mt-1 w-full py-2.5 text-sm"
              >
                <option value="all">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="mt-6 space-y-3 sm:mt-8">
            {filtered.map((f) => {
              const stage = stageLabel(f)
              return (
                <li key={f.id}>
                  <Link
                    href={`/matches/${f.id}`}
                    className="group block border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent px-4 py-4 transition hover:border-white/25 sm:px-5 sm:py-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[10px] tracking-[0.22em] text-[var(--speed-gold)] sm:text-xs sm:tracking-[0.25em]">
                          {(f.competitionName || f.sportName).toUpperCase()}
                          {stage ? ` · ${stage.toUpperCase()}` : ''}
                        </p>
                        <p className="mt-2 font-display text-[1.35rem] leading-tight tracking-[0.04em] text-[var(--speed-ink)] sm:text-4xl sm:tracking-[0.05em]">
                          {f.teamA} <span className="text-white/35">VS</span> {f.teamB}
                        </p>
                        {f.hasOfficialResult && (
                          <p className="mt-2 text-sm text-[var(--speed-gold)]">
                            {f.isDraw
                              ? `Draw${f.scoreA != null ? ` · ${f.scoreA}–${f.scoreB}` : ''}`
                              : f.winnerName
                                ? `${f.winnerName} won${
                                    f.scoreA != null ? ` · ${f.scoreA}–${f.scoreB}` : ''
                                  }`
                                : f.scoreA != null
                                  ? `${f.scoreA}–${f.scoreB}`
                                  : 'Result available'}
                          </p>
                        )}
                      </div>
                      <span className={statusClass(f.status)}>{f.status.toUpperCase()}</span>
                    </div>
                    <p className="mt-3 text-sm leading-snug text-[var(--speed-muted)]">
                      {f.venue || 'Venue TBA'}
                      {f.starts_at
                        ? ` · ${new Date(f.starts_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}`
                        : ''}
                    </p>
                  </Link>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="border border-dashed border-white/15 px-5 py-10 text-center text-sm text-[var(--speed-muted)]">
                No matches match these filters.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  )
}
