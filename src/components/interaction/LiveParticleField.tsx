'use client'

import { useEffect, useRef } from 'react'
import { clamp, dist, falloff } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  density?: number
}

type Particle = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  r: number
  a: number
  gold: boolean
}

/**
 * Living particle dust — rests in composition, recoils from pointer, ripples on press.
 */
export function LiveParticleField({ className = '', density }: Props) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let last = performance.now()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: 0, y: 0, down: false, inside: false }
    const ripples: { x: number; y: number; t: number }[] = []
    let particles: Particle[] = []

    const build = () => {
      const n = density ?? (w < 768 ? 90 : 180)
      particles = Array.from({ length: n }, (_, i) => {
        // Deliberate composition: denser mid-band + soft vignette edges
        const band = i % 5 === 0 ? 0.35 + Math.random() * 0.3 : Math.random()
        const ox = (0.05 + Math.random() * 0.9) * w
        const oy = (0.08 + band * 0.84) * h
        return {
          x: ox,
          y: oy,
          ox,
          oy,
          vx: 0,
          vy: 0,
          r: 0.5 + Math.random() * 1.4,
          a: 0.18 + Math.random() * 0.45,
          gold: i % 4 === 0,
        }
      })
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const radius = () => Math.min(w, h) * 0.18

    const step = (dt: number) => {
      const R = radius()
      for (const p of particles) {
        let tx = p.ox
        let ty = p.oy

        if (pointer.inside) {
          const d = dist(p.x, p.y, pointer.x, pointer.y)
          const f = falloff(d, R)
          if (f > 0) {
            const dx = p.ox - pointer.x
            const dy = p.oy - pointer.y
            const len = Math.hypot(dx, dy) || 1
            const push = (pointer.down ? 55 : 38) * f
            tx = p.ox + (dx / len) * push
            ty = p.oy + (dy / len) * push
          }
        }

        for (const r of ripples) {
          const age = (performance.now() - r.t) / 700
          if (age > 1) continue
          const d = dist(p.ox, p.oy, r.x, r.y)
          const wave = falloff(d, R * 1.6) * (1 - age) * Math.sin(age * Math.PI * 2.5)
          const dx = p.ox - r.x
          const dy = p.oy - r.y
          const len = Math.hypot(dx, dy) || 1
          tx += (dx / len) * wave * 70
          ty += (dy / len) * wave * 70
        }

        p.vx = (p.vx + (tx - p.x) * 14 * dt) * 0.9
        p.vy = (p.vy + (ty - p.y) * 14 * dt) * 0.9
        p.x += p.vx
        p.y += p.vy
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (performance.now() - ripples[i].t > 750) ripples.splice(i, 1)
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        ctx.beginPath()
        ctx.globalAlpha = p.a
        ctx.fillStyle = p.gold ? 'rgba(226,177,74,0.9)' : 'rgba(255,255,255,0.75)'
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      if (!running) return
      const dt = clamp((now - last) / 1000, 0.001, 0.033)
      last = now
      step(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMove = (e: PointerEvent) => {
      const { x, y } = local(e)
      pointer.x = x
      pointer.y = y
      pointer.inside = true
    }
    const onDown = (e: PointerEvent) => {
      const { x, y } = local(e)
      pointer.x = x
      pointer.y = y
      pointer.down = true
      pointer.inside = true
      ripples.push({ x, y, t: performance.now() })
    }
    const onUp = () => {
      pointer.down = false
    }
    const onLeave = () => {
      if (!pointer.down) pointer.inside = false
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [density, reduced])

  if (reduced) return null
  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ touchAction: 'pan-y' }}
    />
  )
}
