import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TournamentCentre } from '@/components/tournament-centre'

export const metadata = {
  title: 'Tournament Centre | SPEED 2026–27',
}

export const dynamic = 'force-dynamic'

export default function TournamentPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-28 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <p className="speed-kicker">TOURNAMENT CENTRE</p>
          <h1 className="mt-3 font-display text-[2.2rem] tracking-[0.06em] text-white sm:text-5xl">
            Groups, fixtures & knockouts.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--speed-muted)] sm:text-base">
            Sport-wise group tables and brackets. Overall SPEED champion standings stay on{' '}
            <Link href="/standings" className="text-[var(--speed-gold)] hover:underline">
              Standings
            </Link>
            .
          </p>
          <div className="mt-10">
            <TournamentCentre />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
