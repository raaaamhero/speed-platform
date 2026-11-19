'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { lerp } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  text?: string
  className?: string
}

/**
 * Oversized SPEED title — clean centered letters with a soft pointer light sweep.
 */
export function InteractiveTitle({ text = 'SPEED', className = '' }: Props) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLHeadingElement>(null)
  const shineRef = useRef<HTMLSpanElement>(null)
  const target = useRef(0.4)
  const current = useRef(0.4)

  useEffect(() => {
    if (reduced) return
    const wrap = wrapRef.current
    const shine = shineRef.current
    if (!wrap || !shine) return

    let raf = 0
    let running = true

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      target.current = (e.clientX - rect.left) / Math.max(rect.width, 1)
    }

    const loop = () => {
      if (!running) return
      current.current = lerp(current.current, target.current, 0.1)
      const x = current.current * 100
      shine.style.backgroundPosition = `${x}% 50%`
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
      className={`relative mx-auto block w-fit select-none text-center font-display leading-none tracking-[0.08em] text-white ${className}`}
      aria-label={text}
    >
      <span className="relative z-[1] flex justify-center">
        {letters.map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
      {!reduced && (
        <span
          ref={shineRef}
          className="pointer-events-none absolute inset-y-0 left-0 right-0 z-[2] opacity-50"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'soft-light',
          }}
        />
      )}
    </h1>
  )
}
