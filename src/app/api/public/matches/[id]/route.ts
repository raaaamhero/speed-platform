import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Public match detail — approved results only. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: fixture, error } = await supabase
    .from('speed_fixtures')
    .select(
      'id, title, venue, starts_at, status, published, stage, bracket_slot, sport_id, team_a_id, team_b_id, competition_id, group_id',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!fixture || !fixture.published) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const [sportRes, teamsRes, compRes, groupRes, mrRes] = await Promise.all([
    supabase.from('speed_sports').select('id, name, slug').eq('id', fixture.sport_id).maybeSingle(),
    supabase.from('speed_teams').select('id, name, code, number'),
    fixture.competition_id
      ? supabase
          .from('speed_competitions')
          .select('id, name, slug, category')
          .eq('id', fixture.competition_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    fixture.group_id
      ? supabase
          .from('speed_competition_groups')
          .select('id, code')
          .eq('id', fixture.group_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('speed_match_results')
      .select(
        'id, score_a, score_b, winner_team_id, is_draw, metrics, summary, approval_status, approved_at, notes',
      )
      .eq('fixture_id', id)
      .eq('approval_status', 'approved')
      .maybeSingle(),
  ])

  const teamMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))
  const teamA = fixture.team_a_id ? teamMap.get(fixture.team_a_id) || null : null
  const teamB = fixture.team_b_id ? teamMap.get(fixture.team_b_id) || null : null
  const mr = mrRes.data
  const winner = mr?.winner_team_id ? teamMap.get(mr.winner_team_id) || null : null

  return NextResponse.json(
    {
      match: {
        id: fixture.id,
        title: fixture.title,
        venue: fixture.venue,
        starts_at: fixture.starts_at,
        status: fixture.status,
        stage: fixture.stage,
        bracket_slot: fixture.bracket_slot,
        sport: sportRes.data,
        competition: compRes.data,
        group: groupRes.data,
        team_a: teamA,
        team_b: teamB,
        result: mr
          ? {
              score_a: mr.score_a,
              score_b: mr.score_b,
              is_draw: mr.is_draw,
              winner,
              metrics: mr.metrics,
              summary: mr.summary,
              approved_at: mr.approved_at,
              official: true,
            }
          : null,
      },
    },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } },
  )
}
