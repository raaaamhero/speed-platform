'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ArenaHero } from './ArenaHero'
import { IntroSequence } from './IntroSequence'
import { ManifestoSection } from './ManifestoSection'
import { RoadSection } from './RoadSection'
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
        Loading sports…
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
      <div aria-hidden={!introDone}>
        <SiteHeader />
        <main>
          <ArenaHero />
          <StatsBand />
          <SportsComBrand />
          <ManifestoSection />
          <SportsUniverse />
          <TeamsShowcase />
          <RoadSection />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
