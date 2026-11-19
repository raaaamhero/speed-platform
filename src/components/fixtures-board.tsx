'use client'

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
}

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s === 'live' || s === 'in_progress') return 'speed-status speed-status-live'
  if (s === 'completed' || s === 'final' || s === 'done') return 'speed-status speed-status-done'
  return 'speed-status speed-status-upcoming'
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
      Array.from(new Set(fixtures.flatMap((f) => [f.teamA, f.teamB]).filter((t) => t !== 'TBD'))).sort(),
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
      <p className="speed-kicker">FIXTURES</p>
      <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
        Fixtures
      </h1>

      {fixtures.length === 0 ? (
        <div className="mt-12 border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl tracking-[0.08em] text-[var(--speed-muted)]">
            No fixtures yet
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-3">
            <label className="text-xs text-[var(--speed-muted)]">
              Sport
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="speed-input mt-1 min-w-[9rem] py-2 text-sm"
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
                className="speed-input mt-1 min-w-[9rem] py-2 text-sm"
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
                className="speed-input mt-1 min-w-[9rem] py-2 text-sm"
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

          <ul className="mt-8 space-y-3">
            {filtered.map((f) => (
              <li
                key={f.id}
                className="group border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent px-5 py-5 transition hover:border-white/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xs tracking-[0.25em] text-[var(--speed-gold)]">
                      {f.sportName.toUpperCase()}
                    </p>
                    <p className="mt-2 font-display text-3xl tracking-[0.05em] text-[var(--speed-ink)] sm:text-4xl">
                      {f.teamA} <span className="text-white/35">VS</span> {f.teamB}
                    </p>
                  </div>
                  <span className={statusClass(f.status)}>{f.status.toUpperCase()}</span>
                </div>
                <p className="mt-3 text-sm text-[var(--speed-muted)]">
                  {f.venue || 'Venue TBA'}
                  {f.starts_at ? ` · ${new Date(f.starts_at).toLocaleString()}` : ''}
                </p>
              </li>
            ))}
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
