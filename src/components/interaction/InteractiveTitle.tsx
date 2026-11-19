'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { lerp } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  text?: string
  className?: string
}

/**
 * Oversized SPEED title with pointer-driven light sweep and subtle letter response.
 */
export function InteractiveTitle({ text = 'SPEED', className = '' }: Props) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLHeadingElement>(null)
  const shineRef = useRef<HTMLSpanElement>(null)
  const [scatter, setScatter] = useState(false)
  const target = useRef(0.35)
  const current = useRef(0.35)

  useEffect(() => {
    if (reduced) return
    const wrap = wrapRef.current
    const shine = shineRef.current
    if (!wrap || !shine) return

    let raf = 0
    let running = true

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      target.current = (e.clientX - rect.left) / rect.width
    }

    const loop = () => {
      if (!running) return
      current.current = lerp(current.current, target.current, 0.1)
      const x = current.current * 100
      shine.style.background = `linear-gradient(105deg, transparent ${x - 14}%, rgba(255,255,255,0.55) ${x}%, transparent ${x + 14}%)`
      raf = requestAnimationFrame(loop)
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onMove)
    }
  }, [reduced])

  const letters = text.split('')

  return (
    <h1
      ref={wrapRef}
      className={`relative inline-block select-none font-display leading-none tracking-[0.06em] text-white ${className}`}
      onClick={() => {
        if (reduced) return
        setScatter(true)
        window.setTimeout(() => setScatter(false), 700)
      }}
      aria-label={text}
    >
      <span className="relative z-[1] inline-flex">
        {letters.map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block"
            animate={
              scatter
                ? { y: (i % 2 === 0 ? -18 : 16), x: (i - letters.length / 2) * 8, rotate: (i % 2 ? 8 : -8) }
                : { y: 0, x: 0, rotate: 0 }
            }
            transition={{ type: 'spring', stiffness: 320, damping: 18, delay: i * 0.02 }}
            whileHover={reduced ? undefined : { y: -4, color: '#e2b14a' }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
      <span
        ref={shineRef}
        className="pointer-events-none absolute inset-0 z-[2] mix-blend-overlay"
        aria-hidden
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 45%, transparent 60%)',
        }}
      />
    </h1>
  )
}
