import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'
import { buildMatchSummary } from '@/lib/tournament/score-schemas'

/**
 * Match results only — never writes to speed_points_ledger / overall SPEED standings.
 *
 * GET  ?status=&competition=&sport=&stage=
 * POST { fixture_id, score_a?, score_b?, winner?: 'a'|'b'|null, is_draw?, metrics?,
 *        notes?, status?: 'draft'|'pending'|'approved', summary? }
 * PATCH { id, action: 'approve'|'reject'|'correct', ...fields for correct }
 */
export async function GET(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const competition = searchParams.get('competition')
  const sport = searchParams.get('sport')
  const stage = searchParams.get('stage')
  const awaiting = searchParams.get('awaiting') === '1'

  const data = await withDb(async (client) => {
    if (awaiting) {
      const r = await client.query(
        `
        select f.id as fixture_id, f.status as fixture_status, f.stage, f.starts_at, f.venue,
               f.published, c.slug as competition_slug, c.name as competition_name,
               g.code as group_code, s.slug as sport_slug, s.name as sport_name,
               ta.name as team_a_name, tb.name as team_b_name,
               ta.id as team_a_id, tb.id as team_b_id
        from public.speed_fixtures f
        join public.speed_sports s on s.id = f.sport_id
        left join public.speed_competitions c on c.id = f.competition_id
        left join public.speed_competition_groups g on g.id = f.group_id
        left join public.speed_teams ta on ta.id = f.team_a_id
        left join public.speed_teams tb on tb.id = f.team_b_id
        where f.team_a_id is not null and f.team_b_id is not null
          and f.status not in ('cancelled', 'abandoned')
          and not exists (
            select 1 from public.speed_match_results mr where mr.fixture_id = f.id
          )
          and ($1::text is null or s.slug = $1)
          and ($2::text is null or c.slug = $2)
          and ($3::text is null or f.stage = $3)
        order by coalesce(f.starts_at, f.created_at) desc
        limit 200
        `,
        [sport, competition, stage],
      )
      return { awaiting: r.rows, results: [] }
    }

    const r = await client.query(
      `
      select mr.*,
             f.status as fixture_status, f.stage, f.starts_at, f.venue, f.published,
             f.team_a_id, f.team_b_id,
             c.slug as competition_slug, c.name as competition_name,
             g.code as group_code,
             s.slug as sport_slug, s.name as sport_name,
             ta.name as team_a_name, tb.name as team_b_name,
             tw.name as winner_name
      from public.speed_match_results mr
      join public.speed_fixtures f on f.id = mr.fixture_id
      join public.speed_sports s on s.id = f.sport_id
      left join public.speed_competitions c on c.id = coalesce(mr.competition_id, f.competition_id)
      left join public.speed_competition_groups g on g.id = f.group_id
      left join public.speed_teams ta on ta.id = f.team_a_id
      left join public.speed_teams tb on tb.id = f.team_b_id
      left join public.speed_teams tw on tw.id = mr.winner_team_id
      where ($1::text is null or mr.approval_status = $1)
        and ($2::text is null or s.slug = $2)
        and ($3::text is null or c.slug = $3)
        and ($4::text is null or f.stage = $4)
      order by coalesce(mr.approved_at, mr.entered_at) desc
      limit 300
      `,
      [status, sport, competition, stage],
    )
    return { results: r.rows, awaiting: [] }
  })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const fixtureId = String(body.fixture_id || '')
  if (!fixtureId) {
    return NextResponse.json({ error: 'fixture_id required' }, { status: 400 })
  }

  const entryStatus = String(body.status || 'draft')
  if (!['draft', 'pending', 'approved'].includes(entryStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const payload = await withDb(async (client) => {
      const fx = await client.query(
        `
        select f.*, ta.name as team_a_name, tb.name as team_b_name,
               ta.id as team_a_uuid, tb.id as team_b_uuid,
               s.name as sport_name, s.slug as sport_slug,
               c.name as competition_name, c.slug as competition_slug
        from public.speed_fixtures f
        join public.speed_sports s on s.id = f.sport_id
        left join public.speed_competitions c on c.id = f.competition_id
        left join public.speed_teams ta on ta.id = f.team_a_id
        left join public.speed_teams tb on tb.id = f.team_b_id
        where f.id = $1
        `,
        [fixtureId],
      )
      if (!fx.rows[0]) throw new Error('Fixture not found')
      const f = fx.rows[0]
      if (!f.team_a_uuid || !f.team_b_uuid) throw new Error('Fixture needs both teams')

      const isDraw = Boolean(body.is_draw)
      let winnerId: string | null = null
      if (!isDraw) {
        if (body.winner_team_id) winnerId = String(body.winner_team_id)
        else if (body.winner === 'a') winnerId = f.team_a_uuid
        else if (body.winner === 'b') winnerId = f.team_b_uuid
        else throw new Error('winner or is_draw required')
        if (winnerId !== f.team_a_uuid && winnerId !== f.team_b_uuid) {
          throw new Error('Winner must be one of the fixture teams')
        }
      }

      const scoreA = body.score_a != null ? Number(body.score_a) : null
      const scoreB = body.score_b != null ? Number(body.score_b) : null
      const metrics =
        body.metrics && typeof body.metrics === 'object' ? body.metrics : {}
      const notes = body.notes != null ? String(body.notes) : null

      const winnerName =
        winnerId === f.team_a_uuid
          ? f.team_a_name
          : winnerId === f.team_b_uuid
            ? f.team_b_name
            : null

      const summary =
        body.summary != null
          ? String(body.summary)
          : buildMatchSummary({
              competitionName: f.competition_name || f.sport_name,
              teamA: f.team_a_name,
              teamB: f.team_b_name,
              isDraw,
              winnerName,
              scoreA,
              scoreB,
              metrics,
            })

      const existing = await client.query(
        `select id, approval_status from public.speed_match_results where fixture_id = $1`,
        [fixtureId],
      )

      const approvedAt = entryStatus === 'approved' ? new Date().toISOString() : null
      const approvedBy = entryStatus === 'approved' ? 'ops' : null

      let row
      if (existing.rows[0]) {
        if (existing.rows[0].approval_status === 'approved' && entryStatus !== 'approved') {
          throw new Error('Approved result — use PATCH correct instead')
        }
        const upd = await client.query(
          `
          update public.speed_match_results set
            competition_id = $2,
            score_a = $3,
            score_b = $4,
            winner_team_id = $5,
            is_draw = $6,
            metrics = $7::jsonb,
            approval_status = $8,
            notes = coalesce($9, notes),
            summary = $10,
            entered_by_label = coalesce(entered_by_label, 'ops'),
            approved_at = case when $8 = 'approved' then coalesce(approved_at, now()) else approved_at end,
            approved_by_label = case when $8 = 'approved' then coalesce(approved_by_label, $11) else approved_by_label end
          where fixture_id = $1
          returning *
          `,
          [
            fixtureId,
            f.competition_id,
            scoreA,
            scoreB,
            winnerId,
            isDraw,
            JSON.stringify(metrics),
            entryStatus,
            notes,
            summary,
            approvedBy,
          ],
        )
        row = upd.rows[0]
      } else {
        const ins = await client.query(
          `
          insert into public.speed_match_results
            (fixture_id, competition_id, score_a, score_b, winner_team_id, is_draw,
             metrics, approval_status, notes, summary, entered_by_label,
             approved_at, approved_by_label)
          values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,'ops',$11,$12)
          returning *
          `,
          [
            fixtureId,
            f.competition_id,
            scoreA,
            scoreB,
            winnerId,
            isDraw,
            JSON.stringify(metrics),
            entryStatus,
            notes,
            summary,
            approvedAt,
            approvedBy,
          ],
        )
        row = ins.rows[0]
      }

      if (entryStatus === 'approved') {
        await client.query(
          `update public.speed_fixtures set status = 'completed', updated_at = now() where id = $1`,
          [fixtureId],
        )
      }

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
         values ($1, 'match_result', $2, $3::jsonb, $4)`,
        [
          entryStatus === 'approved' ? 'approve_match_result' : 'save_match_result',
          row.id,
          JSON.stringify(row),
          summary,
        ],
      )

      return { match_result: row, summary }
    })

    return NextResponse.json({ ok: true, ...payload })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Save failed' },
      { status: 400 },
    )
  }
}

export async function PATCH(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const id = String(body.id || '')
  const action = String(body.action || '')
  if (!id || !['approve', 'reject', 'correct'].includes(action)) {
    return NextResponse.json({ error: 'id and action required' }, { status: 400 })
  }

  try {
    const payload = await withDb(async (client) => {
      const cur = await client.query(
        `
        select mr.*, f.team_a_id, f.team_b_id, f.id as fid,
               ta.name as team_a_name, tb.name as team_b_name,
               s.name as sport_name, c.name as competition_name
        from public.speed_match_results mr
        join public.speed_fixtures f on f.id = mr.fixture_id
        join public.speed_sports s on s.id = f.sport_id
        left join public.speed_competitions c on c.id = coalesce(mr.competition_id, f.competition_id)
        left join public.speed_teams ta on ta.id = f.team_a_id
        left join public.speed_teams tb on tb.id = f.team_b_id
        where mr.id = $1
        `,
        [id],
      )
      if (!cur.rows[0]) throw new Error('Match result not found')
      const mr = cur.rows[0]

      if (action === 'approve') {
        if (mr.approval_status === 'approved') throw new Error('Already approved')
        const upd = await client.query(
          `
          update public.speed_match_results set
            approval_status = 'approved',
            approved_at = now(),
            approved_by_label = 'ops'
          where id = $1
          returning *
          `,
          [id],
        )
        await client.query(
          `update public.speed_fixtures set status = 'completed', updated_at = now() where id = $1`,
          [mr.fid],
        )
        await client.query(
          `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
           values ('approve_match_result', 'match_result', $1, $2::jsonb, $3)`,
          [id, JSON.stringify(upd.rows[0]), mr.summary || 'Approved'],
        )
        return { match_result: upd.rows[0] }
      }

      if (action === 'reject') {
        const upd = await client.query(
          `
          update public.speed_match_results set approval_status = 'rejected'
          where id = $1 returning *
          `,
          [id],
        )
        await client.query(
          `insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
           values ('reject_match_result', 'match_result', $1, $2::jsonb, $3)`,
          [id, JSON.stringify(upd.rows[0]), body.reason || 'Rejected'],
        )
        return { match_result: upd.rows[0] }
      }

      // correct — update scores; keep approved; invalidate qualification if competition set
      const isDraw = body.is_draw != null ? Boolean(body.is_draw) : mr.is_draw
      let winnerId: string | null = mr.winner_team_id
      if (body.is_draw === true) winnerId = null
      else if (body.winner === 'a') winnerId = mr.team_a_id
      else if (body.winner === 'b') winnerId = mr.team_b_id
      else if (body.winner_team_id) winnerId = String(body.winner_team_id)

      if (!isDraw && !winnerId) throw new Error('Winner required unless draw')

      const scoreA = body.score_a !== undefined ? Number(body.score_a) : mr.score_a
      const scoreB = body.score_b !== undefined ? Number(body.score_b) : mr.score_b
      const metrics =
        body.metrics && typeof body.metrics === 'object' ? body.metrics : mr.metrics

      const winnerName =
        winnerId === mr.team_a_id
          ? mr.team_a_name
          : winnerId === mr.team_b_id
            ? mr.team_b_name
            : null

      const summary = buildMatchSummary({
        competitionName: mr.competition_name || mr.sport_name,
        teamA: mr.team_a_name,
        teamB: mr.team_b_name,
        isDraw,
        winnerName,
        scoreA,
        scoreB,
        metrics,
      })

      const before = { ...mr }
      const upd = await client.query(
        `
        update public.speed_match_results set
          score_a = $2,
          score_b = $3,
          winner_team_id = $4,
          is_draw = $5,
          metrics = $6::jsonb,
          summary = $7,
          approval_status = 'approved',
          approved_at = now(),
          notes = coalesce($8, notes)
        where id = $1
        returning *
        `,
        [
          id,
          scoreA,
          scoreB,
          winnerId,
          isDraw,
          JSON.stringify(metrics),
          summary,
          body.notes != null ? String(body.notes) : null,
        ],
      )

      if (mr.competition_id) {
        await client.query(
          `
          update public.speed_qualification_reviews
          set status = 'invalidated', invalidated_at = now(), updated_at = now()
          where competition_id = $1 and status = 'confirmed'
          `,
          [mr.competition_id],
        )
      }

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, before_data, after_data, reason)
         values ('correct_match_result', 'match_result', $1, $2::jsonb, $3::jsonb, $4)`,
        [
          id,
          JSON.stringify(before),
          JSON.stringify(upd.rows[0]),
          body.reason || 'Correction — standings recalculated from approved results',
        ],
      )

      return { match_result: upd.rows[0], summary }
    })

    return NextResponse.json({ ok: true, ...payload })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed' },
      { status: 400 },
    )
  }
}
