'use client'

import { useEffect, useRef } from 'react'
import { clamp } from '@/lib/interaction/spring'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

type Props = {
  className?: string
}

type Ember = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  r: number
  hot: boolean
}

/**
 * Arena fire crackles / embers — ambient rise + burst on press/tap.
 */
export function FireCrackles({ className = '' }: Props) {
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
    let embers: Ember[] = []

    const spawn = (x: number, y: number, burst = false) => {
      const n = burst ? (w < 768 ? 18 : 28) : 1
      for (let i = 0; i < n; i++) {
        const angle = burst ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : -Math.PI / 2
        const speed = burst ? 80 + Math.random() * 160 : 20 + Math.random() * 40
        embers.push({
          x,
          y,
          vx: Math.cos(angle) * speed * (0.4 + Math.random()),
          vy: Math.sin(angle) * speed,
          life: 0,
          max: burst ? 0.55 + Math.random() * 0.55 : 1.2 + Math.random() * 1.4,
          r: burst ? 1.5 + Math.random() * 3.5 : 1 + Math.random() * 2.2,
          hot: Math.random() > 0.35,
        })
      }
      if (embers.length > 220) embers.splice(0, embers.length - 220)
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Ambient floor vents — right side + bottom
    let ambientAcc = 0

    const step = (dt: number) => {
      ambientAcc += dt
      if (ambientAcc > 0.08) {
        ambientAcc = 0
        const ax = (0.55 + Math.random() * 0.4) * w
        const ay = h * (0.72 + Math.random() * 0.22)
        spawn(ax, ay, false)
        if (Math.random() > 0.7) spawn(Math.random() * w * 0.35, h * 0.9, false)
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.life += dt
        e.vy -= 40 * dt // lift
        e.vx *= 0.98
        e.x += e.vx * dt
        e.y += e.vy * dt
        if (e.life >= e.max || e.y < -20) embers.splice(i, 1)
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const e of embers) {
        const t = 1 - e.life / e.max
        const r = e.r * (0.6 + t)
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 3)
        if (e.hot) {
          grad.addColorStop(0, `rgba(255,250,210,${0.9 * t})`)
          grad.addColorStop(0.35, `rgba(255,140,40,${0.65 * t})`)
          grad.addColorStop(1, 'rgba(200,30,44,0)')
        } else {
          grad.addColorStop(0, `rgba(255,220,140,${0.7 * t})`)
          grad.addColorStop(0.4, `rgba(226,177,74,${0.45 * t})`)
          grad.addColorStop(1, 'rgba(226,177,74,0)')
        }
        ctx.beginPath()
        ctx.fillStyle = grad
        ctx.arc(e.x, e.y, r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (now: number) => {
      if (!running) return
      const dt = clamp((now - last) / 1000, 0.001, 0.033)
      last = now
      step(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      spawn(e.clientX - rect.left, e.clientY - rect.top, true)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointerdown', onDown)
    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [reduced])

  if (reduced) return null
  return <canvas ref={canvasRef} className={className} aria-hidden style={{ touchAction: 'pan-y' }} />
}
