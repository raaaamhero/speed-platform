import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

export async function GET() {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await withDb(async (client) => {
    const stats = await client.query(`select public.speed_dashboard_stats() as s`)
    const recent = await client.query(`
      select action, entity_type, entity_id, created_at, reason
      from public.speed_audit_logs
      order by created_at desc
      limit 12
    `)
    const unregistered = await client.query(`
      select s.roll_number, s.full_name, t.code as team_code
      from public.speed_students s
      join public.speed_teams t on t.id = s.team_id
      left join public.speed_registrations r on r.student_id = s.id
      where s.active and (r.id is null or r.submitted_at is null)
      order by t.number, s.full_name
      limit 50
    `)
    return {
      stats: stats.rows[0].s,
      recent: recent.rows,
      unregistered: unregistered.rows,
    }
  })

  return NextResponse.json(data)
}
