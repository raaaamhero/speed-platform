import { FixturesBoard } from '@/components/fixtures-board'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Fixtures | SPEED 2026–27',
}

export const dynamic = 'force-dynamic'

export default async function FixturesPage() {
  const supabase = await createClient()
  const { data: fixtures } = await supabase
    .from('speed_fixtures')
    .select('id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id')
    .eq('published', true)
    .order('starts_at', { ascending: true })

  const { data: sports } = await supabase.from('speed_sports').select('id, name, slug')
  const { data: teams } = await supabase.from('speed_teams').select('id, name, code')
  const sportMap = new Map((sports || []).map((s) => [s.id, s]))
  const teamMap = new Map((teams || []).map((t) => [t.id, t]))

  const rows = (fixtures || []).map((f) => {
    const sport = sportMap.get(f.sport_id)
    const a = f.team_a_id ? teamMap.get(f.team_a_id) : null
    const b = f.team_b_id ? teamMap.get(f.team_b_id) : null
    return {
      id: f.id,
      title: f.title,
      venue: f.venue,
      starts_at: f.starts_at,
      status: f.status,
      sportName: sport?.name || 'Sport',
      sportSlug: sport?.slug || '',
      teamA: a?.name || 'TBD',
      teamB: b?.name || 'TBD',
    }
  })

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <FixturesBoard fixtures={rows} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
