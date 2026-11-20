import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeGroupStandings } from '@/lib/tournament/standings'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('competition')
  const supabase = await createClient()

  const { data: competitions, error: cErr } = await supabase
    .from('speed_competitions')
    .select(
      'id, slug, name, category, format_status, points_win, points_draw, points_loss, points_provisional, sport_id',
    )
    .order('name')

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  if (!slug) {
    return NextResponse.json({ competitions })
  }

  const competition = (competitions || []).find((c) => c.slug === slug)
  if (!competition) return NextResponse.json({ error: 'Unknown competition' }, { status: 404 })

  if (competition.format_status === 'pending') {
    return NextResponse.json({
      competition,
      formatPending: true,
      groups: [],
      fixtures: [],
      knockouts: [],
      sfRules: [],
    })
  }

  const [groupsRes, membersRes, sfRes, fixturesRes, teamsRes] = await Promise.all([
    supabase
      .from('speed_competition_groups')
      .select('id, code')
      .eq('competition_id', competition.id)
      .order('code'),
    supabase
      .from('speed_group_teams')
      .select('group_id, team_id, seed_order')
      .eq('competition_id', competition.id),
    supabase
      .from('speed_competition_sf_rules')
      .select('sf_index, home_group, away_group')
      .eq('competition_id', competition.id)
      .order('sf_index'),
    supabase
      .from('speed_fixtures')
      .select(
        'id, title, venue, starts_at, status, published, stage, bracket_slot, group_id, team_a_id, team_b_id',
      )
      .eq('competition_id', competition.id),
    supabase.from('speed_teams').select('id, code, name, number'),
  ])

  if (groupsRes.error) return NextResponse.json({ error: groupsRes.error.message }, { status: 500 })
  if (membersRes.error)
    return NextResponse.json({ error: membersRes.error.message }, { status: 500 })

  const teamMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))
  const allFixtures = fixturesRes.data || []
  // Public: published fixtures only (KO shells may be unpublished placeholders — still show structure from ops? show published OR knockout stage with null teams for bracket shell if we want)
  const publicFixtures = allFixtures.filter(
    (f) => f.published || (f.stage === 'semi_final' || f.stage === 'final'),
  )

  const fixtureIds = publicFixtures.map((f) => f.id)
  let matchResults: {
    fixture_id: string
    winner_team_id: string | null
    is_draw: boolean
    score_a: number | null
    score_b: number | null
    approval_status: string
  }[] = []
  if (fixtureIds.length) {
    const { data: mr } = await supabase
      .from('speed_match_results')
      .select('fixture_id, winner_team_id, is_draw, score_a, score_b, approval_status')
      .in('fixture_id', fixtureIds)
      .eq('approval_status', 'approved')
    matchResults = mr || []
  }
  const resultByFixture = new Map(matchResults.map((m) => [m.fixture_id, m]))

  // For standings, use ALL group fixtures (incl unpublished) so tables update when ops enters results before publish
  const groupStageAll = allFixtures.filter((f) => f.stage === 'group_stage')
  const standingsFixtureIds = groupStageAll.map((f) => f.id)
  let standingsResults = matchResults
  if (standingsFixtureIds.length) {
    const { data: mr } = await supabase
      .from('speed_match_results')
      .select('fixture_id, winner_team_id, is_draw, score_a, score_b, approval_status')
      .in('fixture_id', standingsFixtureIds)
      .eq('approval_status', 'approved')
    standingsResults = mr || []
  }
  const standingsResultByFx = new Map(standingsResults.map((m) => [m.fixture_id, m]))

  const enrichedPublic = publicFixtures.map((f) => {
    const mr = resultByFixture.get(f.id)
    return {
      ...f,
      team_a: f.team_a_id ? teamMap.get(f.team_a_id) || null : null,
      team_b: f.team_b_id ? teamMap.get(f.team_b_id) || null : null,
      result: mr
        ? {
            winner_team_id: mr.winner_team_id,
            is_draw: mr.is_draw,
            score_a: mr.score_a,
            score_b: mr.score_b,
          }
        : null,
    }
  })

  const members = membersRes.data || []
  const standings = (groupsRes.data || []).map((g) => {
    const teamIds = members
      .filter((m) => m.group_id === g.id)
      .sort((a, b) => a.seed_order - b.seed_order)
      .map((m) => m.team_id)

    const matches = groupStageAll
      .filter((f) => f.group_id === g.id && f.team_a_id && f.team_b_id)
      .map((f) => {
        const mr = standingsResultByFx.get(f.id)
        if (!mr) return null
        return {
          team_a_id: f.team_a_id as string,
          team_b_id: f.team_b_id as string,
          winner_team_id: mr.winner_team_id,
          is_draw: mr.is_draw,
          approval_status: 'approved',
        }
      })
      .filter(Boolean) as {
      team_a_id: string
      team_b_id: string
      winner_team_id: string | null
      is_draw: boolean
      approval_status: string
    }[]

    const rows = computeGroupStandings(teamIds, matches, {
      win: competition.points_win,
      draw: competition.points_draw,
      loss: competition.points_loss,
    })

    return {
      code: g.code,
      id: g.id,
      teams: rows.map((r, i) => ({
        position: i + 1,
        team: teamMap.get(r.teamId) || null,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        points: r.points,
        pointsConfigured: r.pointsConfigured,
      })),
    }
  })

  return NextResponse.json(
    {
      competition,
      formatPending: false,
      groups: standings,
      fixtures: enrichedPublic.filter((f) => f.stage === 'group_stage' && f.published),
      knockouts: enrichedPublic.filter((f) => f.stage === 'semi_final' || f.stage === 'final'),
      sfRules: sfRes.data || [],
      pointsProvisional: competition.points_provisional,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } },
  )
}
