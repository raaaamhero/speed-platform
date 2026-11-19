'use client'

import { useEffect, useRef, type RefObject } from 'react'

export type PointerFieldState = {
  x: number
  y: number
  nx: number
  ny: number
  down: boolean
  inside: boolean
  /** Pointer id currently grabbing, if any */
  grabId: number | null
}

/**
 * High-frequency pointer/touch tracking into a ref (no React re-renders per move).
 */
export function usePointerField(elRef: RefObject<HTMLElement | null>) {
  const state = useRef<PointerFieldState>({
    x: 0,
    y: 0,
    nx: 0.5,
    ny: 0.5,
    down: false,
    inside: false,
    grabId: null,
  })

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const update = (e: PointerEvent, inside: boolean, down?: boolean) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const s = state.current
      s.x = x
      s.y = y
      s.nx = rect.width ? x / rect.width : 0.5
      s.ny = rect.height ? y / rect.height : 0.5
      s.inside = inside
      if (typeof down === 'boolean') s.down = down
    }

    const onMove = (e: PointerEvent) => update(e, true)
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture?.(e.pointerId)
      state.current.grabId = e.pointerId
      update(e, true, true)
    }
    const onUp = (e: PointerEvent) => {
      if (state.current.grabId === e.pointerId) state.current.grabId = null
      update(e, true, false)
    }
    const onLeave = (e: PointerEvent) => {
      if (!state.current.down) update(e, false, false)
    }
    const onCancel = () => {
      state.current.down = false
      state.current.inside = false
      state.current.grabId = null
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointercancel', onCancel)

    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointercancel', onCancel)
    }
  }, [elRef])

  return state
}
