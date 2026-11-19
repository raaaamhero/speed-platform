/** Official SPEED 2026–27 team formation from the rulebook. */

export interface SectionDef {
  code: string
  name: string
  cohort: 'senior' | 'junior' | 'faculty' | 'ipm'
}

export interface TeamDef {
  number: number
  code: string
  name: string
  sectionCodes: string[]
  /** Team 5: AIDS+HR count as one section for player-cap context */
  mergedSectionGroups?: string[][]
  captainSlots: number
}

export const SECTIONS: SectionDef[] = [
  { code: 'SEN-1', name: 'Senior Section 1', cohort: 'senior' },
  { code: 'SEN-2', name: 'Senior Section 2', cohort: 'senior' },
  { code: 'SEN-3', name: 'Senior Section 3', cohort: 'senior' },
  { code: 'SEN-4', name: 'Senior Section 4', cohort: 'senior' },
  { code: 'SEN-5', name: 'Senior Section 5', cohort: 'senior' },
  { code: 'SEN-6', name: 'Senior Section 6', cohort: 'senior' },
  { code: 'SEN-MSM', name: 'Senior MSM', cohort: 'senior' },
  { code: 'SEN-IB', name: 'Senior IB', cohort: 'senior' },
  { code: 'SEN-BKFS', name: 'Senior BKFS', cohort: 'senior' },
  { code: 'SEN-AIDS', name: 'Senior AIDS', cohort: 'senior' },
  { code: 'SEN-HR', name: 'Senior HR', cohort: 'senior' },
  { code: 'JUN-1', name: 'Junior Section 1', cohort: 'junior' },
  { code: 'JUN-2', name: 'Junior Section 2', cohort: 'junior' },
  { code: 'JUN-3', name: 'Junior Section 3', cohort: 'junior' },
  { code: 'JUN-4', name: 'Junior Section 4', cohort: 'junior' },
  { code: 'JUN-5', name: 'Junior Section 5', cohort: 'junior' },
  { code: 'JUN-IB', name: 'Junior IB', cohort: 'junior' },
  { code: 'JUN-MSM', name: 'Junior MSM', cohort: 'junior' },
  { code: 'JUN-AIDS', name: 'Junior AIDS', cohort: 'junior' },
  { code: 'JUN-BKFS', name: 'Junior BKFS', cohort: 'junior' },
  { code: 'JUN-HR', name: 'Junior HR', cohort: 'junior' },
  { code: 'FAC', name: 'Faculty', cohort: 'faculty' },
  { code: 'IPM-1', name: 'IPM 1', cohort: 'ipm' },
  { code: 'IPM-2', name: 'IPM 2', cohort: 'ipm' },
  { code: 'IPM-3', name: 'IPM 3', cohort: 'ipm' },
]

export const TEAMS: TeamDef[] = [
  { number: 1, code: 'T1', name: 'Team 1', sectionCodes: ['SEN-1', 'SEN-2'], captainSlots: 4 },
  { number: 2, code: 'T2', name: 'Team 2', sectionCodes: ['SEN-3', 'SEN-4'], captainSlots: 4 },
  { number: 3, code: 'T3', name: 'Team 3', sectionCodes: ['SEN-5', 'SEN-6'], captainSlots: 4 },
  { number: 4, code: 'T4', name: 'Team 4', sectionCodes: ['SEN-MSM', 'SEN-IB'], captainSlots: 4 },
  {
    number: 5,
    code: 'T5',
    name: 'Team 5',
    sectionCodes: ['SEN-BKFS', 'SEN-AIDS', 'SEN-HR'],
    mergedSectionGroups: [['SEN-AIDS', 'SEN-HR']],
    captainSlots: 4,
  },
  { number: 6, code: 'T6', name: 'Team 6', sectionCodes: ['JUN-1', 'JUN-2'], captainSlots: 4 },
  { number: 7, code: 'T7', name: 'Team 7', sectionCodes: ['JUN-3', 'JUN-4'], captainSlots: 4 },
  { number: 8, code: 'T8', name: 'Team 8', sectionCodes: ['JUN-5', 'JUN-IB'], captainSlots: 4 },
  { number: 9, code: 'T9', name: 'Team 9', sectionCodes: ['JUN-MSM', 'JUN-AIDS'], captainSlots: 4 },
  { number: 10, code: 'T10', name: 'Team 10', sectionCodes: ['JUN-BKFS', 'JUN-HR'], captainSlots: 4 },
  { number: 11, code: 'T11', name: 'Faculty', sectionCodes: ['FAC'], captainSlots: 0 },
  { number: 12, code: 'T12', name: 'IPM', sectionCodes: ['IPM-1', 'IPM-2', 'IPM-3'], captainSlots: 2 },
]

export function teamForSection(sectionCode: string): TeamDef | undefined {
  return TEAMS.find((t) => t.sectionCodes.includes(sectionCode))
}

export function sectionLabel(code: string): string {
  return SECTIONS.find((s) => s.code === code)?.name ?? code
}
