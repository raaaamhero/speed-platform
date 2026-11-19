'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { ParticleField } from './ParticleField'

const SKIP_KEY = 'speed-intro-skipped'

type Props = {
  onComplete: () => void
}

export function IntroSequence({ onComplete }: Props) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [visible, setVisible] = useState(true)
  const done = useRef(onComplete)
  done.current = onComplete

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SKIP_KEY) === '1' || reduced) {
      setVisible(false)
      done.current()
      return
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 600),
      window.setTimeout(() => setPhase(2), 2200),
      window.setTimeout(() => setPhase(3), 4000),
      window.setTimeout(() => setPhase(4), 5800),
      window.setTimeout(() => setPhase(5), 7800),
      window.setTimeout(() => {
        sessionStorage.setItem(SKIP_KEY, '1')
        setVisible(false)
        done.current()
      }, 10500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  function skip() {
    sessionStorage.setItem(SKIP_KEY, '1')
    setVisible(false)
    done.current()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="SPEED cinematic introduction"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,24,36,0.55),#000_70%)]" />
          <ParticleField className="absolute inset-0 h-full w-full" density={40} />

          {/* floodlights awaken in sequence */}
          <div
            className="pointer-events-none absolute left-[8%] top-0 h-[75%] w-[14%] origin-top -rotate-6 bg-gradient-to-b from-white/25 to-transparent blur-2xl transition-opacity duration-1000"
            style={{ opacity: phase >= 1 ? 0.85 : 0 }}
          />
          <div
            className="pointer-events-none absolute right-[12%] top-0 h-[70%] w-[12%] origin-top rotate-8 bg-gradient-to-b from-[var(--speed-gold)]/30 to-transparent blur-2xl transition-opacity duration-1000"
            style={{ opacity: phase >= 1 ? 0.7 : 0 }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[60%] w-[18%] -translate-x-1/2 bg-gradient-to-b from-[var(--speed-crimson)]/25 to-transparent blur-3xl transition-opacity duration-1000"
            style={{ opacity: phase >= 2 ? 0.65 : 0 }}
          />
          <div
            className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--speed-crimson)]/25 blur-[90px] transition-opacity duration-1000"
            style={{ opacity: phase >= 2 ? 0.7 : 0.1 }}
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[var(--speed-gold)]/20 blur-[100px] transition-opacity duration-1000"
            style={{ opacity: phase >= 3 ? 0.85 : 0.1 }}
          />

          <div className="absolute right-5 top-5 z-10 flex gap-2">
            <a
              href="/register"
              className="border border-white/20 px-3 py-1.5 font-display text-[11px] tracking-[0.25em] text-white/70 hover:text-white"
              onClick={skip}
            >
              REGISTER
            </a>
            <button
              type="button"
              onClick={skip}
              className="border border-white/20 px-3 py-1.5 font-display text-[11px] tracking-[0.25em] text-white/70 hover:text-white"
            >
              SKIP INTRO
            </button>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <AnimatePresence mode="wait">
              {phase >= 2 && phase < 4 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/25 bg-black/40 shadow-[0_0_50px_rgba(226,177,74,0.35)] sm:h-28 sm:w-28">
                    <Image
                      src="/brand/sportscom-logo.jpg"
                      alt="SportsCom"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <p className="mt-6 font-display text-sm tracking-[0.45em] text-[var(--speed-gold)] sm:text-base">
                    SPORTSCOM PRESENTS
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="pointer-events-none absolute inset-x-[-20%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--speed-gold)] to-transparent opacity-80" />
                <h1 className="font-display text-[clamp(4.5rem,18vw,9rem)] leading-none tracking-[0.06em] text-white">
                  SPEED
                </h1>
                <p className="mt-2 font-display text-xl tracking-[0.35em] text-white/70 sm:text-2xl">
                  2026–27
                </p>
                <p className="mt-5 font-display text-[clamp(1.15rem,3.5vw,2rem)] tracking-[0.12em] text-[var(--speed-ink)]">
                  WHERE RIVALRIES ARE BORN.
                </p>
              </motion.div>
            )}

            {phase >= 5 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={skip}
                className="speed-cta speed-cta-sweep absolute bottom-14"
              >
                ENTER THE ARENA
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
