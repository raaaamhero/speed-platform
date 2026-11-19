'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Hero art direction (inspired by Sarvam portfolio restraint):
 * one soft atmosphere, sparse dust, elegant interactive threads on the open right —
 * no stacked bubbles/fire clutter.
 */
export function ArenaHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 80])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35])

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-[#07080b]">
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 z-0">
        {/* Controlled atmosphere — one glow language */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(30,40,70,0.45),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_85%,rgba(180,90,40,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,30,44,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.75)_100%)]" />
        {/* Soft floor glow like Sarvam */}
        <div className="absolute bottom-0 left-1/2 h-[40%] w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.12),transparent_70%)] blur-2xl" />
      </motion.div>

      {/* Sparse dust only */}
      <LiveParticleField className="absolute inset-0 z-[1] h-full w-full opacity-50" density={70} />

      {/* Editorial threads — right side open field */}
      <ElasticStringField
        className="absolute inset-0 z-[2] h-full w-full"
        variant="editorial"
        captureGestures={false}
        interactive
      />

      <motion.div
        style={{ opacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-24 pt-28 sm:px-8"
      >
        <div className="pointer-events-auto max-w-xl lg:max-w-2xl">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65 }}
            className="text-sm font-extrabold tracking-[0.2em] text-white sm:text-base"
            style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
          >
            <span className="text-white">SPORTSCOM</span>{' '}
            <span className="font-semibold tracking-[0.28em] text-[var(--speed-gold)]">PRESENTS</span>
          </motion.p>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.65 }}
            className="mt-4 font-display text-sm tracking-[0.35em] text-white/55 sm:text-base"
          >
            SPEED 2026–27
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[clamp(2.8rem,9vw,5.8rem)] leading-[0.92] tracking-[0.04em] text-[var(--speed-ink)]"
          >
            WHERE RIVALRIES
            <br />
            ARE BORN.
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-6 max-w-md text-base leading-relaxed text-[var(--speed-muted)]"
          >
            12 teams. 9 sports. One champion. Pull a thread — feel the arena respond.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.55 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link href="/register" className="speed-cta speed-cta-sweep relative overflow-hidden">
              REGISTER FOR SPEED
            </Link>
            <a href="#sports" className="speed-ghost">
              EXPLORE THE ARENA
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
