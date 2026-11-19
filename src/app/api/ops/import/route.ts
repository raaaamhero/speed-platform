import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'

type Row = Record<string, unknown>

function cell(row: Row, keys: string[]) {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.toLowerCase().replace(/\s+/g, '_') === key)
    if (found != null && row[found] != null && String(row[found]).trim() !== '') {
      return String(row[found]).trim()
    }
  }
  return ''
}

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Upload an Excel or CSV file' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buf, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows found in the sheet' }, { status: 400 })
  }

  const report = await withDb(async (client) => {
    const errors: { row: number; message: string }[] = []
    let upserted = 0

    const sections = await client.query(`select id, code from public.speed_sections`)
    const sectionByCode = new Map(sections.rows.map((s) => [String(s.code).toUpperCase(), s.id]))

    const teamSections = await client.query(`
      select ts.section_id, t.id as team_id
      from public.speed_team_sections ts
      join public.speed_teams t on t.id = ts.team_id
    `)
    const teamBySection = new Map(teamSections.rows.map((r) => [r.section_id, r.team_id]))

    await client.query('begin')
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const roll = cell(row, ['roll_number', 'roll', 'roll_no', 'rollno'])
        const name = cell(row, ['full_name', 'name', 'student_name', 'student'])
        const sectionCode = cell(row, ['section', 'section_code', 'section_name']).toUpperCase()
        const genderRaw = cell(row, ['gender']).toLowerCase()
        const batch = cell(row, ['batch', 'batch_year', 'year']) || null

        if (!roll || !name || !sectionCode) {
          errors.push({ row: i + 2, message: 'Missing roll / name / section' })
          continue
        }

        let sectionId = sectionByCode.get(sectionCode)
        if (!sectionId) {
          // try match by name fragment
          const match = [...sectionByCode.entries()].find(([code]) => sectionCode.includes(code) || code.includes(sectionCode))
          sectionId = match?.[1]
        }
        if (!sectionId) {
          errors.push({ row: i + 2, message: `Unknown section: ${sectionCode}` })
          continue
        }

        const teamId = teamBySection.get(sectionId)
        if (!teamId) {
          errors.push({ row: i + 2, message: `No team mapped for section ${sectionCode}` })
          continue
        }

        const gender =
          genderRaw.startsWith('f') ? 'female' : genderRaw.startsWith('m') ? 'male' : genderRaw ? 'unspecified' : null

        await client.query(
          `
          insert into public.speed_students (roll_number, full_name, section_id, team_id, gender, batch, active)
          values ($1, $2, $3, $4, $5, $6, true)
          on conflict (roll_number) do update set
            full_name = excluded.full_name,
            section_id = excluded.section_id,
            team_id = excluded.team_id,
            gender = coalesce(excluded.gender, public.speed_students.gender),
            batch = coalesce(excluded.batch, public.speed_students.batch),
            active = true,
            updated_at = now()
          `,
          [roll.toUpperCase(), name, sectionId, teamId, gender, batch],
        )
        upserted += 1
      }

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, after_data, reason)
         values ('import_students', 'students', $1::jsonb, 'Excel import')`,
        [JSON.stringify({ upserted, errors: errors.length, file: file.name })],
      )

      await client.query('commit')
    } catch (e) {
      await client.query('rollback')
      throw e
    }

    return { upserted, errors, totalRows: rows.length }
  })

  return NextResponse.json({ ok: true, ...report })
}
