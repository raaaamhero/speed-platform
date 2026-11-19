'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

function CountUp({ to, active }: { to: number; active: boolean }) {
  const [value, setValue] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!active) return
    if (reduced) {
      setValue(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const duration = 1100
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reduced, to])

  return <span>{value}</span>
}

export function StatsBand() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
  const reduced = useReducedMotion()

  const items = [
    { label: 'TEAMS', value: 12 },
    { label: 'SPORTS', value: 9 },
    { label: 'CHAMPION', value: 1 },
  ]

  return (
    <section ref={ref} className="relative border-y border-white/10 bg-black py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.08),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-5xl grid-cols-3 gap-4 px-5 text-center sm:px-8">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.55 }}
          >
            <p className="font-display text-[clamp(2.8rem,8vw,5.5rem)] leading-none tracking-[0.04em] text-white">
              <CountUp to={item.value} active={inView} />
            </p>
            <p className="mt-3 font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
