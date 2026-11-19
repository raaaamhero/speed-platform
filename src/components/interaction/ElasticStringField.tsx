'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
  /**
   * hero — large right-biased arches (ArenaHero)
   * intro — full-width bottom arches (IntroSequence)
   */
  variant?: 'hero' | 'intro'
  interactive?: boolean
}

type Strand = {
  color: string
  off: number
  phase: number
  tension: number
  d: Float32Array
  v: Float32Array
  glow: number
}

/**
 * Sarvam-style restraint: exactly three arched pluckable threads,
 * soft ambient sway, pointer drag / click pluck — no filament forest.
 */
export function ElasticStringField({
  className = '',
  variant = 'hero',
  interactive = true,
}: Props) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const N = 96
    const gap = variant === 'hero' ? 14 : 10
    const colors =
      variant === 'hero'
        ? ['rgba(226,177,74,0.92)', 'rgba(255,255,255,0.72)', 'rgba(200,40,48,0.78)']
        : ['rgba(226,177,74,0.88)', 'rgba(255,255,255,0.55)', 'rgba(200,40,48,0.7)']

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let dpr = 1
    let scrollKick = 0
    const base: { x: number; y: number }[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }))
    const strands: Strand[] = colors.map((color, j) => ({
      color,
      off: (j - (colors.length - 1) / 2) * gap,
      phase: j * 0.9,
      tension: 0.24 + j * 0.03,
      d: new Float32Array(N),
      v: new Float32Array(N),
      glow: 0,
    }))
    const pointer = { x: 0, y: 0, inside: false, down: false }

    const sampleBase = () => {
      // Cubic-ish arch in canvas space — open breathing curve, not a straight line
      const y0 = variant === 'hero' ? h * 0.72 : h * 0.55
      const yPeak = variant === 'hero' ? h * 0.28 : h * 0.32
      const yEnd = variant === 'hero' ? h * 0.38 : h * 0.42
      // Bias hero arches toward the open right so copy stays clear
      const x0 = variant === 'hero' ? w * 0.42 : 0
      const x1 = w

      for (let i = 0; i < N; i++) {
        const t = i / (N - 1)
        const x = x0 + (x1 - x0) * t
        // Smooth arch: rise then settle (ease via cosine envelope + cubic blend)
        const arch = Math.sin(Math.PI * Math.min(1, t * 1.05))
        const settle = t * t
        const y = y0 + (yPeak - y0) * arch * (1 - settle * 0.35) + (yEnd - y0) * settle * 0.55
        base[i].x = x
        base[i].y = y
      }
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sampleBase()
    }

    const metrics = () => {
      const m = Math.min(w, h) || 1
      return {
        grab: variant === 'hero' ? m * 0.06 : m * 0.05,
        reach: variant === 'hero' ? m * 0.14 : m * 0.12,
        maxPull: variant === 'hero' ? m * 0.1 : m * 0.08,
        ambient: variant === 'hero' ? 5 : 3.5,
        strokeW: variant === 'hero' ? 1.8 : 1.5,
      }
    }

    const toLocal = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect()
      return { x: cx - r.left, y: cy - r.top }
    }

    const onMove = (e: PointerEvent) => {
      if (!interactive) return
      const p = toLocal(e.clientX, e.clientY)
      pointer.x = p.x
      pointer.y = p.y
      const pad = metrics().grab * 2
      const minX = base[0].x - pad
      const maxX = base[N - 1].x + pad
      pointer.inside = p.x >= minX && p.x <= maxX && p.y > -pad && p.y < h + pad
    }

    const onDown = (e: PointerEvent) => {
      if (!interactive) return
      const p = toLocal(e.clientX, e.clientY)
      pointer.x = p.x
      pointer.y = p.y
      pointer.down = true
      pointer.inside = true
      const at = Math.round(
        Math.max(0, Math.min(1, (p.x - base[0].x) / Math.max(1, base[N - 1].x - base[0].x))) *
          (N - 1),
      )
      let nearest = strands[0]
      for (const s of strands) {
        const dy = Math.abs(p.y - (base[at].y + s.off + s.d[at]))
        const ndy = Math.abs(p.y - (base[at].y + nearest.off + nearest.d[at]))
        if (dy < ndy) nearest = s
        for (let i = 1; i < N - 1; i++) {
          const dx = base[i].x - p.x
          s.v[i] += (p.y < base[i].y + s.off ? -1 : 1) * 7 * Math.exp(-(dx * dx) / (2 * 60 * 60))
        }
      }
      nearest.glow = 90
    }

    const onUp = () => {
      pointer.down = false
    }

    const onLeave = () => {
      if (!pointer.down) pointer.inside = false
    }

    const onScroll = () => {
      scrollKick = 1
    }

    const step = () => {
      const { grab, reach, maxPull } = metrics()
      scrollKick *= 0.92
      for (const s of strands) {
        const { d, v } = s
        let held = false
        for (let i = 1; i < N - 1; i++) {
          let force = s.tension * (d[i - 1] + d[i + 1] - 2 * d[i]) - 0.004 * d[i] - 0.035 * v[i]
          if (interactive && pointer.inside) {
            const dx = base[i].x - pointer.x
            const pull = pointer.y - (base[i].y + s.off)
            if (Math.abs(pull - d[i]) < grab && Math.abs(pull) < maxPull) {
              const wgt = Math.exp(-(dx * dx) / (2 * reach * reach))
              force += (pull - d[i]) * 0.14 * wgt
              if (wgt > 0.6) held = true
            }
          }
          force += scrollKick * Math.sin((Math.PI * i) / (N - 1)) * 0.25
          v[i] += force
        }
        for (let i = 1; i < N - 1; i++) d[i] += v[i]
        for (let i = 1; i < N - 1; i++) {
          if (d[i] > maxPull) d[i] = maxPull
          if (d[i] < -maxPull) d[i] = -maxPull
        }
        s.glow = held ? 45 : Math.max(0, s.glow - 1)
      }
    }

    const draw = (t: number) => {
      const { ambient, strokeW } = metrics()
      ctx.clearRect(0, 0, w, h)

      const midX = (base[0].x + base[N - 1].x) * 0.5
      const floorY = Math.max(...base.map((b) => b.y)) + gap * 2
      const glow = ctx.createRadialGradient(midX, floorY, 0, midX, floorY, w * 0.35)
      glow.addColorStop(0, 'rgba(226,177,74,0.14)')
      glow.addColorStop(0.45, 'rgba(180,90,40,0.06)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      ctx.beginPath()
      ctx.moveTo(base[0].x, floorY + 8)
      ctx.lineTo(base[N - 1].x, floorY + 8)
      ctx.strokeStyle = 'rgba(241,237,230,0.14)'
      ctx.lineWidth = 1
      ctx.stroke()

      for (const s of strands) {
        ctx.beginPath()
        let px = 0
        let py = 0
        for (let i = 0; i < N; i++) {
          const env = Math.sin((Math.PI * i) / (N - 1))
          const x = base[i].x
          const y =
            base[i].y +
            s.off +
            s.d[i] +
            ambient * env * Math.sin(x * 0.006 + t * 0.0012 + s.phase)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.quadraticCurveTo(px, py, (px + x) * 0.5, (py + y) * 0.5)
          }
          px = x
          py = y
        }
        ctx.lineTo(px, py)
        ctx.strokeStyle = s.color
        ctx.lineWidth = strokeW + (s.glow > 0 ? 0.4 : 0)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = s.glow > 0 ? 1 : 0.92
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    const loop = (now: number) => {
      if (!running) return
      step()
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
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
      window.removeEventListener('scroll', onScroll)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [interactive, reduced, variant])

  if (reduced) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 70% 75%, rgba(226,177,74,0.1), transparent 60%)',
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ touchAction: 'pan-y' }}
    />
  )
}
