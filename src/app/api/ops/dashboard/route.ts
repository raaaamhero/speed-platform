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
    return {
      stats: stats.rows[0].s,
      recent: recent.rows,
    }
  })

  return NextResponse.json(data)
}
