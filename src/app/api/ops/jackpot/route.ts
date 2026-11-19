import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const teamNumber = Number(body.team_number)
  const sportSlug = String(body.sport_slug || '')

  try {
    const jackpot = await withDb(async (client) => {
      if (['athletics-relays', 'swimming-relays'].includes(sportSlug)) {
        throw new Error('No jackpot in Athletics or Swimming.')
      }

      const team = await client.query(`select id from public.speed_teams where number=$1`, [teamNumber])
      const sport = await client.query(`select id from public.speed_sports where slug=$1`, [sportSlug])
      if (!team.rows[0] || !sport.rows[0]) throw new Error('Team or sport not found')

      const existing = await client.query(`select id from public.speed_jackpots where team_id=$1`, [team.rows[0].id])
      if (existing.rows[0]) throw new Error('This team already placed a jackpot.')

      const inserted = await client.query(
        `
        insert into public.speed_jackpots (team_id, sport_id, approval_status)
        values ($1,$2,'approved')
        returning *
        `,
        [team.rows[0].id, sport.rows[0].id],
      )

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data)
         values ('place_jackpot', 'jackpot', $1, $2::jsonb)`,
        [inserted.rows[0].id, JSON.stringify({ team_number: teamNumber, sport_slug: sportSlug })],
      )

      return inserted.rows[0]
    })

    return NextResponse.json({ ok: true, jackpot })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Jackpot failed' }, { status: 400 })
  }
}
