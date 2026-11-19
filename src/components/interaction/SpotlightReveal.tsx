'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { lerp } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  radius?: number
  children?: ReactNode
}

/**
 * Soft arena spotlight that lags behind the pointer — reveals texture without hiding content.
 */
export function SpotlightReveal({ className = '', radius = 280, children }: Props) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0.5, y: 0.35 })
  const current = useRef({ x: 0.5, y: 0.35 })

  useEffect(() => {
    if (reduced) return
    const wrap = wrapRef.current
    const light = lightRef.current
    if (!wrap || !light) return

    let raf = 0
    let running = true

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      target.current.x = (e.clientX - rect.left) / rect.width
      target.current.y = (e.clientY - rect.top) / rect.height
    }
    const onDown = (e: PointerEvent) => onMove(e)

    const loop = () => {
      if (!running) return
      current.current.x = lerp(current.current.x, target.current.x, 0.08)
      current.current.y = lerp(current.current.y, target.current.y, 0.08)
      const x = current.current.x * 100
      const y = current.current.y * 100
      light.style.background = `radial-gradient(${radius}px circle at ${x}% ${y}%, rgba(255,255,255,0.14) 0%, rgba(226,177,74,0.08) 28%, transparent 62%)`
      raf = requestAnimationFrame(loop)
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onDown)
    raf = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onDown)
    }
  }, [radius, reduced])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={lightRef}
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity"
        style={{
          background: reduced
            ? 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08), transparent 55%)'
            : undefined,
        }}
        aria-hidden
      />
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
