'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function ManifestoSection() {
  const reduced = useReducedMotion()

  return (
    <section id="about" className="relative scroll-mt-20 border-t border-white/10 bg-[#050608] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(226,177,74,0.1),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="speed-kicker"
        >
          WHAT IS SPEED?
        </motion.p>
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-3xl font-display text-4xl tracking-[0.06em] text-white sm:text-6xl"
        >
          TAPMI&apos;s multi-sport festival.
        </motion.h2>
        <p className="mt-6 max-w-xl text-lg text-[var(--speed-muted)]">
          12 teams. 9 sports. Register to take part.
        </p>
        <Link href="/register" className="speed-cta speed-cta-sweep mt-8 inline-flex">
          REGISTER FOR SPEED
        </Link>
      </div>
    </section>
  )
}
