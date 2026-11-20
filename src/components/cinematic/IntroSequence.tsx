'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ElasticStringField } from '@/components/interaction/ElasticStringField'
import { LiveParticleField } from '@/components/interaction/LiveParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { armEpicAudioUnlock, cueEpicAtSpeedReveal } from './audio-engine'
import { LetterReveal } from './LetterReveal'

const SKIP_KEY = 'speed-intro-skipped'

type Props = {
  onComplete: () => void
}

/** Pointer-reactive SportsCom crest for the heroic brand beat. */
function HeroicCrest() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 18 })
  const sy = useSpring(my, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(sy, [-40, 40], [10, -10])
  const rotateY = useTransform(sx, [-40, 40], [-12, 12])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 700 }}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        mx.set(e.clientX - (r.left + r.width / 2))
        my.set(e.clientY - (r.top + r.height / 2))
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      className="relative mb-8 cursor-crosshair"
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Expanding gold shockwaves */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--speed-gold)]/40 sm:h-28 sm:w-28"
          initial={{ scale: 0.6, opacity: 0.55 }}
          animate={{ scale: [0.7, 2.4 + i * 0.35], opacity: [0.5, 0] }}
          transition={{
            duration: 2.4,
            delay: 0.35 + i * 0.35,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: 'easeOut',
          }}
        />
      ))}
      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-[var(--speed-gold)]/50 shadow-[0_0_60px_rgba(226,177,74,0.55)] sm:h-28 sm:w-28">
        <Image
          src="/brand/sportscom-logo.jpg"
          alt="SportsCom"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent"
          animate={{ x: ['-120%', '120%'] }}
          transition={{ duration: 2.8, delay: 0.6, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
        />
      </div>
      <p className="mt-4 text-center font-display text-[10px] tracking-[0.45em] text-[var(--speed-gold)]/80">
        MOVE OVER THE CREST
      </p>
    </motion.div>
  )
}

export function IntroSequence({ onComplete }: Props) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [visible, setVisible] = useState(true)
  const [loadPct, setLoadPct] = useState(0)
  const done = useRef(onComplete)
  const audioCued = useRef(false)
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

    // Unlock audio as soon as they touch/pluck during the intro
    armEpicAudioUnlock()

    // Longer brand beat — crest → SPORTSCOM → PRESENTS → SPEED
    const timers = [
      window.setTimeout(() => setPhase(1), 350),
      window.setTimeout(() => setPhase(2), 2400),
      window.setTimeout(() => setPhase(3), 5200),
      window.setTimeout(() => setPhase(4), 7600),
      window.setTimeout(() => setPhase(5), 9400),
      window.setTimeout(() => {
        sessionStorage.setItem(SKIP_KEY, '1')
        setVisible(false)
        done.current()
      }, 13000),
    ]

    const loadTimer = window.setInterval(() => {
      setLoadPct((p) => Math.min(100, p + (p < 70 ? 2.5 : 1.5)))
    }, 140)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(loadTimer)
    }
  }, [reduced])

  // SPEED title flash → one-shot fanfare only
  useEffect(() => {
    if (phase >= 4 && visible && !reduced && !audioCued.current) {
      audioCued.current = true
      void cueEpicAtSpeedReveal()
    }
  }, [phase, visible, reduced])

  function skip() {
    sessionStorage.setItem(SKIP_KEY, '1')
    if (phase >= 4 && !audioCued.current) {
      audioCued.current = true
      void cueEpicAtSpeedReveal()
    }
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,22,36,0.9),#000_68%)]" />
          {/* Heroic vignette that breathes with the brand beat */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{
              background:
                phase >= 2
                  ? [
                      'radial-gradient(ellipse at 50% 42%, rgba(226,177,74,0.14), transparent 55%)',
                      'radial-gradient(ellipse at 50% 42%, rgba(226,177,74,0.22), transparent 58%)',
                      'radial-gradient(ellipse at 50% 42%, rgba(226,177,74,0.12), transparent 55%)',
                    ]
                  : 'radial-gradient(ellipse at 50% 70%, rgba(226,177,74,0.08), transparent 60%)',
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <LiveParticleField
            className="absolute inset-0 z-0 h-full w-full opacity-25"
            density={phase >= 4 ? 16 : phase >= 2 ? 28 : 22}
          />
          {phase < 4 && (
            <ElasticStringField
              className="absolute inset-0 z-[1] h-full w-full"
              variant="intro"
              interactive
            />
          )}

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
                  exit={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55 }}
                  className="flex w-full max-w-4xl flex-col items-center text-center"
                >
                  <HeroicCrest />
                  <LetterReveal
                    text="SPORTSCOM"
                    as="h1"
                    firstFromFar
                    delay={0.15}
                    stagger={0.08}
                    className="w-full justify-center text-[clamp(2.8rem,11vw,5.5rem)] font-extrabold leading-none tracking-[0.06em] text-white drop-shadow-[0_0_40px_rgba(226,177,74,0.25)]"
                    style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
                  />
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 1.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-5 h-px w-40 origin-center bg-gradient-to-r from-transparent via-[var(--speed-gold)] to-transparent sm:w-56"
                  />
                  <LetterReveal
                    text="PRESENTS"
                    as="p"
                    delay={1.25}
                    stagger={0.06}
                    className="mt-4 w-full justify-center font-display text-[clamp(1.25rem,4vw,2rem)] tracking-[0.42em] text-[var(--speed-gold)]"
                  />
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.1, duration: 0.55 }}
                    className="mt-6 max-w-sm text-xs tracking-[0.18em] text-white/45"
                  >
                    THE SPORTS COMMITTEE · TAPMI
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {phase >= 4 && (
              <motion.div
                key="speed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="flex w-full max-w-4xl flex-col items-center text-center"
              >
                <motion.h1
                  initial={reduced ? false : { opacity: 0, y: 36, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                  className="font-speed-title text-[clamp(4.2rem,18vw,9rem)] leading-[0.88] text-white will-change-transform"
                  style={{ transform: 'translateZ(0)' }}
                >
                  SPEED
                  <br />
                  <span className="text-[0.72em] text-[var(--speed-gold)]">2026–27</span>
                </motion.h1>

                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 font-display text-[clamp(0.95rem,3vw,1.5rem)] tracking-[0.14em] text-white/75"
                >
                  REGISTER FOR SPEED.
                </motion.p>

                {phase >= 5 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03 }}
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
