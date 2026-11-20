import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

export async function GET() {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fixtures = await withDb(async (client) => {
    const r = await client.query(`
      select f.*, s.slug as sport_slug, s.name as sport_name,
             ta.name as team_a_name, ta.code as team_a_code,
             tb.name as team_b_name, tb.code as team_b_code,
             c.slug as competition_slug, c.name as competition_name,
             g.code as group_code,
             exists(
               select 1 from public.speed_match_results mr
               where mr.fixture_id = f.id and mr.approval_status = 'approved'
             ) as has_result
      from public.speed_fixtures f
      join public.speed_sports s on s.id = f.sport_id
      left join public.speed_teams ta on ta.id = f.team_a_id
      left join public.speed_teams tb on tb.id = f.team_b_id
      left join public.speed_competitions c on c.id = f.competition_id
      left join public.speed_competition_groups g on g.id = f.group_id
      order by
        case when f.stage = 'group_stage' then 0 when f.stage = 'semi_final' then 1 when f.stage = 'final' then 2 else 3 end,
        c.name nulls last,
        g.code nulls last,
        coalesce(f.starts_at, f.created_at) desc
      limit 500
    `)
    return r.rows
  })

  return NextResponse.json({ fixtures })
}

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const sportSlug = String(body.sport_slug || '')
  const teamA = body.team_a_number != null ? Number(body.team_a_number) : null
  const teamB = body.team_b_number != null ? Number(body.team_b_number) : null
  const venue = body.venue ? String(body.venue) : null
  const title = body.title ? String(body.title) : null
  let startsAt: string | null = body.starts_at ? String(body.starts_at).trim() : null
  if (startsAt === '') startsAt = null
  // Accept datetime-local without offset by treating as IST
  if (startsAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsAt)) {
    startsAt = `${startsAt}:00+05:30`
  }
  const published = Boolean(body.published)
  const status = String(body.status || 'scheduled')

  try {
    const fixture = await withDb(async (client) => {
      const sport = await client.query(`select id from public.speed_sports where slug=$1`, [sportSlug])
      if (!sport.rows[0]) throw new Error('Unknown sport')
      if (teamA != null && teamB != null && teamA === teamB) {
        throw new Error('Team A and Team B must be different')
      }
      const teamAId = teamA
        ? (await client.query(`select id from public.speed_teams where number=$1`, [teamA])).rows[0]?.id
        : null
      const teamBId = teamB
        ? (await client.query(`select id from public.speed_teams where number=$1`, [teamB])).rows[0]?.id
        : null

      const inserted = await client.query(
        `
        insert into public.speed_fixtures
          (sport_id, team_a_id, team_b_id, title, venue, starts_at, status, published)
        values ($1,$2,$3,$4,$5,$6::timestamptz,$7,$8)
        returning *
        `,
        [sport.rows[0].id, teamAId, teamBId, title, venue, startsAt, status, published],
      )

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data)
         values ('create_fixture', 'fixture', $1, $2::jsonb)`,
        [inserted.rows[0].id, JSON.stringify(inserted.rows[0])],
      )

      return inserted.rows[0]
    })

    return NextResponse.json({ ok: true, fixture })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Create failed' }, { status: 400 })
  }
}

/** Update schedule / publish. Body: { id, venue?, starts_at?, published?, status? } or { publish_competition: slug } */
export async function PATCH(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  try {
    const result = await withDb(async (client) => {
      if (body.publish_competition) {
        const slug = String(body.publish_competition)
        const updated = await client.query(
          `
          update public.speed_fixtures f
          set published = true, updated_at = now()
          from public.speed_competitions c
          where f.competition_id = c.id
            and c.slug = $1
            and f.stage = 'group_stage'
          returning f.id
          `,
          [slug],
        )
        await client.query(
          `insert into public.speed_audit_logs (action, entity_type, after_data, reason)
           values ('publish_competition_fixtures', 'competition', $1::jsonb, $2)`,
          [JSON.stringify({ slug, count: updated.rowCount }), `Published group fixtures for ${slug}`],
        )
        return { published: updated.rowCount }
      }

      const id = String(body.id || '')
      if (!id) throw new Error('Missing fixture id')

      let startsAt: string | null | undefined = undefined
      if (body.starts_at !== undefined) {
        startsAt = body.starts_at ? String(body.starts_at).trim() : null
        if (startsAt === '') startsAt = null
        if (startsAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsAt)) {
          startsAt = `${startsAt}:00+05:30`
        }
      }

      const updated = await client.query(
        `
        update public.speed_fixtures set
          venue = coalesce($2, venue),
          starts_at = case when $3::boolean then $4::timestamptz else starts_at end,
          published = coalesce($5, published),
          status = coalesce($6, status),
          updated_at = now()
        where id = $1
        returning *
        `,
        [
          id,
          body.venue !== undefined ? body.venue : null,
          startsAt !== undefined,
          startsAt ?? null,
          body.published !== undefined ? Boolean(body.published) : null,
          body.status !== undefined ? String(body.status) : null,
        ],
      )
      if (!updated.rows[0]) throw new Error('Fixture not found')
      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data)
         values ('update_fixture', 'fixture', $1, $2::jsonb)`,
        [id, JSON.stringify(updated.rows[0])],
      )
      return { fixture: updated.rows[0] }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed' },
      { status: 400 },
    )
  }
}
