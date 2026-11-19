import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'
import { checkSportCap } from '@/lib/rules/cap'

export async function PATCH(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const roll = String(body.roll_number || '').trim()
  const sports: string[] = Array.isArray(body.sports) ? body.sports.map(String) : []
  const reason = String(body.reason || 'SportsCom correction').trim()

  const cap = checkSportCap(sports)
  if (!cap.ok) {
    return NextResponse.json({ error: cap.reason }, { status: 400 })
  }
  if (!roll) {
    return NextResponse.json({ error: 'roll_number required' }, { status: 400 })
  }

  try {
    const result = await withDb(async (client) => {
      const student = await client.query(
        `select id, roll_number from public.speed_students where upper(roll_number)=upper($1) and active for update`,
        [roll],
      )
      if (!student.rows[0]) throw new Error('Student not found')
      const studentId = student.rows[0].id as string

      const player = await client.query(`select * from public.speed_ensure_player_id($1)`, [studentId])
      const playerId = player.rows[0].id
      const playerCode = player.rows[0].player_code

      const reg = await client.query(
        `
        insert into public.speed_registrations (student_id, status, player_id, submitted_at, version)
        values ($1, 'sportscom_modified', $2, coalesce((select submitted_at from public.speed_registrations where student_id=$1), now()), 1)
        on conflict (student_id) do update set
          status = 'sportscom_modified',
          player_id = excluded.player_id,
          submitted_at = coalesce(public.speed_registrations.submitted_at, now()),
          updated_at = now(),
          version = public.speed_registrations.version + 1
        returning id
        `,
        [studentId, playerId],
      )
      const regId = reg.rows[0].id

      const before = await client.query(
        `select coalesce(array_agg(sp.slug), '{}') as sports
         from public.speed_registration_sports rs
         join public.speed_sports sp on sp.id = rs.sport_id
         where rs.registration_id = $1`,
        [regId],
      )

      await client.query(`delete from public.speed_registration_sports where registration_id = $1`, [regId])
      for (const slug of [...new Set(sports.map((s) => s.toLowerCase()))]) {
        await client.query(
          `insert into public.speed_registration_sports (registration_id, sport_id)
           select $1, id from public.speed_sports where slug = $2`,
          [regId, slug],
        )
      }

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, entity_id, before_data, after_data, reason)
         values ('ops_edit_registration', 'registration', $1, $2::jsonb, $3::jsonb, $4)`,
        [
          regId,
          JSON.stringify({ sports: before.rows[0].sports }),
          JSON.stringify({ sports, player_code: playerCode }),
          reason,
        ],
      )

      return { player_code: playerCode, sports }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Update failed' }, { status: 400 })
  }
}
