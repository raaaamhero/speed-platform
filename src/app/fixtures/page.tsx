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
    .select(
      'id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id, competition_id, group_id, stage, published',
    )
    .eq('published', true)
    .order('starts_at', { ascending: true })

  const { data: sports } = await supabase.from('speed_sports').select('id, name, slug')
  const { data: teams } = await supabase.from('speed_teams').select('id, name, code')
  const { data: comps } = await supabase.from('speed_competitions').select('id, name, slug')
  const { data: groups } = await supabase.from('speed_competition_groups').select('id, code')

  const ids = (fixtures || []).map((f) => f.id)
  let results: {
    fixture_id: string
    score_a: number | null
    score_b: number | null
    is_draw: boolean
    winner_team_id: string | null
  }[] = []
  if (ids.length) {
    const { data: mr } = await supabase
      .from('speed_match_results')
      .select('fixture_id, score_a, score_b, is_draw, winner_team_id')
      .in('fixture_id', ids)
      .eq('approval_status', 'approved')
    results = mr || []
  }
  const resultMap = new Map(results.map((r) => [r.fixture_id, r]))

  const sportMap = new Map((sports || []).map((s) => [s.id, s]))
  const teamMap = new Map((teams || []).map((t) => [t.id, t]))
  const compMap = new Map((comps || []).map((c) => [c.id, c]))
  const groupMap = new Map((groups || []).map((g) => [g.id, g]))

  // Do not show unscheduled (no date) as upcoming — still show completed with results
  const rows = (fixtures || [])
    .filter((f) => {
      if (f.status === 'completed' || resultMap.has(f.id)) return true
      if (f.status === 'cancelled' || f.status === 'abandoned') return true
      return Boolean(f.starts_at)
    })
    .map((f) => {
      const sport = sportMap.get(f.sport_id)
      const a = f.team_a_id ? teamMap.get(f.team_a_id) : null
      const b = f.team_b_id ? teamMap.get(f.team_b_id) : null
      const mr = resultMap.get(f.id)
      const winner = mr?.winner_team_id ? teamMap.get(mr.winner_team_id) : null
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
        competitionName: f.competition_id ? compMap.get(f.competition_id)?.name : null,
        groupCode: f.group_id ? groupMap.get(f.group_id)?.code : null,
        stage: f.stage,
        scoreA: mr?.score_a ?? null,
        scoreB: mr?.score_b ?? null,
        isDraw: mr?.is_draw ?? false,
        winnerName: winner?.name ?? null,
        hasOfficialResult: Boolean(mr),
      }
    })

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-28 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <FixturesBoard fixtures={rows} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
