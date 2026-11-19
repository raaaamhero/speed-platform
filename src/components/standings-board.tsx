'use client'

import { motion, useReducedMotion } from 'framer-motion'

export type StandingRow = {
  number: number
  code: string
  name: string
  points: number | string
  scoring_events?: number | null
}

export function StandingsBoard({ rows, loadedAt }: { rows: StandingRow[]; loadedAt: string }) {
  const reduced = useReducedMotion()
  const podium = rows.slice(0, 3)
  const rest = rows.slice(3)
  const order = [1, 0, 2] // visual: 2nd, 1st, 3rd on desktop

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="speed-kicker">STANDINGS</p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
            Standings
          </h1>
          <p className="mt-4 text-[var(--speed-muted)]">Updated {loadedAt}.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-12 border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl tracking-[0.08em] text-[var(--speed-muted)]">
            No results yet
          </p>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-3 sm:items-end">
              {(podium.length === 3 ? order : podium.map((_, i) => i)).map((idx, visual) => {
                const team = podium[idx]
                if (!team) return null
                const rank = idx + 1
                const heights = ['min-h-[200px]', 'min-h-[240px]', 'min-h-[180px]']
                const medals = ['#c0c0c0', '#e2b14a', '#cd7f32']
                return (
                  <motion.article
                    key={team.code}
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visual * 0.08, duration: 0.55 }}
                    className={`relative flex flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 ${
                      podium.length === 3 ? heights[visual] : 'min-h-[180px]'
                    } ${rank === 1 ? 'sm:order-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
                      style={{ background: medals[rank - 1], opacity: 0.35 }}
                    />
                    <p
                      className="font-display text-5xl tracking-[0.08em]"
                      style={{ color: medals[rank - 1] }}
                    >
                      {String(rank).padStart(2, '0')}
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-[0.08em] text-white">{team.name}</h2>
                    <p className="mt-1 text-xs tracking-[0.2em] text-white/45">{team.code}</p>
                    <p className="mt-6 font-display text-4xl tracking-[0.06em] text-white">
                      {Number(team.points)}
                      <span className="ml-2 text-sm tracking-[0.2em] text-[var(--speed-muted)]">PTS</span>
                    </p>
                  </motion.article>
                )
              })}
            </div>
          )}

          <div className="mt-10 overflow-hidden border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-display text-xs tracking-[0.2em] text-[var(--speed-muted)]">
                <tr>
                  <th className="px-4 py-3 font-normal">#</th>
                  <th className="px-4 py-3 font-normal">Team</th>
                  <th className="hidden px-4 py-3 font-normal sm:table-cell">Events</th>
                  <th className="px-4 py-3 text-right font-normal">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((team, i) => (
                  <tr
                    key={team.code}
                    className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                      i < 3 ? 'bg-[var(--speed-gold)]/[0.03]' : ''
                    }`}
                  >
                    <td className="px-4 py-4 font-display text-lg text-[var(--speed-muted)]">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-display text-xl tracking-[0.06em] text-[var(--speed-ink)]">
                        {team.name}
                      </span>
                      <span className="ml-3 text-xs text-[var(--speed-muted)]">{team.code}</span>
                    </td>
                    <td className="hidden px-4 py-4 text-[var(--speed-muted)] sm:table-cell">
                      {team.scoring_events ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[var(--speed-ink)]">
                      {Number(team.points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
