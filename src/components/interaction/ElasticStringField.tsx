'use client'

import { useEffect, useRef } from 'react'
import { clamp, dist, falloff } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  count?: number
  captureGestures?: boolean
  interactive?: boolean
  /**
   * editorial — sparse, evenly spaced, Sarvam-like restraint (hero)
   * arena — denser intro field
   */
  variant?: 'editorial' | 'arena'
}

type Point = { x: number; y: number; ox: number; oy: number; vx: number; vy: number }
type StringModel = { points: Point[]; gold: boolean; width: number }

/**
 * Elegant elastic filaments — physics without visual noise.
 */
export function ElasticStringField({
  className = '',
  count,
  captureGestures = true,
  interactive = true,
  variant = 'editorial',
}: Props) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stringsRef = useRef<StringModel[]>([])
  const pointer = useRef({
    x: 0,
    y: 0,
    down: false,
    inside: false,
    grabString: -1,
    grabPoint: -1,
  })
  const ripples = useRef<{ x: number; y: number; t: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let last = performance.now()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const build = () => {
      const mobile = w < 768
      const n =
        count ??
        (variant === 'editorial'
          ? mobile
            ? 9
            : 14
          : mobile
            ? 14
            : 22)
      const segs = mobile ? 12 : 18
      const strings: StringModel[] = []

      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n
        // Editorial: biased to the right open space, even spacing
        const xNorm =
          variant === 'editorial' ? 0.48 + t * 0.46 : 0.08 + t * 0.84
        const x = xNorm * w
        const points: Point[] = []
        for (let s = 0; s <= segs; s++) {
          const y = (s / segs) * h
          points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
        strings.push({
          points,
          gold: i % 4 === 0,
          width: i % 4 === 0 ? 1.15 : 0.75,
        })
      }
      stringsRef.current = strings
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const influenceRadius = () => Math.min(w, h) * (variant === 'editorial' ? 0.14 : 0.16)
    const grabRadius = () => Math.min(w, h) * 0.04
    const maxDisp = () => Math.min(w, h) * (variant === 'editorial' ? 0.14 : 0.2)

    const step = (dt: number) => {
      const strings = stringsRef.current
      const p = pointer.current
      const radius = influenceRadius()
      const stiffness = variant === 'editorial' ? 210 : 180
      const damping = variant === 'editorial' ? 0.9 : 0.88
      const cap = maxDisp()

      for (let si = 0; si < strings.length; si++) {
        const pts = strings[si].points
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]
          if (i === 0 || i === pts.length - 1) {
            pt.x = pt.ox
            pt.y = pt.oy
            pt.vx = 0
            pt.vy = 0
            continue
          }

          let targetX = pt.ox
          let targetY = pt.oy

          if (interactive && p.inside) {
            const grabbed = p.down && p.grabString === si && p.grabPoint === i
            if (grabbed) {
              targetX = p.x
              targetY = p.y
            } else {
              const d = dist(pt.x, pt.y, p.x, p.y)
              const f = falloff(d, radius)
              if (f > 0) {
                const push = (p.down ? 0.95 : 0.55) * f
                const dx = pt.ox - p.x
                const dy = pt.oy - p.y
                const len = Math.hypot(dx, dy) || 1
                targetX = pt.ox + (dx / len) * cap * push
                targetY = pt.oy + (dy / len) * cap * push * 0.45
              }
            }
          }

          for (const r of ripples.current) {
            const age = (performance.now() - r.t) / 700
            if (age > 1) continue
            const d = dist(pt.ox, pt.oy, r.x, r.y)
            const wave = falloff(d, radius * 1.3) * (1 - age) * Math.sin(age * Math.PI * 2.8)
            const dx = pt.ox - r.x
            const dy = pt.oy - r.y
            const len = Math.hypot(dx, dy) || 1
            targetX += (dx / len) * wave * cap * 0.4
            targetY += (dy / len) * wave * cap * 0.25
          }

          const ax = (targetX - pt.x) * stiffness
          const ay = (targetY - pt.y) * stiffness
          pt.vx = (pt.vx + ax * dt) * damping
          pt.vy = (pt.vy + ay * dt) * damping
          pt.x += pt.vx * dt
          pt.y += pt.vy * dt

          const odx = pt.x - pt.ox
          const ody = pt.y - pt.oy
          const olen = Math.hypot(odx, ody)
          if (olen > cap) {
            pt.x = pt.ox + (odx / olen) * cap
            pt.y = pt.oy + (ody / olen) * cap
          }
        }

        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1]
            const next = pts[i + 1]
            pts[i].x = lerp(pts[i].x, (prev.x + next.x) * 0.5, 0.2)
            pts[i].y = lerp(pts[i].y, (prev.y + next.y) * 0.5, 0.2)
          }
        }
      }

      ripples.current = ripples.current.filter((r) => performance.now() - r.t < 700)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const str of stringsRef.current) {
        const pts = str.points
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length - 1; i++) {
          const c = pts[i]
          const n = pts[i + 1]
          ctx.quadraticCurveTo(c.x, c.y, (c.x + n.x) * 0.5, (c.y + n.y) * 0.5)
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
        ctx.strokeStyle = str.gold
          ? variant === 'editorial'
            ? 'rgba(226,177,74,0.42)'
            : 'rgba(226,177,74,0.55)'
          : variant === 'editorial'
            ? 'rgba(255,255,255,0.16)'
            : 'rgba(255,255,255,0.26)'
        ctx.lineWidth = str.width
        ctx.lineCap = 'round'
        ctx.stroke()

        // Soft bead only when deformed
        let best = pts[Math.floor(pts.length / 2)]
        let bestD = 0
        for (const pt of pts) {
          const d = Math.hypot(pt.x - pt.ox, pt.y - pt.oy)
          if (d > bestD) {
            bestD = d
            best = pt
          }
        }
        if (bestD > 2) {
          ctx.beginPath()
          ctx.arc(best.x, best.y, str.gold ? 2.2 : 1.6, 0, Math.PI * 2)
          ctx.fillStyle = str.gold ? 'rgba(226,177,74,0.85)' : 'rgba(255,255,255,0.55)'
          ctx.fill()
        }
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

    const findGrab = (x: number, y: number) => {
      let bestS = -1
      let bestP = -1
      let bestD = grabRadius()
      stringsRef.current.forEach((str, si) => {
        str.points.forEach((pt, pi) => {
          if (pi === 0 || pi === str.points.length - 1) return
          const d = dist(pt.x, pt.y, x, y)
          if (d < bestD) {
            bestD = d
            bestS = si
            bestP = pi
          }
        })
      })
      return { bestS, bestP }
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.current.x = e.clientX - rect.left
      pointer.current.y = e.clientY - rect.top
      pointer.current.inside = true
    }
    const onDown = (e: PointerEvent) => {
      if (!interactive) return
      if (captureGestures) {
        e.preventDefault()
        canvas.setPointerCapture(e.pointerId)
      }
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      pointer.current.x = x
      pointer.current.y = y
      pointer.current.down = true
      pointer.current.inside = true
      const { bestS, bestP } = findGrab(x, y)
      pointer.current.grabString = bestS
      pointer.current.grabPoint = bestP
      ripples.current.push({ x, y, t: performance.now() })
    }
    const onUp = () => {
      pointer.current.down = false
      pointer.current.grabString = -1
      pointer.current.grabPoint = -1
    }
    const onLeave = () => {
      if (!pointer.current.down) pointer.current.inside = false
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
  }, [captureGestures, count, interactive, reduced, variant])

  if (reduced) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.04) 48px, rgba(255,255,255,0.04) 49px)',
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${captureGestures ? 'touch-none' : ''} ${className}`}
      aria-hidden
      style={{ touchAction: captureGestures ? 'none' : 'pan-y' }}
    />
  )
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
