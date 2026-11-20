import * as XLSX from 'xlsx'

export type ImportRowError = { row: number; sheet?: string; file?: string; message: string }

export type ParsedStudent = {
  roll: string
  name: string
  sectionCode: string
  gender: 'male' | 'female' | 'unspecified' | null
  batch: string | null
  source: string
}

export type ParseReport = {
  students: ParsedStudent[]
  errors: ImportRowError[]
  skippedSheets: string[]
}

type Row = Record<string, unknown>

function normKey(k: string) {
  return k
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

function cell(row: Row, keys: string[]) {
  const map = new Map<string, unknown>()
  for (const [k, v] of Object.entries(row)) {
    map.set(normKey(k), v)
  }
  for (const key of keys) {
    const v = map.get(normKey(key))
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/** Sheet / label → speed_sections.code. Faculty never maps. */
const SHEET_SECTION_MAP: Record<string, string> = {
  // Junior / 1st year MBA
  'core 1': 'JUN-1',
  'core1': 'JUN-1',
  'sec 1': 'JUN-1',
  'section 1': 'JUN-1',
  'jun-1': 'JUN-1',
  'core 2': 'JUN-2',
  'core2': 'JUN-2',
  'sec 2': 'JUN-2',
  'section 2': 'JUN-2',
  'jun-2': 'JUN-2',
  'core 3': 'JUN-3',
  'core3': 'JUN-3',
  'sec 3': 'JUN-3',
  'section 3': 'JUN-3',
  'jun-3': 'JUN-3',
  'core 4': 'JUN-4',
  'core4': 'JUN-4',
  'sec 4': 'JUN-4',
  'section 4': 'JUN-4',
  'jun-4': 'JUN-4',
  'core 5': 'JUN-5',
  'core5': 'JUN-5',
  'sec 5': 'JUN-5',
  'section 5': 'JUN-5',
  'jun-5': 'JUN-5',
  'ai&ds': 'JUN-AIDS',
  'ai & ds': 'JUN-AIDS',
  'aids': 'JUN-AIDS',
  'ai_ds': 'JUN-AIDS',
  'jun-aids': 'JUN-AIDS',
  bkfs: 'JUN-BKFS',
  'jun-bkfs': 'JUN-BKFS',
  hrm: 'JUN-HR',
  hr: 'JUN-HR',
  'jun-hr': 'JUN-HR',
  msm: 'JUN-MSM',
  'jun-msm': 'JUN-MSM',
  ib: 'JUN-IB',
  'jun-ib': 'JUN-IB',

  // Senior MBA (when files arrive)
  'sen-1': 'SEN-1',
  'senior 1': 'SEN-1',
  'sen core 1': 'SEN-1',
  'sen-2': 'SEN-2',
  'senior 2': 'SEN-2',
  'sen-3': 'SEN-3',
  'senior 3': 'SEN-3',
  'sen-4': 'SEN-4',
  'senior 4': 'SEN-4',
  'sen-5': 'SEN-5',
  'senior 5': 'SEN-5',
  'sen-6': 'SEN-6',
  'senior 6': 'SEN-6',
  'sen-msm': 'SEN-MSM',
  'sen msm': 'SEN-MSM',
  'sen-ib': 'SEN-IB',
  'sen ib': 'SEN-IB',
  'sen-bkfs': 'SEN-BKFS',
  'sen bkfs': 'SEN-BKFS',
  'sen-aids': 'SEN-AIDS',
  'sen aids': 'SEN-AIDS',
  'sen-hr': 'SEN-HR',
  'sen hr': 'SEN-HR',
  'sen hrm': 'SEN-HR',

  // IPM cohorts (all map into IPM team via IPM-1/2/3)
  'ipm-1': 'IPM-1',
  'ipm 1': 'IPM-1',
  'ipm-2': 'IPM-2',
  'ipm 2': 'IPM-2',
  'ipm-3': 'IPM-3',
  'ipm 3': 'IPM-3',
}

const SKIP_SHEETS = new Set([
  'all 1st years',
  'all first years',
  'all juniors',
  'summary',
  'faculty',
  'maestros',
])

function sheetSectionCode(sheetName: string): string | null {
  const key = sheetName.trim().toLowerCase()
  if (SKIP_SHEETS.has(key)) return null
  if (key.includes('faculty') || key.includes('maestro')) return null
  return SHEET_SECTION_MAP[key] || null
}

/** Infer IPM section from filename when the sheet has no section column. */
export function inferIpmSectionFromFilename(filename: string): string | null {
  const f = filename.toLowerCase()
  // Newest batch → IPM-1, middle → IPM-2, oldest → IPM-3
  if (f.includes('2026') || f.includes('26-29') || f.includes('2026-29')) return 'IPM-1'
  if (f.includes('2025') || f.includes('25-28') || f.includes('2025-28')) return 'IPM-2'
  if (f.includes('2024') || f.includes('24-27') || f.includes('2024-2027') || f.includes('2024-27'))
    return 'IPM-3'
  if (/\bipm\b/.test(f)) return 'IPM-1'
  return null
}

function parseGender(raw: string): ParsedStudent['gender'] {
  const g = raw.toLowerCase()
  if (!g) return null
  if (g.startsWith('f')) return 'female'
  if (g.startsWith('m')) return 'male'
  return 'unspecified'
}

function isFacultySection(code: string) {
  return code === 'FAC' || code.startsWith('FAC')
}

function extractFromSheet(
  rows: Row[],
  opts: {
    fileName: string
    sheetName: string
    forcedSection?: string | null
  },
): { students: ParsedStudent[]; errors: ImportRowError[] } {
  const students: ParsedStudent[] = []
  const errors: ImportRowError[] = []
  const forced = opts.forcedSection || null

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const roll = cell(row, [
      'tapmi_roll_no',
      'tapmi_roll',
      'tapmi_roll_number',
      'roll_number',
      'roll_no',
      'rollno',
      'roll',
    ])
    const name = cell(row, [
      'name_of_the_student',
      'student_name',
      'full_name',
      'name',
      'student',
    ])
    const sectionFromRow = cell(row, ['section', 'section_code', 'section_name']).toUpperCase()
    const gender = parseGender(cell(row, ['gender']))
    const batch = cell(row, ['batch', 'batch_year', 'year']) || null

    if (!roll && !name) continue

    if (!roll || !name) {
      errors.push({
        row: i + 2,
        sheet: opts.sheetName,
        file: opts.fileName,
        message: 'Missing roll or name',
      })
      continue
    }

    let sectionCode = (forced || sectionFromRow || '').toUpperCase()
    if (sectionCode && SHEET_SECTION_MAP[sectionCode.toLowerCase()]) {
      sectionCode = SHEET_SECTION_MAP[sectionCode.toLowerCase()]
    }

    if (!sectionCode) {
      errors.push({
        row: i + 2,
        sheet: opts.sheetName,
        file: opts.fileName,
        message: 'Could not resolve section (add section column or use a named section sheet)',
      })
      continue
    }

    if (isFacultySection(sectionCode)) {
      errors.push({
        row: i + 2,
        sheet: opts.sheetName,
        file: opts.fileName,
        message: 'Faculty skipped — no registration required',
      })
      continue
    }

    students.push({
      roll: roll.toUpperCase(),
      name,
      sectionCode,
      gender,
      batch,
      source: `${opts.fileName} · ${opts.sheetName}`,
    })
  }

  return { students, errors }
}

export function parseStudentWorkbook(
  buffer: Buffer,
  fileName: string,
): ParseReport {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const students: ParsedStudent[] = []
  const errors: ImportRowError[] = []
  const skippedSheets: string[] = []
  const ipmDefault = inferIpmSectionFromFilename(fileName)

  const sectionSheets = workbook.SheetNames.filter((n) => sheetSectionCode(n))
  const preferSectionSheets = sectionSheets.length > 0

  for (const sheetName of workbook.SheetNames) {
    const mapped = sheetSectionCode(sheetName)
    const skipAggregate = preferSectionSheets && SKIP_SHEETS.has(sheetName.trim().toLowerCase())

    if (skipAggregate || SKIP_SHEETS.has(sheetName.trim().toLowerCase())) {
      skippedSheets.push(sheetName)
      continue
    }

    if (sheetName.toLowerCase().includes('faculty') || sheetName.toLowerCase().includes('maestro')) {
      skippedSheets.push(sheetName)
      continue
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })
    if (rows.length === 0) {
      skippedSheets.push(sheetName)
      continue
    }

    const forcedSection = mapped || (ipmDefault && !mapped ? ipmDefault : null)

    // Single generic sheet (IPM lists): use filename IPM inference
    const result = extractFromSheet(rows, {
      fileName,
      sheetName,
      forcedSection:
        forcedSection ||
        (workbook.SheetNames.length === 1 && ipmDefault ? ipmDefault : null),
    })

    students.push(...result.students)
    errors.push(...result.errors)
  }

  // Dedupe by roll within this file (last wins)
  const byRoll = new Map<string, ParsedStudent>()
  for (const s of students) byRoll.set(s.roll, s)

  return {
    students: [...byRoll.values()],
    errors,
    skippedSheets,
  }
}

export function mergeParseReports(reports: ParseReport[]): ParseReport {
  const byRoll = new Map<string, ParsedStudent>()
  const errors: ImportRowError[] = []
  const skippedSheets: string[] = []
  for (const r of reports) {
    for (const s of r.students) byRoll.set(s.roll, s)
    errors.push(...r.errors)
    skippedSheets.push(...r.skippedSheets)
  }
  return { students: [...byRoll.values()], errors, skippedSheets }
}
