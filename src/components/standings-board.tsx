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
          <h1 className="mt-3 font-display text-[2.4rem] tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
            Standings
          </h1>
          <p className="mt-3 text-sm text-[var(--speed-muted)] sm:mt-4 sm:text-base">
            Updated {loadedAt}.
          </p>
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
            <div className="mt-8 grid grid-cols-3 items-end gap-2 sm:mt-12 sm:gap-3">
              {(podium.length === 3 ? order : podium.map((_, i) => i)).map((idx, visual) => {
                const team = podium[idx]
                if (!team) return null
                const rank = idx + 1
                // visual order is already 2nd · 1st · 3rd — taller centre = champion
                const heights = [
                  'min-h-[118px] sm:min-h-[200px]',
                  'min-h-[148px] sm:min-h-[240px]',
                  'min-h-[108px] sm:min-h-[180px]',
                ]
                const medals = ['#c0c0c0', '#e2b14a', '#cd7f32']
                return (
                  <motion.article
                    key={team.code}
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visual * 0.08, duration: 0.55 }}
                    className={`relative flex flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-2.5 sm:p-6 ${
                      podium.length === 3 ? heights[visual] : 'min-h-[140px]'
                    }`}
                  >
                    <div
                      className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl sm:-right-6 sm:-top-6 sm:h-24 sm:w-24"
                      style={{ background: medals[rank - 1], opacity: 0.35 }}
                    />
                    <p
                      className="font-display text-2xl tracking-[0.06em] sm:text-5xl sm:tracking-[0.08em]"
                      style={{ color: medals[rank - 1] }}
                    >
                      {String(rank).padStart(2, '0')}
                    </p>
                    <h2 className="mt-1 font-display text-[0.95rem] leading-tight tracking-[0.03em] text-white sm:mt-3 sm:text-3xl sm:tracking-[0.08em]">
                      {team.name}
                    </h2>
                    <p className="mt-0.5 text-[9px] tracking-[0.16em] text-white/45 sm:mt-1 sm:text-xs sm:tracking-[0.2em]">
                      {team.code}
                    </p>
                    <p className="mt-2 font-display text-xl tracking-[0.04em] text-white sm:mt-6 sm:text-4xl sm:tracking-[0.06em]">
                      {Number(team.points)}
                      <span className="ml-1 text-[9px] tracking-[0.16em] text-[var(--speed-muted)] sm:ml-2 sm:text-sm sm:tracking-[0.2em]">
                        PTS
                      </span>
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
                    <td className="px-3 py-3.5 font-display text-base text-[var(--speed-muted)] sm:px-4 sm:py-4 sm:text-lg">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                      <span className="block font-display text-base leading-snug tracking-[0.04em] text-[var(--speed-ink)] sm:inline sm:text-xl sm:tracking-[0.06em]">
                        {team.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[var(--speed-muted)] sm:ml-3 sm:mt-0 sm:inline sm:text-xs">
                        {team.code}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 text-[var(--speed-muted)] sm:table-cell">
                      {team.scoring_events ?? '—'}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-[var(--speed-ink)] sm:px-4 sm:py-4">
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
