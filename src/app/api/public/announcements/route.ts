import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type AnnouncementItem = {
  id: string
  kind: 'fixture' | 'result'
  title: string
  detail: string
  href: string
  at: string
}

export async function GET() {
  const supabase = await createClient()

  const [fixturesRes, resultsRes, sportsRes, teamsRes] = await Promise.all([
    supabase
      .from('speed_fixtures')
      .select('id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id, created_at, published')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('speed_results')
      .select(
        'id, place, event_category, sport_id, team_id, fixture_id, created_at, approved_at, approval_status',
      )
      .eq('approval_status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(20),
    supabase.from('speed_sports').select('id, name, slug'),
    supabase.from('speed_teams').select('id, name, code'),
  ])

  if (fixturesRes.error) {
    return NextResponse.json({ error: fixturesRes.error.message }, { status: 500 })
  }
  if (resultsRes.error) {
    return NextResponse.json({ error: resultsRes.error.message }, { status: 500 })
  }

  const sportMap = new Map((sportsRes.data || []).map((s) => [s.id, s]))
  const teamMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))

  const fixtures: AnnouncementItem[] = (fixturesRes.data || []).map((f) => {
    const sport = sportMap.get(f.sport_id)
    const a = f.team_a_id ? teamMap.get(f.team_a_id) : null
    const b = f.team_b_id ? teamMap.get(f.team_b_id) : null
    const matchup =
      a || b ? `${a?.name || 'TBD'} vs ${b?.name || 'TBD'}` : f.title || 'New match scheduled'
    return {
      id: `fixture-${f.id}`,
      kind: 'fixture' as const,
      title: 'New fixture',
      detail: `${sport?.name || 'Sport'} · ${matchup}${f.venue ? ` · ${f.venue}` : ''}`,
      href: '/fixtures',
      at: f.created_at,
    }
  })

  const results: AnnouncementItem[] = (resultsRes.data || []).map((r) => {
    const sport = sportMap.get(r.sport_id)
    const team = teamMap.get(r.team_id)
    const placeLabel = r.place ? `${ordinal(r.place)} place` : 'Result recorded'
    return {
      id: `result-${r.id}`,
      kind: 'result' as const,
      title: 'Result announced',
      detail: `${sport?.name || 'Sport'} · ${team?.name || 'Team'} · ${placeLabel}`,
      href: '/standings',
      at: r.approved_at || r.created_at,
    }
  })

  const announcements = [...fixtures, ...results]
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
