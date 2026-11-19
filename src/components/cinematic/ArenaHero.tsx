'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ParticleField } from './ParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export function ArenaHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 140])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15])

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050608]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(200,30,44,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(226,177,74,0.22),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
        {/* floodlight beams */}
        <div className="pointer-events-none absolute left-[12%] top-0 h-[70%] w-[18%] origin-top -rotate-6 bg-gradient-to-b from-white/15 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute right-[18%] top-0 h-[65%] w-[16%] origin-top rotate-6 bg-gradient-to-b from-[var(--speed-gold)]/20 to-transparent blur-2xl" />
        <ParticleField className="absolute inset-0 h-full w-full" density={40} />
        {/* arena oval suggestion */}
        <div className="pointer-events-none absolute bottom-[-20%] left-1/2 h-[55%] w-[140%] -translate-x-1/2 rounded-[100%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.08),transparent_60%)]" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8"
      >
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="font-display text-xs tracking-[0.45em] text-[var(--speed-gold)] sm:text-sm"
        >
          SPORTSCOM PRESENTS · SPEED 2026–27
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-4xl font-display text-[clamp(3rem,10vw,6.5rem)] leading-[0.9] tracking-[0.04em] text-[var(--speed-ink)]"
        >
          WHERE RIVALRIES
          <br />
          ARE BORN.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-6 max-w-md text-lg text-[var(--speed-muted)]"
        >
          12 Teams. One Champion. No Looking Back.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link href="/register" className="speed-cta speed-cta-sweep relative overflow-hidden">
            REGISTER FOR SPEED
          </Link>
          <a href="#sports" className="speed-ghost">
            EXPLORE THE ARENA
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
