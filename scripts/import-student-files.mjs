/**
 * One-shot: import 1st-year + IPM Excel files into speed_students.
 * Usage: node scripts/import-student-files.mjs
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { Client } from 'pg'

const require = createRequire(import.meta.url)

// Load compiled? Use dynamic import of ts via tsx — instead duplicate thin parse using xlsx
const XLSX = require('xlsx')

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (!m) continue
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const FILES = [
  path.resolve('C:/Users/prana/OneDrive/Desktop/SPORTSCOM/1st_Years_Section_wise.xlsx'),
  path.resolve('C:/Users/prana/Downloads/IPM 2026-29 List.xlsx'),
  path.resolve('C:/Users/prana/Downloads/IPM 2025-28 LIST.xlsx'),
  path.resolve('C:/Users/prana/Downloads/IPM 2024-2027 LIST.xlsx'),
]

// Inline mirror of parser mapping (keep in sync with student-import.ts)
const SHEET_SECTION_MAP = {
  'core 1': 'JUN-1',
  'core 2': 'JUN-2',
  'core 3': 'JUN-3',
  'core 4': 'JUN-4',
  'core 5': 'JUN-5',
  'ai&ds': 'JUN-AIDS',
  bkfs: 'JUN-BKFS',
  hrm: 'JUN-HR',
  msm: 'JUN-MSM',
  ib: 'JUN-IB',
}

const SKIP = new Set(['all 1st years', 'faculty', 'maestros', 'summary'])

function normKey(k) {
  return k.toLowerCase().replace(/\./g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

function cell(row, keys) {
  const map = new Map()
  for (const [k, v] of Object.entries(row)) map.set(normKey(k), v)
  for (const key of keys) {
    const v = map.get(normKey(key))
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function inferIpm(filename) {
  const f = filename.toLowerCase()
  if (f.includes('2026')) return 'IPM-1'
  if (f.includes('2025')) return 'IPM-2'
  if (f.includes('2024')) return 'IPM-3'
  return null
}

function parseFile(filePath) {
  const fileName = path.basename(filePath)
  const wb = XLSX.readFile(filePath)
  const students = []
  const errors = []
  const ipm = inferIpm(fileName)
  const sectionSheets = wb.SheetNames.filter((n) => SHEET_SECTION_MAP[n.trim().toLowerCase()])
  const prefer = sectionSheets.length > 0

  for (const sheetName of wb.SheetNames) {
    const key = sheetName.trim().toLowerCase()
    if (prefer && SKIP.has(key)) continue
    if (SKIP.has(key) || key.includes('faculty')) continue
    const mapped = SHEET_SECTION_MAP[key] || null
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' })
    const forced = mapped || (wb.SheetNames.length === 1 && ipm ? ipm : ipm && !mapped ? ipm : null)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const roll = cell(row, [
        'tapmi_roll_no',
        'tapmi_roll',
        'roll_number',
        'roll_no',
        'roll',
      ])
      const name = cell(row, ['name_of_the_student', 'full_name', 'name', 'student_name'])
      if (!roll && !name) continue
      if (!roll || !name) {
        errors.push(`${fileName} ${sheetName} row ${i + 2}: missing roll/name`)
        continue
      }
      const section = (forced || cell(row, ['section', 'section_code']).toUpperCase() || '').toUpperCase()
      if (!section) {
        errors.push(`${fileName} ${sheetName} row ${i + 2}: no section`)
        continue
      }
      if (section === 'FAC') continue
      const g = cell(row, ['gender']).toLowerCase()
      const gender = g.startsWith('f') ? 'female' : g.startsWith('m') ? 'male' : g ? 'unspecified' : null
      students.push({ roll: roll.toUpperCase(), name, sectionCode: section, gender })
    }
  }

  const by = new Map()
  for (const s of students) by.set(s.roll, s)
  return { students: [...by.values()], errors, fileName }
}

const ref = process.env.SUPABASE_PROJECT_REF || 'xiotbqcaiiefrrsyquxu'
const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT || 6543),
  user: `postgres.${ref}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()
const sections = await client.query('select id, code from speed_sections')
const sectionByCode = new Map(sections.rows.map((s) => [s.code.toUpperCase(), s.id]))
const teamSections = await client.query(`
  select ts.section_id, t.id as team_id, t.code as team_code, t.name as team_name
  from speed_team_sections ts join speed_teams t on t.id = ts.team_id
`)
const teamBySection = new Map(
  teamSections.rows.map((r) => [r.section_id, { id: r.team_id, code: r.team_code, name: r.team_name }]),
)

let upserted = 0
const allErrors = []
const byTeam = new Map()

await client.query('begin')
try {
  for (const filePath of FILES) {
    if (!fs.existsSync(filePath)) {
      console.error('Missing file', filePath)
      continue
    }
    const parsed = parseFile(filePath)
    console.log(`\n${parsed.fileName}: ${parsed.students.length} students, ${parsed.errors.length} parse notes`)
    allErrors.push(...parsed.errors)

    for (const s of parsed.students) {
      const sectionId = sectionByCode.get(s.sectionCode)
      if (!sectionId) {
        allErrors.push(`Unknown section ${s.sectionCode} for ${s.roll}`)
        continue
      }
      const team = teamBySection.get(sectionId)
      if (!team) {
        allErrors.push(`No team for ${s.sectionCode} ${s.roll}`)
        continue
      }
      if (team.code === 'T11') continue

      await client.query(
        `insert into speed_students (roll_number, full_name, section_id, team_id, gender, active)
         values ($1,$2,$3,$4,$5,true)
         on conflict (roll_number) do update set
           full_name = excluded.full_name,
           section_id = excluded.section_id,
           team_id = excluded.team_id,
           gender = coalesce(excluded.gender, speed_students.gender),
           active = true,
           updated_at = now()`,
        [s.roll, s.name, sectionId, team.id, s.gender],
      )
      upserted += 1
      byTeam.set(team.name, (byTeam.get(team.name) || 0) + 1)
    }
  }

  await client.query(
    `insert into speed_audit_logs (action, entity_type, after_data, reason)
     values ('import_students', 'students', $1::jsonb, 'Bulk 1st-year + IPM import')`,
    [JSON.stringify({ upserted, files: FILES.map((f) => path.basename(f)) })],
  )
  await client.query('commit')
} catch (e) {
  await client.query('rollback')
  throw e
}

const count = await client.query(`select count(*)::int as n from speed_students where active`)
const byTeamDb = await client.query(`
  select t.name, count(*)::int as n
  from speed_students s join speed_teams t on t.id = s.team_id
  where s.active group by t.name order by t.name
`)
console.log('\nUpserted this run:', upserted)
console.log('Active students in DB:', count.rows[0].n)
console.log('By team:', byTeamDb.rows)
if (allErrors.length) {
  console.log('\nSample errors:', allErrors.slice(0, 15))
  console.log('Total notes:', allErrors.length)
}
await client.end()
