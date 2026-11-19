import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const sportSlug = String(body.sport_slug || '')
  const teamNumber = Number(body.team_number)
  const place = Number(body.place)
  const eventCategory = String(body.event_category || 'team_sport')
  const fixtureId = body.fixture_id || null
  const approve = body.approve !== false

  try {
    const result = await withDb(async (client) => {
      const sport = await client.query(`select id from public.speed_sports where slug=$1`, [sportSlug])
      const team = await client.query(`select id from public.speed_teams where number=$1`, [teamNumber])
      if (!sport.rows[0] || !team.rows[0]) throw new Error('Sport or team not found')

      const inserted = await client.query(
        `
        insert into public.speed_results
          (fixture_id, sport_id, team_id, place, event_category, approval_status)
        values ($1,$2,$3,$4,$5,'pending')
        returning *
        `,
        [fixtureId, sport.rows[0].id, team.rows[0].id, place, eventCategory],
      )

      let final = inserted.rows[0]
      if (approve) {
        const approved = await client.query(`select * from public.speed_approve_result($1)`, [final.id])
        final = approved.rows[0]
      }

      return final
    })

    return NextResponse.json({ ok: true, result })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Result failed' }, { status: 400 })
  }
}
