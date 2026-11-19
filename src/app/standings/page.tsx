import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { StandingsBoard } from '@/components/standings-board'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Standings | SPEED 2026–27',
}

export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const supabase = await createClient()
  const { data: standings } = await supabase
    .from('speed_team_standings')
    .select('number, code, name, points, scoring_events')
    .order('points', { ascending: false })
    .order('number', { ascending: true })

  const rows = (standings || []).map((t) => ({
    number: t.number,
    code: t.code,
    name: t.name,
    points: t.points,
    scoring_events: t.scoring_events,
  }))

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <StandingsBoard rows={rows} loadedAt={new Date().toLocaleString()} />
          <p className="mt-10 text-xs text-[var(--speed-muted)]">
            Scoring (eligible team sports): 1st 1000 · 2nd 750 · 3rd 500 · 4th 250. Athletics &amp;
            swimming use single/relay point bands per the official rulebook. Jackpot rules unchanged.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
