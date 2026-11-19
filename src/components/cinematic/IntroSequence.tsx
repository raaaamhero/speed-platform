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
      window.setTimeout(() => setPhase(1), 700),
      window.setTimeout(() => setPhase(2), 2400),
      window.setTimeout(() => setPhase(3), 4200),
      window.setTimeout(() => setPhase(4), 6200),
      window.setTimeout(() => {
        setVisible(false)
        done.current()
      }, 8200),
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
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,24,36,0.55),#000_70%)]" />
          <ParticleField className="absolute inset-0 h-full w-full" density={36} />

          {/* stadium light blooms */}
          <div
            className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--speed-crimson)]/25 blur-[90px] transition-opacity duration-1000"
            style={{ opacity: phase >= 1 ? 0.7 : 0.15 }}
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[var(--speed-gold)]/20 blur-[100px] transition-opacity duration-1000"
            style={{ opacity: phase >= 2 ? 0.8 : 0.1 }}
          />

          <button
            type="button"
            onClick={skip}
            className="absolute right-5 top-5 z-10 border border-white/20 px-3 py-1.5 font-display text-[11px] tracking-[0.25em] text-white/70 hover:text-white"
          >
            SKIP INTRO
          </button>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <AnimatePresence mode="wait">
              {phase >= 1 && phase < 3 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-black/40 sm:h-24 sm:w-24">
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

            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="pointer-events-none absolute inset-x-[-20%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--speed-gold)] to-transparent opacity-70" />
                <h1 className="font-display text-[clamp(4.5rem,18vw,9rem)] leading-none tracking-[0.06em] text-white">
                  SPEED
                </h1>
                <p className="mt-2 font-display text-xl tracking-[0.35em] text-white/70 sm:text-2xl">
                  2026–27
                </p>
                <p className="mt-5 font-display text-[clamp(1.2rem,3.5vw,2rem)] tracking-[0.12em] text-[var(--speed-ink)]">
                  WHERE RIVALRIES ARE BORN.
                </p>
              </motion.div>
            )}

            {phase >= 4 && (
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
