import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type AnnouncementItem = {
  id: string
  kind: 'fixture' | 'result' | 'placement'
  title: string
  detail: string
  href: string
  at: string
}

export async function GET() {
  const supabase = await createClient()

  const [fixturesRes, matchRes, placeRes, sportsRes, teamsRes, compsRes] = await Promise.all([
    supabase
      .from('speed_fixtures')
      .select(
        'id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id, created_at, published',
      )
      .eq('published', true)
      .not('starts_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('speed_match_results')
      .select(
        'id, fixture_id, summary, score_a, score_b, winner_team_id, is_draw, approved_at, entered_at, approval_status',
      )
      .eq('approval_status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(20),
    supabase
      .from('speed_results')
      .select(
        'id, place, event_category, sport_id, team_id, created_at, approved_at, approval_status',
      )
      .eq('approval_status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(10),
    supabase.from('speed_sports').select('id, name, slug'),
    supabase.from('speed_teams').select('id, name, code'),
    supabase.from('speed_competitions').select('id, name, slug'),
  ])

  if (fixturesRes.error) {
    return NextResponse.json({ error: fixturesRes.error.message }, { status: 500 })
  }

  const sportMap = new Map((sportsRes.data || []).map((s) => [s.id, s]))
  const teamMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))

  // Enrich match results with fixture context
  const matchRows = matchRes.data || []
  const fixtureIds = matchRows.map((m) => m.fixture_id).filter(Boolean)
  let fixtureMap = new Map<
    string,
    {
      id: string
      sport_id: string
      team_a_id: string | null
      team_b_id: string | null
      competition_id: string | null
      published: boolean
    }
  >()
  if (fixtureIds.length) {
    const { data: fxs } = await supabase
      .from('speed_fixtures')
      .select('id, sport_id, team_a_id, team_b_id, competition_id, published')
      .in('id', fixtureIds)
    fixtureMap = new Map((fxs || []).map((f) => [f.id, f]))
  }

  const fixtures: AnnouncementItem[] = (fixturesRes.data || []).map((f) => {
    const sport = sportMap.get(f.sport_id)
    const a = f.team_a_id ? teamMap.get(f.team_a_id) : null
    const b = f.team_b_id ? teamMap.get(f.team_b_id) : null
    const matchup =
      a || b ? `${a?.name || 'TBD'} vs ${b?.name || 'TBD'}` : f.title || 'New match scheduled'
    return {
      id: `fixture-${f.id}`,
      kind: 'fixture' as const,
      title: 'Fixture scheduled',
      detail: `${sport?.name || 'Sport'} · ${matchup}${f.venue ? ` · ${f.venue}` : ''}`,
      href: `/matches/${f.id}`,
      at: f.created_at,
    }
  })

  const matchAnnouncements: AnnouncementItem[] = matchRows
    .map((m) => {
      const fx = fixtureMap.get(m.fixture_id)
      if (!fx?.published) return null
      const detail =
        m.summary ||
        (() => {
          const sport = sportMap.get(fx.sport_id)
          const winner = m.winner_team_id ? teamMap.get(m.winner_team_id) : null
          const a = fx.team_a_id ? teamMap.get(fx.team_a_id) : null
          const b = fx.team_b_id ? teamMap.get(fx.team_b_id) : null
          if (m.is_draw) {
            return `${sport?.name || 'Sport'} · ${a?.name} drew with ${b?.name}`
          }
          return `${sport?.name || 'Sport'} · ${winner?.name || 'Winner'} defeated ${
            winner?.id === a?.id ? b?.name : a?.name
          }`
        })()
      return {
        id: `match-${m.id}`,
        kind: 'result' as const,
        title: 'Match result',
        detail,
        href: `/matches/${m.fixture_id}`,
        at: m.approved_at || m.entered_at,
      }
    })
    .filter(Boolean) as AnnouncementItem[]

  const placements: AnnouncementItem[] = (placeRes.data || []).map((r) => {
    const sport = sportMap.get(r.sport_id)
    const team = teamMap.get(r.team_id)
    const placeLabel = r.place ? `${ordinal(r.place)} place` : 'Placement'
    return {
      id: `placement-${r.id}`,
      kind: 'placement' as const,
      title: 'SPEED points awarded',
      detail: `${sport?.name || 'Sport'} · ${team?.name || 'Team'} · ${placeLabel} (overall)`,
      href: '/standings',
      at: r.approved_at || r.created_at,
    }
  })

  void compsRes

  const announcements = [...fixtures, ...matchAnnouncements, ...placements]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 30)

  return NextResponse.json(
    { announcements },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    },
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
