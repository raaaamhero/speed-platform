/** Original Web Audio ambience — no copyrighted tracks. */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let nodes: AudioNode[] = []
let playing = false

function ensure() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
  }
  return ctx
}

function tone(freq: number, type: OscillatorType, gain: number, delay = 0) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(filter)
  filter.connect(g)
  g.connect(master)
  osc.start(ctx.currentTime + delay)
  nodes.push(osc, g, filter)
}

export async function startArenaAmbience() {
  const audio = ensure()
  if (!audio || !master || playing) return
  if (audio.state === 'suspended') await audio.resume()
  nodes = []
  // Deep cinematic pad stack
  tone(55, 'sine', 0.045)
  tone(82.5, 'triangle', 0.02, 0.05)
  tone(110, 'sine', 0.015, 0.1)
  tone(164.8, 'triangle', 0.008, 0.2)
  // Slow pulse LFO on master
  const lfo = audio.createOscillator()
  const lfoGain = audio.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 0.012
  lfo.connect(lfoGain)
  lfoGain.connect(master.gain)
  lfo.start()
  nodes.push(lfo, lfoGain)

  const now = audio.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(0.55, now + 1.4)
  playing = true
}

export function stopArenaAmbience() {
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(0, now + 0.8)
  window.setTimeout(() => {
    for (const n of nodes) {
      try {
        if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
          ;(n as OscillatorNode).stop()
        }
        n.disconnect()
      } catch {
        /* ignore */
      }
    }
    nodes = []
    playing = false
  }, 850)
}

export function isAmbiencePlaying() {
  return playing
}
