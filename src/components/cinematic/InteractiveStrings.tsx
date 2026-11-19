'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  count?: number
}

type Strand = {
  x: number
  phase: number
  amp: number
  speed: number
  hue: number
}

/**
 * Interactive loading filaments — sway on their own, pull toward pointer/touch, pluck on tap.
 */
export function InteractiveStrings({ className = '', count }: Props) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0.5, y: 0.5, active: false })
  const pluck = useRef<{ x: number; y: number; t: number } | null>(null)
  const [strands] = useState<Strand[]>(() => {
    const n = count ?? (typeof window !== 'undefined' && window.innerWidth < 768 ? 7 : 11)
    return Array.from({ length: n }, (_, i) => ({
      x: (i + 0.6) / (n + 0.2),
      phase: Math.random() * Math.PI * 2,
      amp: 10 + Math.random() * 18,
      speed: 0.6 + Math.random() * 0.9,
      hue: i % 2 === 0 ? 42 : 0,
    }))
  })

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      ctx.clearRect(0, 0, w, h)
      const px = pointer.current.x * w
      const py = pointer.current.y * h
      const active = pointer.current.active

      for (const s of strands) {
        const baseX = s.x * w
        const sway = Math.sin(t * s.speed + s.phase) * s.amp
        let midX = baseX + sway
        let midY = h * 0.48 + Math.cos(t * s.speed * 0.7 + s.phase) * (s.amp * 0.4)

        if (active) {
          const dx = px - midX
          const dy = py - midY
          const dist = Math.hypot(dx, dy) || 1
          const pull = Math.max(0, 1 - dist / (w * 0.45))
          midX += dx * pull * 0.35
          midY += dy * pull * 0.25
        }

        if (pluck.current) {
          const age = (performance.now() - pluck.current.t) / 700
          if (age < 1) {
            const dx = pluck.current.x - midX
            const dy = pluck.current.y - midY
            const dist = Math.hypot(dx, dy) || 1
            const hit = Math.max(0, 1 - dist / 140) * (1 - age) * Math.sin(age * Math.PI * 4)
            midX += (dx / dist) * hit * 40
            midY += (dy / dist) * hit * 28
          }
        }

        const gold = s.hue === 42
        ctx.beginPath()
        ctx.moveTo(baseX, 0)
        ctx.quadraticCurveTo(midX, midY, baseX + sway * 0.2, h)
        ctx.strokeStyle = gold ? 'rgba(226,177,74,0.55)' : 'rgba(255,255,255,0.28)'
        ctx.lineWidth = gold ? 1.4 : 1
        ctx.stroke()

        // interactive bead
        ctx.beginPath()
        ctx.arc(midX, midY, active ? 3.2 : 2.2, 0, Math.PI * 2)
        ctx.fillStyle = gold ? 'rgba(226,177,74,0.9)' : 'rgba(255,255,255,0.65)'
        ctx.fill()
      }
    },
    [strands],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth: w, clientHeight: h } = canvas
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = (now: number) => {
      if (!running) return
      draw(ctx, canvas.clientWidth, canvas.clientHeight, now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [draw, reduced])

  function setPointer(clientX: number, clientY: number, active: boolean) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    pointer.current = {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      active,
    }
  }

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className={`touch-none ${className}`}
      aria-hidden
      onPointerMove={(e) => setPointer(e.clientX, e.clientY, true)}
      onPointerDown={(e) => {
        setPointer(e.clientX, e.clientY, true)
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        pluck.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          t: performance.now(),
        }
      }}
      onPointerLeave={() => {
        pointer.current.active = false
      }}
      onPointerUp={() => {
        pointer.current.active = false
      }}
    />
  )
}
