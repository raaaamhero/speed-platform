'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

export function SportsComBrand() {
  const reduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#050608] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(200,30,44,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(226,177,74,0.12),transparent_50%)]" />
      <div className="speed-grain absolute inset-0 opacity-30" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-28 w-28 overflow-hidden rounded-full border border-white/20 shadow-[0_0_60px_rgba(226,177,74,0.25)] sm:h-36 sm:w-36"
        >
          <Image src="/brand/sportscom-logo.jpg" alt="SportsCom official logo" fill className="object-cover" />
        </motion.div>

        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mt-8 font-display text-5xl tracking-[0.12em] text-white sm:text-7xl"
        >
          SPORTSCOM
        </motion.h2>
        <p className="mt-2 font-display text-sm tracking-[0.35em] text-[var(--speed-gold)]">
          TAPMI
        </p>
        <p className="mt-5 text-lg text-[var(--speed-muted)]">Host of SPEED 2026–27.</p>
      </div>
    </section>
  )
}
