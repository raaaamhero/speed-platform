'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SPORT_VISUALS, type SportVisual } from '@/lib/sports-visuals'

function MotifOverlay({ motif, accent }: { motif: SportVisual['motif']; accent: string }) {
  if (motif === 'track') {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute bottom-0 top-0 w-px bg-white/30"
            style={{ left: `${18 + i * 14}%` }}
          />
        ))}
      </div>
    )
  }
  if (motif === 'pool') {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-50"
        style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 48px, ${accent}22 48px, ${accent}22 50px)`,
        }}
      />
    )
  }
  if (motif === 'net') {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `linear-gradient(${accent}55 1px, transparent 1px), linear-gradient(90deg, ${accent}55 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
    )
  }
  if (motif === 'shuttle' || motif === 'table') {
    return (
      <div className="pointer-events-none absolute right-[12%] top-[28%] h-px w-[38%] rotate-[-18deg] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
    )
  }
  if (motif === 'pitch') {
    return (
      <div className="pointer-events-none absolute inset-x-[10%] top-1/2 h-px -translate-y-1/2 bg-white/20" />
    )
  }
  return (
    <div className="pointer-events-none absolute inset-[12%] border border-white/10 opacity-40" />
  )
}

export function SportsUniverse() {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <section id="sports" className="relative scroll-mt-20 border-t border-white/10 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="speed-kicker">THE NINE SPORTS AT SPEED</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-white sm:text-6xl">
          Nine sports.
          <br />
          Nine venues.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Tap a sport for the full brief — then register for up to three counted sports (relays
          exempt).
        </p>
      </div>

      <div className="mt-12 space-y-3 px-3 sm:px-6 lg:px-10">
        {SPORT_VISUALS.map((sport, i) => {
          const reverse = i % 2 === 1
          const expanded = open === sport.slug
          return (
            <motion.article
              key={sport.slug}
              initial={reduced ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="group relative min-h-[42vh] overflow-hidden border border-white/10 sm:min-h-[58vh]"
            >
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer"
                aria-expanded={expanded}
                aria-label={`${sport.name} details`}
                onClick={() => setOpen(expanded ? null : sport.slug)}
              />
              <div className="absolute inset-0">
                <Image
                  src={sport.image}
                  alt={sport.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover transition duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${reverse ? '270deg' : '90deg'}, ${sport.secondary} 6%, rgba(0,0,0,0.4) 48%, transparent 78%), linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.82) 100%)`,
                  }}
                />
                <MotifOverlay motif={sport.motif} accent={sport.accent} />
                <div
                  className="pointer-events-none absolute -right-10 top-10 h-56 w-56 rounded-full blur-[80px] transition group-hover:opacity-100"
                  style={{ background: sport.glow, opacity: 0.5 }}
                />
              </div>

              <div
                className={`relative z-20 pointer-events-none flex h-full min-h-[42vh] flex-col justify-end p-5 sm:min-h-[58vh] sm:p-10 ${
                  reverse ? 'sm:items-end sm:text-right' : ''
                }`}
              >
                <p className="font-display text-[10px] tracking-[0.35em]" style={{ color: sport.accent }}>
                  {String(i + 1).padStart(2, '0')} · {sport.venue.toUpperCase()}
                </p>
                <h3 className="mt-2 font-display text-5xl tracking-[0.05em] text-white sm:text-7xl">
                  {sport.name}
                </h3>
                <p className="mt-3 max-w-md text-base text-white/70 sm:text-lg">{sport.tagline}</p>
                <AnimatePresence>
                  {expanded && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pointer-events-none mt-4 max-w-md text-sm leading-relaxed text-white/85"
                    >
                      {sport.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div
                  className="mt-6 h-px w-24 transition duration-500 group-hover:w-40"
                  style={{ background: sport.accent }}
                />
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
