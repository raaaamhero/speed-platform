/** Lightweight spring / Verlet helpers for the interaction engine. */

export type Vec2 = { x: number; y: number }

export function springStep(
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  damping: number,
  dt: number,
): { value: number; velocity: number } {
  const force = (target - current) * stiffness
  const nextV = (velocity + force * dt) * damping
  return { value: current + nextV * dt, velocity: nextV }
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

/** Soft influence falloff (1 at center → 0 at radius). */
export function falloff(d: number, radius: number) {
  if (d >= radius) return 0
  const t = 1 - d / radius
  return t * t * (3 - 2 * t)
}
