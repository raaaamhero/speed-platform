'use client'

import { useEffect, useRef } from 'react'
import { clamp, dist, falloff } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  /** Target string count — fewer on mobile for performance */
  count?: number
  /** Capture gestures (intro). When false, only hover-influence; page can scroll. */
  captureGestures?: boolean
  interactive?: boolean
}

type Point = { x: number; y: number; ox: number; oy: number; vx: number; vy: number }

type StringModel = {
  points: Point[]
  gold: boolean
  width: number
}

/**
 * Signature elastic string field — vertical metallic filaments with real spring physics.
 * Visual language matches the approved SPEED intro strings (fine gold/white lines + beads).
 */
export function ElasticStringField({
  className = '',
  count,
  captureGestures = true,
  interactive = true,
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
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

    const build = () => {
      const mobile = w < 768
      const n = count ?? (mobile ? 18 : 42)
      const segs = mobile ? 14 : 22
      const strings: StringModel[] = []
      for (let i = 0; i < n; i++) {
        // Deliberate spacing — slight clustering, not random spider web
        const t = (i + 0.5) / n
        const wave = Math.sin(i * 0.7) * 0.012
        const x = (0.06 + t * 0.88 + wave) * w
        const points: Point[] = []
        for (let s = 0; s <= segs; s++) {
          const y = (s / segs) * h
          points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
        strings.push({
          points,
          gold: i % 3 === 0,
          width: i % 3 === 0 ? 1.35 : 0.9,
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

    const influenceRadius = () => Math.min(w, h) * 0.16
    const grabRadius = () => Math.min(w, h) * 0.045

    const step = (dt: number) => {
      const strings = stringsRef.current
      const p = pointer.current
      const radius = influenceRadius()
      const stiffness = 180
      const damping = 0.88
      const maxDisp = Math.min(w, h) * 0.22

      for (let si = 0; si < strings.length; si++) {
        const str = strings[si]
        const pts = str.points
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]
          // Fixed ends
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
                // Bend away from pointer (elastic push), stronger when pressed
                const push = (p.down ? 1.15 : 0.72) * f
                const dx = pt.ox - p.x
                const dy = pt.oy - p.y
                const len = Math.hypot(dx, dy) || 1
                targetX = pt.ox + (dx / len) * maxDisp * push
                targetY = pt.oy + (dy / len) * maxDisp * push * 0.55
              }
            }
          }

          // Ripple impulses
          for (const r of ripples.current) {
            const age = (performance.now() - r.t) / 650
            if (age > 1) continue
            const d = dist(pt.ox, pt.oy, r.x, r.y)
            const wave = falloff(d, radius * 1.4) * (1 - age) * Math.sin(age * Math.PI * 3)
            const dx = pt.ox - r.x
            const dy = pt.oy - r.y
            const len = Math.hypot(dx, dy) || 1
            targetX += (dx / len) * wave * maxDisp * 0.55
            targetY += (dy / len) * wave * maxDisp * 0.35
          }

          // Spring toward target
          const ax = (targetX - pt.x) * stiffness
          const ay = (targetY - pt.y) * stiffness
          pt.vx = (pt.vx + ax * dt) * damping
          pt.vy = (pt.vy + ay * dt) * damping
          pt.x += pt.vx * dt
          pt.y += pt.vy * dt

          // Bound displacement from rest
          const odx = pt.x - pt.ox
          const ody = pt.y - pt.oy
          const olen = Math.hypot(odx, ody)
          if (olen > maxDisp) {
            pt.x = pt.ox + (odx / olen) * maxDisp
            pt.y = pt.oy + (ody / olen) * maxDisp
          }
        }

        // Neighbor constraint — keep segments roughly even (elastic chain)
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < pts.length - 1; i++) {
            const prev = pts[i - 1]
            const next = pts[i + 1]
            const midX = (prev.x + next.x) * 0.5
            const midY = (prev.y + next.y) * 0.5
            pts[i].x = lerp(pts[i].x, midX, 0.18)
            pts[i].y = lerp(pts[i].y, midY, 0.18)
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
          const mx = (c.x + n.x) * 0.5
          const my = (c.y + n.y) * 0.5
          ctx.quadraticCurveTo(c.x, c.y, mx, my)
        }
        const lastP = pts[pts.length - 1]
        ctx.lineTo(lastP.x, lastP.y)
        ctx.strokeStyle = str.gold ? 'rgba(226,177,74,0.58)' : 'rgba(255,255,255,0.28)'
        ctx.lineWidth = str.width
        ctx.lineCap = 'round'
        ctx.stroke()

        // Highlight bead near mid (most deformed point)
        let best = pts[Math.floor(pts.length / 2)]
        let bestD = 0
        for (const pt of pts) {
          const d = Math.hypot(pt.x - pt.ox, pt.y - pt.oy)
          if (d > bestD) {
            bestD = d
            best = pt
          }
        }
        if (bestD > 0.5 || pointer.current.inside) {
          ctx.beginPath()
          ctx.arc(best.x, best.y, str.gold ? 2.6 : 2.1, 0, Math.PI * 2)
          ctx.fillStyle = str.gold ? 'rgba(226,177,74,0.95)' : 'rgba(255,255,255,0.7)'
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
  }, [captureGestures, count, interactive, reduced])

  if (reduced) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 29px)',
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${captureGestures ? 'touch-none' : 'pointer-events-auto'} ${className}`}
      aria-hidden
      style={{ touchAction: captureGestures ? 'none' : 'pan-y' }}
    />
  )
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
