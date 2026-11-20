/**
 * One-shot epic hit for the SPEED title flash only — no looping soundtrack.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let nodes: OscillatorNode[] = []
let played = false
let pending = false
let armed = false
let fadeTimer: number | null = null

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

function tone(
  freq: number,
  type: OscillatorType,
  gain: number,
  when: number,
  duration: number,
  attack = 0.06,
  release = 0.5,
) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = type === 'sawtooth' ? 880 : 480
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
}

function boom(when: number, strength = 1) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(95 * strength, when)
  osc.frequency.exponentialRampToValueAtTime(36, when + 0.5)
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(0.5 * strength, when + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, when + 1.15)
  osc.connect(g)
  g.connect(master)
  osc.start(when)
  osc.stop(when + 1.25)
  nodes.push(osc)
}

async function playSpeedFanfareOnce() {
  const audio = await resume()
  if (!audio || !master || played) return false

  played = true
  pending = false
  nodes = []

  const t = audio.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(0.0001, t)
  master.gain.exponentialRampToValueAtTime(0.7, t + 0.25)

  // Short heroic hit — ~4s, then silence
  boom(t, 1.1)
  boom(t + 0.1, 0.65)
  ;[146.83, 220, 293.66, 349.23, 440].forEach((f, i) => {
    tone(f, i % 2 === 0 ? 'sawtooth' : 'triangle', 0.03 - i * 0.003, t + 0.04, 2.8, 0.2, 1)
  })
  ;[293.66, 349.23, 440, 523.25].forEach((f, i) => {
    tone(f, 'sawtooth', 0.032 - i * 0.004, t + 0.08 + i * 0.03, 2.2, 0.05, 0.9)
  })
  ;[55, 82.41, 110].forEach((f, i) => {
    tone(f, 'sine', 0.045 - i * 0.008, t + 0.15, 3.5, 0.4, 1.4)
  })

  // Fade out after the SPEED beat
  master.gain.setValueAtTime(0.7, t + 2.6)
  master.gain.exponentialRampToValueAtTime(0.0001, t + 4.2)

  if (fadeTimer) window.clearTimeout(fadeTimer)
  fadeTimer = window.setTimeout(() => {
    for (const n of nodes) {
      try {
        n.stop()
        n.disconnect()
      } catch {
        /* ignore */
      }
    }
    nodes = []
  }, 4500)

  return true
}

export function armEpicAudioUnlock() {
  if (typeof window === 'undefined' || armed) return
  armed = true
  const unlock = () => {
    void resume().then(() => {
      if (pending && !played) void playSpeedFanfareOnce()
    })
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('touchstart', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

/** Play once when SPEED flashes — never loops. */
export async function cueEpicAtSpeedReveal() {
  armEpicAudioUnlock()
  if (played) return
  pending = true
  const ok = await playSpeedFanfareOnce()
  if (!ok) pending = true
}

export function enableAutoEpicOnNextGesture() {
  // Returning visitors: no looping bed — only unlock context; fanfare is intro-only
  armEpicAudioUnlock()
}

export function isEpicPlaying() {
  return played && nodes.length > 0
}

export function stopEpicScore() {
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value || 0.001, now)
  master.gain.linearRampToValueAtTime(0.0001, now + 0.4)
  if (fadeTimer) {
    window.clearTimeout(fadeTimer)
    fadeTimer = null
  }
  pending = false
}
