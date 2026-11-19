'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { SPORT_VISUALS } from '@/lib/sports-visuals'

export function SportsUniverse() {
  const reduced = useReducedMotion()

  return (
    <section id="sports" className="relative scroll-mt-20 border-t border-white/10 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-display text-xs tracking-[0.4em] text-[var(--speed-gold)]">THE ARENA</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.06em] text-white sm:text-6xl">
          Nine sports.
          <br />
          Nine worlds.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
          Each discipline carries its own atmosphere. Scroll the universe — then register for up to
          three counted sports.
        </p>
      </div>

      <div className="mt-12 space-y-4 px-3 sm:px-6 lg:px-10">
        {SPORT_VISUALS.map((sport, i) => {
          const reverse = i % 2 === 1
          return (
            <motion.article
              key={sport.slug}
              initial={reduced ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-12%' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="group relative min-h-[58vh] overflow-hidden border border-white/10 sm:min-h-[62vh]"
            >
              <div className="absolute inset-0">
                <Image
                  src={sport.image}
                  alt={sport.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${reverse ? '270deg' : '90deg'}, ${sport.secondary} 8%, rgba(0,0,0,0.35) 48%, transparent 78%), linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)`,
                  }}
                />
                <div
                  className="pointer-events-none absolute -right-10 top-10 h-56 w-56 rounded-full blur-[80px] transition group-hover:opacity-100"
                  style={{ background: sport.glow, opacity: 0.55 }}
                />
              </div>

              <div
                className={`relative flex h-full min-h-[58vh] flex-col justify-end p-6 sm:min-h-[62vh] sm:p-10 ${
                  reverse ? 'sm:items-end sm:text-right' : ''
                }`}
              >
                <p
                  className="font-display text-[10px] tracking-[0.35em]"
                  style={{ color: sport.accent }}
                >
                  {String(i + 1).padStart(2, '0')} · DISCIPLINE
                </p>
                <h3 className="mt-2 font-display text-5xl tracking-[0.05em] text-white sm:text-7xl">
                  {sport.name}
                </h3>
                <p className="mt-3 max-w-md text-base text-white/70 sm:text-lg">{sport.tagline}</p>
                <div
                  className="mt-6 h-px w-24 origin-left scale-x-100 bg-current transition duration-500 group-hover:w-40"
                  style={{ color: sport.accent }}
                />
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
