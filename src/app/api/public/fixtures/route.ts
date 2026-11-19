import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speed_fixtures')
    .select('id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id')
    .eq('published', true)
    .order('starts_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sports = await supabase.from('speed_sports').select('id, slug, name')
  const teams = await supabase.from('speed_teams').select('id, number, code, name')
  const sportMap = new Map((sports.data || []).map((s) => [s.id, s]))
  const teamMap = new Map((teams.data || []).map((t) => [t.id, t]))

  const fixtures = (data || []).map((f) => ({
    ...f,
    sport: sportMap.get(f.sport_id) || null,
    team_a: f.team_a_id ? teamMap.get(f.team_a_id) || null : null,
    team_b: f.team_b_id ? teamMap.get(f.team_b_id) || null : null,
  }))

  return NextResponse.json({ fixtures })
}
