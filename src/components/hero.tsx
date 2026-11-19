'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="speed-arena absolute inset-0" aria-hidden />
      <div className="speed-vignette absolute inset-0" aria-hidden />
      <div className="speed-grain absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
        <motion.p
          className="font-display text-xs tracking-[0.4em] text-[var(--speed-gold)] sm:text-sm"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          SPORTSCOM PRESENTS
        </motion.p>

        <motion.h1
          className="mt-3 font-display text-[clamp(4.5rem,18vw,9.5rem)] leading-[0.85] tracking-[0.04em] text-[var(--speed-ink)]"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.25 }}
        >
          SPEED
        </motion.h1>

        <motion.p
          className="mt-2 font-display text-[clamp(1.35rem,4vw,2.35rem)] tracking-[0.08em] text-[var(--speed-ink)]"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
        >
          REGISTER FOR SPEED.
        </motion.p>

        <motion.p
          className="mt-5 max-w-md text-base text-[var(--speed-muted)] sm:text-lg"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          Your SPEED journey begins with registration.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/register" className="speed-cta">
            Register for SPEED
          </Link>
          <Link href="/standings" className="speed-ghost">
            View standings
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
