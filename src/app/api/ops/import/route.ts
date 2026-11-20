import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { withDb } from '@/lib/db'
import {
  mergeParseReports,
  parseStudentWorkbook,
  type ImportRowError,
  type ParsedStudent,
} from '@/lib/ops/student-import'

async function upsertStudents(
  students: ParsedStudent[],
  parseErrors: ImportRowError[],
  fileNames: string[],
) {
  return withDb(async (client) => {
    const errors: ImportRowError[] = [...parseErrors]
    let upserted = 0
    let skippedFaculty = 0

    const sections = await client.query(`select id, code from public.speed_sections`)
    const sectionByCode = new Map<string, string>()
    for (const s of sections.rows as { id: string; code: string }[]) {
      sectionByCode.set(String(s.code).toUpperCase(), s.id)
    }

    const teamSections = await client.query(`
      select ts.section_id, t.id as team_id, t.code as team_code
      from public.speed_team_sections ts
      join public.speed_teams t on t.id = ts.team_id
    `)
    const teamBySection = new Map<string, { teamId: string; teamCode: string }>()
    for (const r of teamSections.rows as {
      section_id: string
      team_id: string
      team_code: string
    }[]) {
      teamBySection.set(r.section_id, { teamId: r.team_id, teamCode: r.team_code })
    }

    await client.query('begin')
    try {
      for (const s of students) {
        if (s.sectionCode === 'FAC') {
          skippedFaculty += 1
          continue
        }

        const sectionId = sectionByCode.get(s.sectionCode.toUpperCase())
        if (!sectionId) {
          errors.push({
            row: 0,
            file: s.source,
            message: `Unknown section ${s.sectionCode} for ${s.roll}`,
          })
          continue
        }

        const team = teamBySection.get(sectionId)
        if (!team) {
          errors.push({
            row: 0,
            file: s.source,
            message: `No team mapped for section ${s.sectionCode} (${s.roll})`,
          })
          continue
        }

        // Faculty team never registers
        if (team.teamCode === 'T11') {
          skippedFaculty += 1
          continue
        }

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
          [s.roll, s.name, sectionId, team.teamId, s.gender, s.batch],
        )
        upserted += 1
      }

      await client.query(
        `insert into public.speed_audit_logs (action, entity_type, after_data, reason)
         values ('import_students', 'students', $1::jsonb, 'Multi-file Excel import')`,
        [
          JSON.stringify({
            upserted,
            skippedFaculty,
            errors: errors.length,
            files: fileNames,
          }),
        ],
      )

      await client.query('commit')
    } catch (e) {
      await client.query('rollback')
      throw e
    }

    return {
      upserted,
      skippedFaculty,
      errors: errors.slice(0, 200),
      errorCount: errors.length,
      totalStudents: students.length,
      files: fileNames,
    }
  })
}

export async function POST(req: Request) {
  if (!(await isOpsAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const collected: File[] = []

  const multi = form.getAll('files')
  for (const item of multi) {
    if (item instanceof File && item.size > 0) collected.push(item)
  }
  const single = form.get('file')
  if (single instanceof File && single.size > 0) collected.push(single)

  if (collected.length === 0) {
    return NextResponse.json(
      { error: 'Upload one or more Excel/CSV files (1st years, IPM, seniors when ready)' },
      { status: 400 },
    )
  }

  try {
    const reports = []
    for (const file of collected) {
      const buf = Buffer.from(await file.arrayBuffer())
      reports.push(parseStudentWorkbook(buf, file.name))
    }
    const merged = mergeParseReports(reports)
    if (merged.students.length === 0) {
      return NextResponse.json(
        {
          error: 'No importable students found. Check section sheet names and roll/name columns.',
          errors: merged.errors.slice(0, 50),
          skippedSheets: merged.skippedSheets,
        },
        { status: 400 },
      )
    }

    const report = await upsertStudents(
      merged.students,
      merged.errors,
      collected.map((f) => f.name),
    )

    return NextResponse.json({
      ok: true,
      ...report,
      skippedSheets: merged.skippedSheets,
      parseErrorCount: merged.errors.length,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Import failed' },
      { status: 500 },
    )
  }
}
