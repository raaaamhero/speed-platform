'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function RoadSection() {
  const reduced = useReducedMotion()

  return (
    <section className="relative border-t border-white/10 bg-black py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="speed-kicker"
        >
          THE ROAD TO GLORY
        </motion.p>
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 max-w-2xl font-display text-4xl tracking-[0.06em] text-white sm:text-5xl"
        >
          Follow the table. Chase the fixtures.
        </motion.h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Live standings and published matches — updated by SportsCom as the festival unfolds.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/standings"
            className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-[var(--speed-crimson)]/20 to-transparent p-8 transition hover:border-[var(--speed-gold)]/40"
          >
            <p className="font-display text-xs tracking-[0.3em] text-[var(--speed-gold)]">CHAMPIONSHIP</p>
            <h3 className="mt-3 font-display text-4xl tracking-[0.08em] text-white">STANDINGS</h3>
            <p className="mt-3 text-sm text-white/65">Overall points. Podium. Full table.</p>
            <span className="mt-8 inline-block font-display tracking-[0.2em] text-white/80 transition group-hover:text-[var(--speed-gold)]">
              OPEN →
            </span>
          </Link>
          <Link
            href="/fixtures"
            className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-[var(--speed-gold)]/15 to-transparent p-8 transition hover:border-[var(--speed-gold)]/40"
          >
            <p className="font-display text-xs tracking-[0.3em] text-[var(--speed-gold)]">SCHEDULE</p>
            <h3 className="mt-3 font-display text-4xl tracking-[0.08em] text-white">FIXTURES</h3>
            <p className="mt-3 text-sm text-white/65">Upcoming, completed, and published matches.</p>
            <span className="mt-8 inline-block font-display tracking-[0.2em] text-white/80 transition group-hover:text-[var(--speed-gold)]">
              OPEN →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
