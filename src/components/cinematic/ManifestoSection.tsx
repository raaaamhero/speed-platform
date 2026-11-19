'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function ManifestoSection() {
  const reduced = useReducedMotion()

  return (
    <section id="about" className="relative scroll-mt-20 border-t border-white/10 bg-[#050608] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(226,177,74,0.1),transparent_45%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="speed-kicker"
          >
            WHAT IS SPEED?
          </motion.p>
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-4xl tracking-[0.06em] text-white sm:text-6xl"
          >
            TAPMI&apos;s flagship
            <br />
            multi-sport festival.
          </motion.h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--speed-muted)]">
            Twelve teams. Nine disciplines. One champion. SPEED is where sections unite, rivalries
            ignite, and every registration is a declaration of intent — not a final match squad.
          </p>
        </div>

        <motion.ul
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.65 }}
          className="space-y-4"
        >
          {[
            ['01', 'REGISTER', 'Express interest. Claim your Player ID.'],
            ['02', 'COMPETE', 'SportsCom builds the road to glory.'],
            ['03', 'CHAMPION', 'Points decide the table. Pride lasts longer.'],
          ].map(([n, title, copy]) => (
            <li key={n} className="speed-panel flex gap-4 px-5 py-4">
              <span className="font-display text-2xl tracking-[0.1em] text-[var(--speed-gold)]">{n}</span>
              <div>
                <p className="font-display text-xl tracking-[0.1em] text-white">{title}</p>
                <p className="mt-1 text-sm text-[var(--speed-muted)]">{copy}</p>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
