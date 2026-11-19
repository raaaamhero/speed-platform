'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ArenaHero } from './ArenaHero'
import { AudioToggle } from './AudioToggle'
import { IntroSequence } from './IntroSequence'
import { SmoothScroll } from './SmoothScroll'
import { SportsComBrand } from './SportsComBrand'
import { StatsBand } from './StatsBand'
import { TeamsShowcase } from './TeamsShowcase'

const SportsUniverse = dynamic(
  () => import('./SportsUniverse').then((m) => m.SportsUniverse),
  {
    ssr: false,
    loading: () => (
      <div className="border-t border-white/10 bg-black px-5 py-24 text-center text-[var(--speed-muted)]">
        Loading the arena…
      </div>
    ),
  },
)

export function HomeExperience() {
  const [introDone, setIntroDone] = useState(false)
  const complete = useCallback(() => setIntroDone(true), [])

  return (
    <>
      <SmoothScroll />
      <IntroSequence onComplete={complete} />
      <AudioToggle />
      <div aria-hidden={!introDone}>
        <SiteHeader />
        <main>
          <ArenaHero />
          <StatsBand />
          <SportsUniverse />
          <TeamsShowcase />
          <SportsComBrand />
          <section className="border-t border-white/10 bg-black py-20 text-center">
            <p className="font-display text-xs tracking-[0.4em] text-[var(--speed-gold)]">THE CALL</p>
            <h2 className="mt-4 font-display text-4xl tracking-[0.06em] text-white sm:text-6xl">
              Step into SPEED.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[var(--speed-muted)]">
              Registration is open for eligible students. Claim your Player ID and pick your sports.
            </p>
            <a href="/register" className="speed-cta speed-cta-sweep mt-8 inline-flex">
              REGISTER FOR SPEED
            </a>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
