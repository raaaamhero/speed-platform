'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  density?: number
  color?: string
}

/** Lightweight canvas particles — no Three.js overhead. */
export function ParticleField({ className, density = 48, color = 'rgba(226,177,74,0.55)' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const particles = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.00035,
      vy: -0.00015 - Math.random() * 0.00035,
      a: 0.15 + Math.random() * 0.55,
    }))

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.globalAlpha = p.a
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [color, density, reduced])

  if (reduced) return null
  return <canvas ref={canvasRef} className={className} aria-hidden />
}
