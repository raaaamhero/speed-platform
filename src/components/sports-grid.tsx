'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SPORTS } from '@/lib/rules/sports'

export function SportsGrid() {
  const reduce = useReducedMotion()

  return (
    <section id="sports" className="scroll-mt-20 border-t border-white/10 bg-[var(--speed-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">THE ARENA</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-5xl">
          Nine sports. One table.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Pick up to three counted sports. Athletics and Swimming are free extras — they
          do not count toward your cap.
        </p>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPORTS.map((sport, i) => (
            <motion.li
              key={sport.slug}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent px-5 py-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl tracking-[0.06em] text-[var(--speed-ink)]">
                  {sport.name}
                </h3>
                <span
                  className={
                    sport.countsTowardCap
                      ? 'font-display text-[10px] tracking-[0.2em] text-[var(--speed-muted)]'
                      : 'font-display text-[10px] tracking-[0.2em] text-[var(--speed-gold)]'
                  }
                >
                  {sport.countsTowardCap ? 'COUNTS' : 'EXEMPT'}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--speed-muted)]">
                Squad {sport.maxSquad}
                {sport.playing ? ` · Playing ${sport.playing}` : ''}
              </p>
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--speed-crimson)]/10 blur-2xl transition group-hover:bg-[var(--speed-gold)]/20"
                aria-hidden
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
