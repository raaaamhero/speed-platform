'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Hero — brand first, SPEED Centre copy, Register directly under it.
 * Mobile: readable left column; arches stay decorative on the right.
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

      <LiveParticleField className="absolute inset-0 z-[1] h-full w-full opacity-20 sm:opacity-30" density={28} />

      <ElasticStringField
        className="absolute inset-0 z-[2] h-full w-full opacity-70 sm:opacity-100"
        variant="hero"
        interactive
      />

      {/* Left/bottom scrim for copy; keep upper-right clear so mobile threads show */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[78%] bg-gradient-to-r from-[#07080b] via-[#07080b]/85 to-transparent sm:w-[58%] sm:from-[#07080b]/80 sm:via-[#07080b]/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[55%] bg-gradient-to-t from-[#07080b]/80 via-[#07080b]/35 to-transparent sm:hidden" />

      <motion.div
        style={{ opacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-24 pt-24 sm:px-8 sm:pb-28 sm:pt-28"
      >
        <div className="pointer-events-auto w-full max-w-xl lg:max-w-2xl">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65 }}
            className="text-[10px] font-bold tracking-[0.2em] text-white sm:text-xs sm:tracking-[0.22em]"
            style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
          >
            <span className="text-white/90">SPORTSCOM</span>{' '}
            <span className="tracking-[0.24em] text-[var(--speed-gold)] sm:tracking-[0.28em]">
              PRESENTS
            </span>
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.16, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-speed-title mt-3 text-[clamp(2.75rem,12vw,7.5rem)] leading-[0.92] text-white drop-shadow-[0_0_40px_rgba(242,116,33,0.25)] sm:mt-4"
          >
            SPEED
            <br />
            <span className="text-[0.72em] text-[var(--speed-gold)]">2026–27</span>
          </motion.h1>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 max-w-md sm:mt-7 sm:max-w-lg"
          >
            <p className="font-display text-sm tracking-[0.22em] text-[var(--speed-gold)] sm:text-base sm:tracking-[0.28em]">
              SPEED CENTRE
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--speed-muted)] sm:text-lg">
              Your one-stop for everything related to SPEED — fixtures, results, standings, teams and
              sports.
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="speed-cta speed-cta-sweep inline-flex w-full justify-center sm:w-auto"
              >
                REGISTER FOR SPEED
              </Link>
              <Link
                href="/#sports"
                className="speed-arena-btn inline-flex w-full justify-center sm:w-auto"
              >
                <span className="speed-arena-btn__pulse" aria-hidden />
                EXPLORE THE ARENA
                <span className="speed-arena-btn__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
