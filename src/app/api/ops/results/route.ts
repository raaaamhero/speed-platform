import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

/**
 * Declare match winner for an existing fixture (no overall SPEED place points).
 * Body: { fixture_id, winner: 'a' | 'b' }
 *
 * Legacy overall place award still accepted:
 * { sport_slug, team_number, place, event_category?, approve? }
 */
export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // --- Match winner from fixture ---
  if (body.fixture_id && (body.winner === 'a' || body.winner === 'b' || body.winner_team_id)) {
    try {
      const result = await withDb(async (client) => {
        const fixtureId = String(body.fixture_id)
        const fx = await client.query(
          `
          select f.*, ta.number as team_a_number, tb.number as team_b_number,
                 ta.name as team_a_name, tb.name as team_b_name,
                 ta.id as team_a_uuid, tb.id as team_b_uuid,
                 s.slug as sport_slug, s.name as sport_name
          from public.speed_fixtures f
          join public.speed_sports s on s.id = f.sport_id
          left join public.speed_teams ta on ta.id = f.team_a_id
          left join public.speed_teams tb on tb.id = f.team_b_id
          where f.id = $1
          `,
          [fixtureId],
        )
        if (!fx.rows[0]) throw new Error('Fixture not found')
        const f = fx.rows[0]
        if (!f.team_a_uuid || !f.team_b_uuid) throw new Error('Fixture needs both teams')

        const winnerId =
          body.winner_team_id ||
          (body.winner === 'a' ? f.team_a_uuid : f.team_b_uuid)
        const winnerName = winnerId === f.team_a_uuid ? f.team_a_name : f.team_b_name
        if (winnerId !== f.team_a_uuid && winnerId !== f.team_b_uuid) {
          throw new Error('Winner must be one of the fixture teams')
        }

        const existing = await client.query(
          `
          select id from public.speed_results
          where fixture_id = $1 and notes = 'match_winner' and approval_status = 'approved'
          limit 1
          `,
          [fixtureId],
        )
        if (existing.rows[0]) {
          throw new Error('This fixture already has a declared winner')
        }

        // place null → 0 overall SPEED points (match outcome only)
        const inserted = await client.query(
          `
          insert into public.speed_results
            (fixture_id, sport_id, team_id, place, event_category, approval_status, notes, approved_at)
          values ($1, $2, $3, null, 'team_sport', 'approved', 'match_winner', now())
          returning *
          `,
          [fixtureId, f.sport_id, winnerId],
        )

        await client.query(
          `
          update public.speed_fixtures
          set status = 'completed', updated_at = now()
          where id = $1
          `,
          [fixtureId],
        )

        await client.query(
          `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
           values ('declare_match_winner', 'fixture', $1, $2::jsonb, $3)`,
          [
            fixtureId,
            JSON.stringify({
              winner_team_id: winnerId,
              winner_name: winnerName,
              result_id: inserted.rows[0].id,
            }),
            `${f.sport_name}: ${winnerName} beat ${
              winnerId === f.team_a_uuid ? f.team_b_name : f.team_a_name
            }`,
          ],
        )

        return {
          result: inserted.rows[0],
          winner_name: winnerName,
          fixture_id: fixtureId,
        }
      })

      return NextResponse.json({ ok: true, ...result })
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Result failed' },
        { status: 400 },
      )
    }
  }

  // --- Legacy overall place award (championship places) ---
  const sportSlug = String(body.sport_slug || '')
  const teamNumber = Number(body.team_number)
  const place = Number(body.place)
  const eventCategory = String(body.event_category || 'team_sport')
  const fixtureId = body.fixture_id || null
  const approve = body.approve !== false

  try {
    const result = await withDb(async (client) => {
      const sport = await client.query(`select id from public.speed_sports where slug=$1`, [
        sportSlug,
      ])
      const team = await client.query(`select id from public.speed_teams where number=$1`, [
        teamNumber,
      ])
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
        const approved = await client.query(`select * from public.speed_approve_result($1)`, [
          final.id,
        ])
        final = approved.rows[0]
      }

      return final
    })

    return NextResponse.json({ ok: true, result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Result failed' },
      { status: 400 },
    )
  }
}
