import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

export async function GET(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  const team = url.searchParams.get('team')

  const rows = await withDb(async (client) => {
    const result = await client.query(
      `
      select
        s.id, s.roll_number, s.full_name, s.gender, s.batch, s.active,
        sec.code as section_code, sec.name as section_name,
        t.number as team_number, t.code as team_code, t.name as team_name,
        r.status as registration_status, r.submitted_at,
        pid.player_code,
        coalesce((
          select array_agg(sp.slug order by sp.sort_order)
          from public.speed_registration_sports rs
          join public.speed_sports sp on sp.id = rs.sport_id
          where rs.registration_id = r.id
        ), '{}'::text[]) as sport_slugs,
        coalesce((
          select count(*)::int
          from public.speed_registration_sports rs
          join public.speed_sports sp on sp.id = rs.sport_id
          where rs.registration_id = r.id and sp.counts_toward_cap
        ), 0) as counted_sports
      from public.speed_students s
      join public.speed_sections sec on sec.id = s.section_id
      join public.speed_teams t on t.id = s.team_id
      left join public.speed_registrations r on r.student_id = s.id
      left join public.speed_player_ids pid on pid.id = r.player_id
      where s.active = true
        and ($1 = '' or s.roll_number ilike '%'||$1||'%' or s.full_name ilike '%'||$1||'%' or coalesce(pid.player_code,'') ilike '%'||$1||'%')
        and ($2::text is null or t.code = $2)
      order by t.number, s.full_name
      limit 500
      `,
      [q, team],
    )
    return result.rows
  })

  return NextResponse.json({ students: rows })
}
