'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Lightweight CSS-3D trophy — drag to rotate, tap for championship message.
 * No external 3D assets required.
 */
export function TrophyInteraction() {
  const reduced = useReducedMotion()
  const [message, setMessage] = useState(false)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const rotX = useMotionValue(12)
  const rotY = useMotionValue(-18)
  const sX = useSpring(rotX, { stiffness: 120, damping: 18 })
  const sY = useSpring(rotY, { stiffness: 120, damping: 18 })
  const shine = useTransform(sY, [-40, 40], ['20%', '80%'])

  return (
    <section className="border-t border-white/10 bg-[#050608] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="speed-kicker">THE TITLE</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-white sm:text-5xl">
            One champion.
          </h2>
          <p className="mt-4 max-w-md text-[var(--speed-muted)]">
            Drag the trophy. Tap it for the call. Built for SPEED — not a stock icon.
          </p>
          {message && (
            <p className="mt-6 font-display text-2xl tracking-[0.08em] text-[var(--speed-gold)]">
              WHERE RIVALRIES ARE BORN.
            </p>
          )}
        </div>

        <div
          className="relative mx-auto flex h-[320px] w-full max-w-sm touch-none items-center justify-center perspective-[900px]"
          onPointerDown={(e) => {
            if (reduced) return
            dragging.current = true
            last.current = { x: e.clientX, y: e.clientY }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!dragging.current || reduced) return
            const dx = e.clientX - last.current.x
            const dy = e.clientY - last.current.y
            last.current = { x: e.clientX, y: e.clientY }
            rotY.set(Math.max(-48, Math.min(48, rotY.get() + dx * 0.35)))
            rotX.set(Math.max(-8, Math.min(28, rotX.get() - dy * 0.25)))
          }}
          onPointerUp={() => {
            dragging.current = false
          }}
          onClick={() => setMessage(true)}
          role="img"
          aria-label="Interactive SPEED championship trophy"
        >
          <motion.div
            style={{
              rotateX: reduced ? 12 : sX,
              rotateY: reduced ? -18 : sY,
              transformStyle: 'preserve-3d',
            }}
            className="relative h-56 w-40"
            animate={reduced ? undefined : { rotateY: [-22, -14, -22] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Cup */}
            <div
              className="absolute left-1/2 top-6 h-28 w-28 -translate-x-1/2 rounded-b-[45%] rounded-t-[40%] border border-[var(--speed-gold)]/50"
              style={{
                background: `linear-gradient(135deg, #f5e6b8, #e2b14a 45%, #8a6a20)`,
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.25)',
                transform: 'translateZ(12px)',
              }}
            />
            {/* Handles */}
            <div
              className="absolute left-2 top-14 h-16 w-10 rounded-full border-2 border-[var(--speed-gold)]/70"
              style={{ transform: 'translateZ(6px)' }}
            />
            <div
              className="absolute right-2 top-14 h-16 w-10 rounded-full border-2 border-[var(--speed-gold)]/70"
              style={{ transform: 'translateZ(6px)' }}
            />
            {/* Stem */}
            <div
              className="absolute left-1/2 top-[9.5rem] h-14 w-6 -translate-x-1/2 bg-gradient-to-b from-[#e2b14a] to-[#6b5218]"
              style={{ transform: 'translateZ(8px)' }}
            />
            {/* Base */}
            <div
              className="absolute bottom-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#c9a24a] to-[#5c4514]"
              style={{ transform: 'translateZ(4px)' }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full opacity-40 mix-blend-screen"
              style={{
                background: `radial-gradient(circle at ${shine}, rgba(255,255,255,0.55), transparent 45%)`,
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
