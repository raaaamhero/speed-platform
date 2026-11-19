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
      window.setTimeout(() => setPhase(5), 7800),
      window.setTimeout(() => {
        sessionStorage.setItem(SKIP_KEY, '1')
        setVisible(false)
        done.current()
      }, 10500),
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
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="SPEED cinematic introduction"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,20,28,0.75),#000_72%)]" />
          <LiveParticleField className="absolute inset-0 z-0 h-full w-full opacity-80" />
          <ElasticStringField
            className="absolute inset-0 z-[1] h-full w-full"
            captureGestures
            interactive
          />

          <div
            className="pointer-events-none absolute left-[10%] top-0 z-[2] h-[70%] w-[12%] origin-top -rotate-6 bg-gradient-to-b from-white/18 to-transparent blur-2xl transition-opacity duration-700"
            style={{ opacity: phase >= 1 ? 0.75 : 0.12 }}
          />
          <div
            className="pointer-events-none absolute right-[14%] top-0 z-[2] h-[65%] w-[11%] origin-top rotate-7 bg-gradient-to-b from-[var(--speed-gold)]/25 to-transparent blur-2xl transition-opacity duration-700"
            style={{ opacity: phase >= 1 ? 0.65 : 0.1 }}
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

          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
            {phase < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute bottom-16 left-0 right-0 px-6"
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
                <p className="mt-3 text-[11px] text-white/45">
                  Drag the strings · press for ripples
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {phase >= 2 && phase < 4 && (
                <motion.div
                  key="sportscom"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.55 }}
                  className="pointer-events-auto flex flex-col items-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="relative mb-7 h-16 w-16 overflow-hidden rounded-full border border-white/30 shadow-[0_0_40px_rgba(226,177,74,0.35)] sm:h-20 sm:w-20"
                  >
                    <Image
                      src="/brand/sportscom-logo.jpg"
                      alt="SportsCom"
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>

                  <LetterReveal
                    text="SPORTSCOM"
                    as="h1"
                    firstFromFar
                    delay={0.05}
                    stagger={0.07}
                    className="text-[clamp(2.6rem,10vw,4.75rem)] font-extrabold leading-none tracking-[0.06em] text-white"
                    style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
                  />

                  <LetterReveal
                    text="PRESENTS"
                    as="p"
                    delay={0.85}
                    stagger={0.05}
                    className="mt-4 font-display text-[clamp(1.15rem,4vw,1.85rem)] tracking-[0.4em] text-[var(--speed-gold)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {phase >= 4 && (
              <motion.div
                key="speed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-auto relative"
              >
                <div className="pointer-events-none absolute inset-x-[-18%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--speed-gold)] to-transparent opacity-70" />
                <InteractiveTitle className="text-[clamp(4.2rem,17vw,8.5rem)]" />
                <LetterReveal
                  text="2026–27"
                  as="p"
                  delay={0.35}
                  stagger={0.04}
                  className="mt-3 font-display text-xl tracking-[0.32em] text-white/75 sm:text-2xl"
                />
                <LetterReveal
                  text="WHERE RIVALRIES ARE BORN"
                  as="p"
                  delay={0.65}
                  stagger={0.025}
                  className="mt-5 font-display text-[clamp(1rem,3.2vw,1.7rem)] tracking-[0.1em] text-[var(--speed-ink)]"
                />
              </motion.div>
            )}

            {phase >= 5 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={skip}
                className="speed-cta speed-cta-sweep pointer-events-auto absolute bottom-12 sm:bottom-14"
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
