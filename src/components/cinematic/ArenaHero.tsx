'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Hero art direction — Sarvam restraint:
 * left copy, right three pluckable arches, soft floor glow, almost no dust.
 */
export function ArenaHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.4])

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-[#07080b]">
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_8%,rgba(28,36,58,0.5),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.7)_100%)]" />
      </motion.div>

      <LiveParticleField className="absolute inset-0 z-[1] h-full w-full opacity-30" density={36} />

      {/* Three arches — the one interactive idea */}
      <ElasticStringField className="absolute inset-0 z-[2] h-full w-full" variant="hero" interactive />

      <motion.div
        style={{ opacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-28 pt-28 sm:px-8"
      >
        <div className="pointer-events-auto max-w-2xl lg:max-w-3xl">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65 }}
            className="text-[11px] font-bold tracking-[0.22em] text-white sm:text-xs"
            style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
          >
            <span className="text-white/90">SPORTSCOM</span>{' '}
            <span className="tracking-[0.28em] text-[var(--speed-gold)]">PRESENTS</span>
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.16, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-speed-title mt-4 text-[clamp(3.4rem,14vw,7.5rem)] leading-[0.9] text-white drop-shadow-[0_0_40px_rgba(242,116,33,0.25)]"
          >
            SPEED
            <br />
            <span className="text-[0.72em] text-[var(--speed-gold)]">2026–27</span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-6 max-w-md text-base leading-relaxed text-[var(--speed-muted)]"
          >
            Your SPEED journey begins with registration.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.55 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link href="/register" className="speed-cta speed-cta-sweep relative overflow-hidden">
              REGISTER FOR SPEED
            </Link>
            <motion.a
              href="#sports"
              className="speed-arena-btn group"
              whileHover={reduced ? undefined : { scale: 1.04, y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
            >
              <span className="speed-arena-btn__pulse" aria-hidden />
              <span className="relative z-[1]">EXPLORE THE ARENA</span>
              <span className="speed-arena-btn__arrow relative z-[1]" aria-hidden>
                →
              </span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
