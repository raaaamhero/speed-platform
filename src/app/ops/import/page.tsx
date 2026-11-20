'use client'

import { useState } from 'react'

type ImportResult = {
  upserted?: number
  skippedFaculty?: number
  totalStudents?: number
  errorCount?: number
  errors?: { row: number; sheet?: string; file?: string; message: string }[]
  files?: string[]
  skippedSheets?: string[]
}

export default function OpsImportPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const body = new FormData()
      Array.from(files).forEach((f) => body.append('files', f))
      const res = await fetch('/api/ops/import', { method: 'POST', body })
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-[0.08em]">Import students</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--speed-muted)]">
          Upload <strong className="text-white/80">multiple</strong> Excel/CSV files at once — 1st
          years (section sheets), IPM lists, and seniors when ready. Faculty / Maestros are skipped
          (no registration).
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-4 text-sm text-[var(--speed-muted)]">
        <p className="font-display text-xs tracking-[0.2em] text-[var(--speed-gold)]">SUPPORTED</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            1st years workbook with sheets: Core 1–5, AI&amp;DS, BKFS, HRM, MSM, IB (skips “All 1st
            Years”)
          </li>
          <li>IPM lists (TAPMI roll + name) — batch inferred from filename year</li>
          <li>Seniors: same pattern with SEN / senior section sheets when available</li>
        </ul>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 border border-white/10 p-5">
        <label className="block text-sm text-[var(--speed-muted)]">
          Files
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            className="mt-2 block w-full text-sm text-white"
            onChange={(e) => setFiles(e.target.files)}
          />
        </label>
        {files && files.length > 0 && (
          <ul className="text-xs text-white/60">
            {Array.from(files).map((f) => (
              <li key={f.name}>
                {f.name} · {(f.size / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          disabled={!files || files.length === 0 || busy}
          className="speed-cta w-full disabled:opacity-40 sm:w-auto"
        >
          {busy ? 'Importing…' : `Upload & import${files?.length ? ` (${files.length})` : ''}`}
        </button>
      </form>

      {error && <p className="text-[var(--speed-crimson)]">{error}</p>}

      {result && (
        <div className="border border-white/10 p-4 text-sm">
          <p>
            Imported/updated <strong className="text-white">{result.upserted}</strong> of{' '}
            {result.totalStudents} parsed students
            {result.files?.length ? ` from ${result.files.length} file(s)` : ''}.
          </p>
          {(result.skippedFaculty ?? 0) > 0 && (
            <p className="mt-1 text-[var(--speed-muted)]">
              Skipped faculty rows: {result.skippedFaculty}
            </p>
          )}
          {(result.errorCount ?? 0) > 0 && (
            <p className="mt-1 text-[var(--speed-muted)]">
              Notes / row issues: {result.errorCount} (showing up to 200)
            </p>
          )}
          {result.skippedSheets && result.skippedSheets.length > 0 && (
            <p className="mt-2 text-xs text-white/45">
              Skipped sheets: {result.skippedSheets.join(', ')}
            </p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-3 max-h-60 space-y-1 overflow-auto text-[var(--speed-muted)]">
              {result.errors.map((e, i) => (
                <li key={`${e.file}-${e.sheet}-${e.row}-${i}`}>
                  {e.file ? `${e.file} · ` : ''}
                  {e.sheet ? `${e.sheet} · ` : ''}
                  {e.row ? `Row ${e.row}: ` : ''}
                  {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
