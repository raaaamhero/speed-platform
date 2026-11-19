'use client'

import { useCallback, useId, useRef, useState } from 'react'

type Props = {
  className?: string
}

/**
 * Drag-to-reveal: dark empty arena → illuminated championship night.
 * Uses aligned CSS stadium plates (no mismatched photos).
 */
export function StadiumReveal({ className = '' }: Props) {
  const [pos, setPos] = useState(48)
  const dragging = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  const setFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(8, Math.min(92, next)))
  }, [])

  return (
    <section className={`border-t border-white/10 bg-black py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="speed-kicker">THE ARENA AWAKENS</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-white sm:text-5xl">
          Drag the night open.
        </h2>
        <p className="mt-3 max-w-lg text-[var(--speed-muted)]">
          Pull the divider — empty stands become floodlit SPEED.
        </p>

        <div
          ref={trackRef}
          className="relative mt-10 h-[48vh] min-h-[260px] touch-none overflow-hidden border border-white/10 select-none sm:h-[56vh]"
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            setFromClientX(e.clientX)
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return
            setFromClientX(e.clientX)
          }}
          onPointerUp={() => {
            dragging.current = false
          }}
          onPointerCancel={() => {
            dragging.current = false
          }}
          role="slider"
          aria-labelledby={labelId}
          aria-valuemin={8}
          aria-valuemax={92}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(8, p - 3))
            if (e.key === 'ArrowRight') setPos((p) => Math.min(92, p + 3))
          }}
        >
          <span id={labelId} className="sr-only">
            Stadium illumination reveal
          </span>

          {/* Dark stadium */}
          <div className="absolute inset-0 bg-[#07080b]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#1a1d24,transparent_55%)]" />
            <div className="absolute bottom-[12%] left-1/2 h-[38%] w-[92%] -translate-x-1/2 rounded-[100%] border border-white/10 bg-white/[0.03]" />
            <p className="absolute left-5 top-5 font-display text-xs tracking-[0.3em] text-white/35">
              EMPTY NIGHT
            </p>
          </div>

          {/* Lit stadium */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          >
            <div className="absolute inset-0 bg-[#0a0c10]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(226,177,74,0.35),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(255,255,255,0.2),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(200,30,44,0.25),transparent_40%)]" />
            <div className="absolute bottom-[12%] left-1/2 h-[38%] w-[92%] -translate-x-1/2 rounded-[100%] border border-[var(--speed-gold)]/35 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.2),transparent_65%)]" />
            <p className="absolute right-5 top-5 font-display text-xs tracking-[0.3em] text-[var(--speed-gold)]">
              SPEED NIGHT
            </p>
          </div>

          {/* Divider handle */}
          <div
            className="absolute bottom-0 top-0 z-10 w-px bg-white/80"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/70 font-display text-[10px] tracking-[0.15em] text-white">
              drag
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
