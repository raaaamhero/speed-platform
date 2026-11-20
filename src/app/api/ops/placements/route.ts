import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

/**
 * Overall SPEED final sport placements only.
 * Does NOT touch match results. Uses speed_results + speed_approve_result +
 * speed_competition_placements for idempotency (unique competition + place).
 *
 * POST { competition_slug, places: [{ place: 1..4, team_id }] }
 * GET  ?competition=
 */
export async function GET(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const competition = new URL(req.url).searchParams.get('competition')

  const rows = await withDb(async (client) => {
    const r = await client.query(
      `
      select p.*, t.name as team_name, t.code as team_code, t.number as team_number,
             c.slug as competition_slug, c.name as competition_name
      from public.speed_competition_placements p
      join public.speed_teams t on t.id = p.team_id
      join public.speed_competitions c on c.id = p.competition_id
      where ($1::text is null or c.slug = $1)
      order by c.name, p.place
      `,
      [competition],
    )
    return r.rows
  })

  return NextResponse.json({ placements: rows })
}

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const competitionSlug = String(body.competition_slug || '')
  const places = Array.isArray(body.places) ? body.places : null
  if (!competitionSlug || !places?.length) {
    return NextResponse.json(
      { error: 'competition_slug and places[] required' },
      { status: 400 },
    )
  }

  try {
    const result = await withDb(async (client) => {
      const comp = await client.query(
        `select id, sport_id, name, slug from public.speed_competitions where slug = $1`,
        [competitionSlug],
      )
      if (!comp.rows[0]) throw new Error('Competition not found')
      const c = comp.rows[0]

      const awarded: unknown[] = []
      const skipped: { place: number; reason: string }[] = []

      for (const p of places) {
        const place = Number(p.place)
        const teamId = String(p.team_id || '')
        if (place < 1 || place > 4 || !teamId) {
          skipped.push({ place, reason: 'Invalid place or team' })
          continue
        }

        const existing = await client.query(
          `select id from public.speed_competition_placements where competition_id = $1 and place = $2`,
          [c.id, place],
        )
        if (existing.rows[0]) {
          skipped.push({ place, reason: 'Already awarded for this competition' })
          continue
        }

        const team = await client.query(`select id, name, number from public.speed_teams where id = $1`, [
          teamId,
        ])
        if (!team.rows[0]) {
          skipped.push({ place, reason: 'Team not found' })
          continue
        }

        const inserted = await client.query(
          `
          insert into public.speed_results
            (sport_id, team_id, place, event_category, approval_status)
          values ($1, $2, $3, 'team_sport', 'pending')
          returning *
          `,
          [c.sport_id, teamId, place],
        )

        const approved = await client.query(`select * from public.speed_approve_result($1)`, [
          inserted.rows[0].id,
        ])

        const placement = await client.query(
          `
          insert into public.speed_competition_placements
            (competition_id, place, team_id, result_id)
          values ($1, $2, $3, $4)
          returning *
          `,
          [c.id, place, teamId, approved.rows[0]?.id || inserted.rows[0].id],
        )

        await client.query(
          `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
           values ('award_competition_placement', 'competition', $1, $2::jsonb, $3)`,
          [
            c.id,
            JSON.stringify({
              place,
              team_id: teamId,
              team_name: team.rows[0].name,
              result: approved.rows[0] || inserted.rows[0],
              placement: placement.rows[0],
            }),
            `${c.name}: ${place} place → ${team.rows[0].name} (overall SPEED points)`,
          ],
        )

        awarded.push({
          place,
          team: team.rows[0],
          placement: placement.rows[0],
          result: approved.rows[0] || inserted.rows[0],
        })
      }

      return { competition: c, awarded, skipped }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Placement failed' },
      { status: 400 },
    )
  }
}
