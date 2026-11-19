'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ParticleField } from './ParticleField'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=75'

export function ArenaHero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 160])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.12])
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.08])

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Stadium arena under floodlights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#050608]/72" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(200,30,44,0.38),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(226,177,74,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_35%,rgba(0,0,0,0.88)_100%)]" />
        <div className="speed-flood pointer-events-none absolute left-[10%] top-0 h-[72%] w-[16%] origin-top -rotate-6 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
        <div className="speed-flood pointer-events-none absolute right-[16%] top-0 h-[68%] w-[14%] origin-top rotate-6 bg-gradient-to-b from-[var(--speed-gold)]/25 to-transparent blur-2xl [animation-delay:1.2s]" />
        <ParticleField className="absolute inset-0 h-full w-full" density={36} />
        <div className="pointer-events-none absolute bottom-[-18%] left-1/2 h-[52%] w-[140%] -translate-x-1/2 rounded-[100%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(226,177,74,0.1),transparent_60%)]" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-24 pt-28 sm:px-8"
      >
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="speed-kicker"
        >
          SPORTSCOM PRESENTS
        </motion.p>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.75 }}
          className="mt-3 font-display text-[clamp(1.1rem,3vw,1.6rem)] tracking-[0.28em] text-white/75"
        >
          SPEED 2026–27
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-4xl font-display text-[clamp(3.2rem,11vw,7rem)] leading-[0.88] tracking-[0.04em] text-[var(--speed-ink)]"
        >
          WHERE RIVALRIES
          <br />
          ARE BORN.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-6 max-w-lg font-display text-lg tracking-[0.12em] text-white/80 sm:text-xl"
        >
          12 TEAMS. 9 SPORTS. ONE CHAMPION.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-3 sm:gap-4"
        >
          <Link href="/register" className="speed-cta speed-cta-sweep relative overflow-hidden">
            REGISTER FOR SPEED
          </Link>
          <a href="#sports" className="speed-ghost">
            EXPLORE THE ARENA
          </a>
          <Link href="/standings" className="speed-ghost">
            VIEW STANDINGS
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
