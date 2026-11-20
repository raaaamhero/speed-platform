/**
 * Original epic arena score (Web Audio) — Endgame-inspired energy,
 * not a copyrighted track. Autoplay is unlocked by the first user gesture
 * (required by mobile/desktop browsers).
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let nodes: OscillatorNode[] = []
let gains: GainNode[] = []
let playing = false
let pendingStart = false
let armed = false
let loopTimer: number | null = null

function ensure() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
  }
  return ctx
}

async function resume() {
  const audio = ensure()
  if (!audio) return null
  if (audio.state === 'suspended') {
    try {
      await audio.resume()
    } catch {
      return null
    }
  }
  return audio
}

function addOsc(
  freq: number,
  type: OscillatorType,
  gain: number,
  when: number,
  duration: number,
  attack = 0.08,
  release = 0.6,
) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = type === 'sawtooth' ? 900 : 520
  osc.type = type
  osc.frequency.setValueAtTime(freq, when)
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(attack + 0.05, duration - release))
  osc.connect(filter)
  filter.connect(g)
  g.connect(master)
  osc.start(when)
  osc.stop(when + duration + 0.05)
  nodes.push(osc)
  gains.push(g)
}

/** Deep timpani-like hit */
function boom(when: number, strength = 1) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(90 * strength, when)
  osc.frequency.exponentialRampToValueAtTime(38, when + 0.45)
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(0.55 * strength, when + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, when + 1.1)
  osc.connect(g)
  g.connect(master)
  osc.start(when)
  osc.stop(when + 1.2)
  nodes.push(osc)
  gains.push(g)
}

/** Rising string cluster — heroic lift */
function swell(when: number) {
  // D minor-ish stack
  const freqs = [146.83, 220, 293.66, 349.23, 440]
  freqs.forEach((f, i) => {
    addOsc(f, i % 2 === 0 ? 'sawtooth' : 'triangle', 0.028 - i * 0.003, when, 3.2, 0.35, 1.2)
  })
}

/** Sustained epic pad bed */
function padBed(when: number) {
  ;[55, 82.41, 110, 164.81].forEach((f, i) => {
    addOsc(f, i < 2 ? 'sine' : 'triangle', 0.04 - i * 0.006, when, 12, 1.2, 2.5)
  })
  ;[220, 261.63, 329.63].forEach((f, i) => {
    addOsc(f, 'sawtooth', 0.012 - i * 0.002, when + 0.4, 10, 1.8, 2.2)
  })
}

function scheduleLoop() {
  if (!ctx || !playing) return
  const t = ctx.currentTime + 0.05
  boom(t, 0.85)
  boom(t + 2.4, 0.55)
  swell(t + 0.15)
  padBed(t)
  // Soft brass stab
  ;[174.61, 220, 261.63].forEach((f, i) => {
    addOsc(f, 'sawtooth', 0.03, t + 4.8 + i * 0.04, 1.6, 0.04, 0.7)
  })
  boom(t + 4.85, 1)
  loopTimer = window.setTimeout(() => {
    if (playing) scheduleLoop()
  }, 9800)
}

async function startEpicScoreInternal() {
  const audio = await resume()
  if (!audio || !master || playing) return false

  // Clear stale nodes
  nodes = []
  gains = []
  playing = true
  pendingStart = false

  const t = audio.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(0.0001, t)
  master.gain.exponentialRampToValueAtTime(0.72, t + 0.9)

  // SPEED flash — Endgame-scale impact
  boom(t, 1.15)
  boom(t + 0.12, 0.7)
  swell(t)
  padBed(t + 0.2)
  ;[293.66, 349.23, 440, 523.25].forEach((f, i) => {
    addOsc(f, 'sawtooth', 0.035 - i * 0.004, t + 0.05 + i * 0.03, 2.4, 0.05, 1)
  })

  scheduleLoop()
  return true
}

/** Call on any pointer/touch so phones unlock audio before SPEED. */
export function armEpicAudioUnlock() {
  if (typeof window === 'undefined' || armed) return
  armed = true

  const unlock = () => {
    void resume().then(() => {
      if (pendingStart && !playing) void startEpicScoreInternal()
    })
  }

  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('touchstart', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

/**
 * Cue the epic score at the SPEED title flash.
 * Starts immediately if audio is unlocked; otherwise waits for the next gesture.
 */
export async function cueEpicAtSpeedReveal() {
  armEpicAudioUnlock()
  pendingStart = true
  const ok = await startEpicScoreInternal()
  if (!ok) pendingStart = true
}

/** If intro was skipped, start epic on the first tap/click (no mute toggle). */
export function enableAutoEpicOnNextGesture() {
  armEpicAudioUnlock()
  if (!playing) pendingStart = true
}

export function isEpicPlaying() {
  return playing
}

export function stopEpicScore() {
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value || 0.001, now)
  master.gain.linearRampToValueAtTime(0.0001, now + 0.9)
  if (loopTimer) {
    window.clearTimeout(loopTimer)
    loopTimer = null
  }
  window.setTimeout(() => {
    for (const n of nodes) {
      try {
        n.stop()
        n.disconnect()
      } catch {
        /* ignore */
      }
    }
    for (const g of gains) {
      try {
        g.disconnect()
      } catch {
        /* ignore */
      }
    }
    nodes = []
    gains = []
    playing = false
    pendingStart = false
  }, 950)
}
