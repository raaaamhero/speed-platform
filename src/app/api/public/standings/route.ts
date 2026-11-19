import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speed_team_standings')
    .select('id, number, code, name, points, scoring_events')
    .order('points', { ascending: false })
    .order('number', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ standings: data })
}
