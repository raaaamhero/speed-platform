'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TEAMS, sectionLabel } from '@/lib/rules/teams'

const accents = [
  '#e2b14a',
  '#c81e2c',
  '#7dd3fc',
  '#4ade80',
  '#fb923c',
  '#f472b6',
  '#a78bfa',
  '#facc15',
  '#22d3ee',
  '#f87171',
  '#94a3b8',
  '#e2b14a',
]

export function TeamsShowcase() {
  const reduced = useReducedMotion()

  return (
    <section id="teams" className="relative scroll-mt-20 border-t border-white/10 bg-[#07080b] py-16 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="speed-kicker">THE CONTENDERS</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-white sm:text-6xl">
          12 teams.
          <br />
          One title.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Official SPEED 2026–27 formations from the rulebook.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team, i) => (
            <motion.article
              key={team.code}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-6%' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.28) }}
              className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
                style={{ background: accents[i], opacity: 0.25 }}
              />
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xs tracking-[0.3em] text-white/40">
                  {String(team.number).padStart(2, '0')}
                </span>
                <span className="font-display text-xs tracking-[0.25em] text-white/45">{team.code}</span>
              </div>
              <h3 className="mt-3 font-display text-3xl tracking-[0.08em] text-white">{team.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--speed-muted)]">
                {team.sectionCodes.map(sectionLabel).join(' · ')}
              </p>
              <div
                className="mt-5 h-0.5 w-10 transition-all duration-500 group-hover:w-24"
                style={{ background: accents[i] }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
