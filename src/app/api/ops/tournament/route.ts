import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'
import { seedAndGenerateFixtures } from '@/lib/tournament/generate'

export async function GET() {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await withDb(async (client) => {
    const competitions = await client.query(`
      select c.*, s.slug as sport_slug, s.name as sport_name,
        (select count(*) from speed_fixtures f where f.competition_id = c.id and f.stage = 'group_stage')::int as group_fixtures,
        (select count(*) from speed_match_results mr
           join speed_fixtures f on f.id = mr.fixture_id
          where f.competition_id = c.id and mr.approval_status = 'approved')::int as approved_matches
      from speed_competitions c
      join speed_sports s on s.id = c.sport_id
      order by c.format_status asc, c.name asc
    `)
    const counts = await client.query(`
      select
        (select count(*) from speed_fixtures where stage='group_stage')::int as group_fx,
        (select count(*) from speed_fixtures where stage='semi_final')::int as sf,
        (select count(*) from speed_fixtures where stage='final')::int as finals
    `)
    return { competitions: competitions.rows, counts: counts.rows[0] }
  })

  return NextResponse.json(data)
}

/** Idempotent re-seed / generate */
export async function POST() {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = await withDb(async (client) => {
      await client.query('begin')
      try {
        const r = await seedAndGenerateFixtures(client)
        if (r.validationErrors.length) {
          await client.query('rollback')
          return r
        }
        await client.query('commit')
        return r
      } catch (e) {
        await client.query('rollback')
        throw e
      }
    })
    return NextResponse.json({ ok: !report.validationErrors.length, report })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generate failed' },
      { status: 500 },
    )
  }
}
