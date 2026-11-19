'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TEAMS, sectionLabel } from '@/lib/rules/teams'

export function TeamsStrip() {
  const reduce = useReducedMotion()

  return (
    <section id="teams" className="scroll-mt-20 border-t border-white/10 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">THE FIELD</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-5xl">
          Twelve teams.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Sections combine into squads. One tournament. One overall points table.
        </p>

        <ol className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team, i) => (
            <motion.li
              key={team.code}
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="bg-[var(--speed-bg)] px-5 py-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-3xl tracking-[0.08em] text-[var(--speed-ink)]">
                  {team.name}
                </span>
                <span className="font-display text-xs tracking-[0.25em] text-[var(--speed-muted)]">
                  {team.code}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--speed-muted)]">
                {team.sectionCodes.map(sectionLabel).join(' · ')}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
