'use client'

import { useEffect, useRef } from 'react'
import { clamp, dist, falloff } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  /** Bias bubbles toward the right side of the hero (empty visual space). */
  biasRight?: boolean
}

type Bubble = {
  x: number
  y: number
  ox: number
  oy: number
  r: number
  vx: number
  vy: number
  a: number
  gold: boolean
}

export function BubbleField({ className = '', biasRight = true }: Props) {
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
    let bubbles: Bubble[] = []

    const build = () => {
      const n = w < 768 ? 28 : 48
      bubbles = Array.from({ length: n }, () => {
        const ox = biasRight
          ? (0.42 + Math.random() * 0.52) * w
          : Math.random() * w
        const oy = (0.1 + Math.random() * 0.8) * h
        return {
          x: ox,
          y: oy,
          ox,
          oy,
          r: 4 + Math.random() * 18,
          vx: 0,
          vy: -0.15 - Math.random() * 0.35,
          a: 0.12 + Math.random() * 0.28,
          gold: Math.random() > 0.55,
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

    const step = (dt: number) => {
      const R = Math.min(w, h) * 0.2
      for (const b of bubbles) {
        // Slow rise + drift
        b.oy += b.vy * dt * 40
        if (b.oy < -b.r * 2) {
          b.oy = h + b.r
          b.ox = biasRight ? (0.42 + Math.random() * 0.52) * w : Math.random() * w
        }
        b.ox += Math.sin(performance.now() * 0.0006 + b.r) * 0.15

        let tx = b.ox
        let ty = b.oy

        if (pointer.inside) {
          const d = dist(b.x, b.y, pointer.x, pointer.y)
          const f = falloff(d, R)
          if (f > 0) {
            const dx = b.x - pointer.x
            const dy = b.y - pointer.y
            const len = Math.hypot(dx, dy) || 1
            const push = (pointer.down ? 90 : 55) * f
            tx = b.ox + (dx / len) * push
            ty = b.oy + (dy / len) * push
          }
        }

        b.vx = (b.vx + (tx - b.x) * 10 * dt) * 0.9
        b.vy = (b.vy + (ty - b.y) * 10 * dt) * 0.9
        b.x += b.vx
        b.y += b.vy
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const b of bubbles) {
        const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, 0, b.x, b.y, b.r)
        if (b.gold) {
          grad.addColorStop(0, `rgba(255,230,160,${b.a + 0.15})`)
          grad.addColorStop(0.45, `rgba(226,177,74,${b.a})`)
          grad.addColorStop(1, 'rgba(226,177,74,0)')
        } else {
          grad.addColorStop(0, `rgba(255,255,255,${b.a + 0.12})`)
          grad.addColorStop(0.5, `rgba(200,220,255,${b.a * 0.7})`)
          grad.addColorStop(1, 'rgba(255,255,255,0)')
        }
        ctx.beginPath()
        ctx.fillStyle = grad
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        // Specular highlight
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${b.a * 0.8})`
        ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.32, Math.max(1.2, b.r * 0.18), 0, Math.PI * 2)
        ctx.fill()
      }
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
      const p = local(e)
      pointer.x = p.x
      pointer.y = p.y
      pointer.inside = true
    }
    const onDown = (e: PointerEvent) => {
      const p = local(e)
      pointer.x = p.x
      pointer.y = p.y
      pointer.down = true
      pointer.inside = true
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
  }, [biasRight, reduced])

  if (reduced) return null
  return <canvas ref={canvasRef} className={className} aria-hidden style={{ touchAction: 'pan-y' }} />
}
