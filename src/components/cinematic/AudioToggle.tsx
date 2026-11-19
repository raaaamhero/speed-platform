'use client'

import { useEffect, useState } from 'react'
import { isAmbiencePlaying, startArenaAmbience, stopArenaAmbience } from './audio-engine'

const KEY = 'speed-audio-on'

export function AudioToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    setOn(localStorage.getItem(KEY) === '1' && isAmbiencePlaying())
  }, [])

  async function toggle() {
    if (on) {
      stopArenaAmbience()
      localStorage.setItem(KEY, '0')
      setOn(false)
      return
    }
    await startArenaAmbience()
    localStorage.setItem(KEY, '1')
    setOn(true)
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="fixed bottom-5 right-5 z-[60] border border-white/20 bg-black/55 px-3 py-2 font-display text-[11px] tracking-[0.22em] text-[var(--speed-ink)] backdrop-blur-md transition hover:border-[var(--speed-gold)] hover:text-[var(--speed-gold)]"
      aria-pressed={on}
      aria-label={on ? 'Mute soundtrack' : 'Enable soundtrack'}
    >
      {on ? 'SOUND ON' : 'SOUND OFF'}
    </button>
  )
}
