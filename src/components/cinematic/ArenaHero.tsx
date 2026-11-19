'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { BubbleField } from '@/components/interaction/BubbleField'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { FireCrackles } from '@/components/interaction/FireCrackles'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export function ArenaHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25])

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-[#050608]">
      {/* Background atmosphere */}
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_15%,rgba(200,30,44,0.4),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_88%_65%,rgba(226,177,74,0.22),transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.9)_100%)]" />
        <div className="speed-flood absolute left-[8%] top-0 h-[75%] w-[16%] origin-top -rotate-6 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
        <div className="speed-flood absolute right-[12%] top-0 h-[70%] w-[20%] origin-top rotate-6 bg-gradient-to-b from-[var(--speed-gold)]/30 to-transparent blur-2xl [animation-delay:1.1s]" />
        <div className="absolute bottom-[-18%] left-1/2 h-[52%] w-[140%] -translate-x-1/2 rounded-[100%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.12),transparent_60%)]" />
      </motion.div>

      {/* Interactive FX — full viewport, clearly visible */}
      <LiveParticleField className="absolute inset-0 z-[1] h-full w-full" />
      <BubbleField className="absolute inset-0 z-[2] h-full w-full" biasRight />
      <FireCrackles className="absolute inset-0 z-[3] h-full w-full" />
      <ElasticStringField
        className="absolute inset-0 z-[4] h-full w-full"
        captureGestures={false}
        interactive
      />

      {/* Soft spotlight follow via CSS — doesn't clip FX */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.06),transparent_42%)]"
        aria-hidden
      />

      {/* Copy */}
      <motion.div
        style={{ opacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8"
      >
        <div className="pointer-events-auto max-w-xl">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-base font-extrabold tracking-[0.18em] text-white sm:text-xl"
            style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
          >
            <span className="font-extrabold text-white">SPORTSCOM</span>{' '}
            <span className="font-semibold tracking-[0.32em] text-[var(--speed-gold)]">PRESENTS</span>
          </motion.p>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.75 }}
            className="mt-3 font-display text-[clamp(1.1rem,3vw,1.6rem)] tracking-[0.28em] text-white/75"
          >
            SPEED 2026–27
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-[clamp(3rem,10vw,6.5rem)] leading-[0.9] tracking-[0.04em] text-[var(--speed-ink)]"
          >
            WHERE RIVALRIES
            <br />
            ARE BORN.
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-6 font-display text-lg tracking-[0.12em] text-white/80"
          >
            12 TEAMS. 9 SPORTS. ONE CHAMPION.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-3 sm:gap-4"
          >
            <Link href="/register" className="speed-cta speed-cta-sweep relative overflow-hidden">
              REGISTER FOR SPEED
            </Link>
            <a href="#sports" className="speed-ghost">
              EXPLORE THE ARENA
            </a>
            <Link href="/standings" className="speed-ghost">
              VIEW STANDINGS
            </Link>
          </motion.div>

          <p className="mt-6 text-[11px] tracking-wide text-white/40 sm:text-xs">
            Move · drag strings · tap for fire crackles
          </p>
        </div>
      </motion.div>
    </section>
  )
}
