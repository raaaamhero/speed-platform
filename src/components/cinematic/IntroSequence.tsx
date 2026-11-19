'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { InteractiveTitle } from '@/components/interaction/InteractiveTitle'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { LetterReveal } from './LetterReveal'

const SKIP_KEY = 'speed-intro-skipped'

type Props = {
  onComplete: () => void
}

export function IntroSequence({ onComplete }: Props) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loadPct, setLoadPct] = useState(0)
  const done = useRef(onComplete)
  done.current = onComplete

  useEffect(() => {
    if (typeof window === 'undefined') return
    const forceReplay = new URLSearchParams(window.location.search).has('intro')
    if (forceReplay) sessionStorage.removeItem(SKIP_KEY)
    if ((!forceReplay && sessionStorage.getItem(SKIP_KEY) === '1') || reduced) {
      setVisible(false)
      done.current()
      return
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 400),
      window.setTimeout(() => setPhase(2), 2200),
      window.setTimeout(() => setPhase(3), 4200),
      window.setTimeout(() => setPhase(4), 6000),
      window.setTimeout(() => setPhase(5), 7600),
      window.setTimeout(() => {
        sessionStorage.setItem(SKIP_KEY, '1')
        setVisible(false)
        done.current()
      }, 11000),
    ]

    const loadTimer = window.setInterval(() => {
      setLoadPct((p) => Math.min(100, p + (p < 70 ? 3 : 2)))
    }, 140)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(loadTimer)
    }
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
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="SPEED cinematic introduction"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,18,28,0.8),#000_70%)]" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[45%] w-[65%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.1),transparent_70%)] blur-2xl" />
          <LiveParticleField className="absolute inset-0 z-0 h-full w-full opacity-40" density={55} />
          <ElasticStringField
            className="absolute inset-0 z-[1] h-full w-full"
            variant="arena"
            captureGestures
            interactive
          />

          <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-5 sm:top-5">
            <a
              href="/register"
              className="min-h-10 border border-white/25 px-3 py-2 font-display text-[11px] tracking-[0.22em] text-white/80 hover:text-white"
              onClick={skip}
            >
              REGISTER
            </a>
            <button
              type="button"
              onClick={skip}
              className="min-h-10 border border-white/25 px-3 py-2 font-display text-[11px] tracking-[0.22em] text-white/80 hover:text-white"
            >
              SKIP
            </button>
          </div>

          {/* Center stage — single stacked column, nothing absolute overlapping copy */}
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-5">
            {phase < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-16 left-0 right-0 px-6 text-center"
              >
                <p
                  className="text-xs font-semibold tracking-[0.35em] text-white/55"
                  style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
                >
                  TUNING THE ARENA
                </p>
                <div className="mx-auto mt-3 h-[2px] max-w-xs overflow-hidden bg-white/10">
                  <div
                    className="h-full bg-[var(--speed-gold)] transition-[width] duration-150"
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
                <p className="mt-3 text-[11px] text-white/45">Pull a thread. Click to pluck it.</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {phase >= 2 && phase < 4 && (
                <motion.div
                  key="sportscom"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex w-full max-w-3xl flex-col items-center text-center"
                >
                  <div className="relative mb-7 h-16 w-16 overflow-hidden rounded-full border border-white/30 shadow-[0_0_40px_rgba(226,177,74,0.35)] sm:h-20 sm:w-20">
                    <Image
                      src="/brand/sportscom-logo.jpg"
                      alt="SportsCom"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <LetterReveal
                    text="SPORTSCOM"
                    as="h1"
                    firstFromFar
                    delay={0.05}
                    stagger={0.07}
                    className="w-full justify-center text-[clamp(2.4rem,9vw,4.5rem)] font-extrabold leading-none tracking-[0.06em] text-white"
                    style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
                  />
                  <LetterReveal
                    text="PRESENTS"
                    as="p"
                    delay={0.85}
                    stagger={0.05}
                    className="mt-4 w-full justify-center font-display text-[clamp(1.1rem,3.5vw,1.75rem)] tracking-[0.4em] text-[var(--speed-gold)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {phase >= 4 && (
              <motion.div
                key="speed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex w-full max-w-4xl flex-col items-center text-center"
              >
                <InteractiveTitle className="mx-auto block text-[clamp(3.8rem,15vw,7.5rem)]" />

                <p className="mt-3 font-display text-xl tracking-[0.32em] text-white/75 sm:text-2xl">
                  2026–27
                </p>

                <p className="mt-5 max-w-[95vw] font-display text-[clamp(0.95rem,3vw,1.65rem)] tracking-[0.12em] text-[var(--speed-ink)]">
                  WHERE RIVALRIES ARE BORN.
                </p>

                {phase >= 5 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={skip}
                    className="speed-cta speed-cta-sweep mt-10"
                  >
                    ENTER THE ARENA
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
