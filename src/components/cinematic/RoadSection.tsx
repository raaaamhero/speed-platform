'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function RoadSection() {
  const reduced = useReducedMotion()

  return (
    <section className="relative border-t border-white/10 bg-black py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="speed-kicker"
        >
          FOLLOW SPEED
        </motion.p>
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 max-w-2xl font-display text-[2rem] tracking-[0.06em] text-white sm:text-5xl"
        >
          Standings and fixtures.
        </motion.h2>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          <Link
            href="/tournament"
            className="group relative min-h-[7.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[var(--speed-gold)]/20 to-transparent p-6 transition hover:border-[var(--speed-gold)]/40 sm:p-8"
          >
            <h3 className="font-display text-2xl tracking-[0.08em] text-white sm:text-3xl">
              TOURNAMENT
            </h3>
            <span className="mt-6 inline-block font-display tracking-[0.2em] text-white/80 transition group-hover:text-[var(--speed-gold)] sm:mt-8">
              OPEN →
            </span>
          </Link>
          <Link
            href="/standings"
            className="group relative min-h-[7.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[var(--speed-crimson)]/20 to-transparent p-6 transition hover:border-[var(--speed-gold)]/40 sm:p-8"
          >
            <h3 className="font-display text-2xl tracking-[0.08em] text-white sm:text-3xl">
              STANDINGS
            </h3>
            <span className="mt-6 inline-block font-display tracking-[0.2em] text-white/80 transition group-hover:text-[var(--speed-gold)] sm:mt-8">
              OPEN →
            </span>
          </Link>
          <Link
            href="/fixtures"
            className="group relative min-h-[7.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 transition hover:border-[var(--speed-gold)]/40 sm:p-8"
          >
            <h3 className="font-display text-2xl tracking-[0.08em] text-white sm:text-3xl">
              FIXTURES
            </h3>
            <span className="mt-6 inline-block font-display tracking-[0.2em] text-white/80 transition group-hover:text-[var(--speed-gold)] sm:mt-8">
              OPEN →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
