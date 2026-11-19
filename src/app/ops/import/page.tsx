'use client'

import { useState } from 'react'

export default function OpsImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    upserted?: number
    errors?: { row: number; message: string }[]
    totalRows?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const body = new FormData()
      body.append('file', file)
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
        <p className="mt-2 text-sm text-[var(--speed-muted)]">
          Excel/CSV columns: <code>roll_number</code>, <code>name</code>, <code>section</code> (codes
          like SEN-1, JUN-1, IPM-1). Optional: gender, batch.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 border border-white/10 p-5">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || busy} className="speed-cta disabled:opacity-40">
          {busy ? 'Importing…' : 'Upload & import'}
        </button>
      </form>
      {error && <p className="text-[var(--speed-crimson)]">{error}</p>}
      {result && (
        <div className="border border-white/10 p-4 text-sm">
          <p>
            Imported/updated <strong>{result.upserted}</strong> of {result.totalRows} rows.
          </p>
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-3 max-h-60 space-y-1 overflow-auto text-[var(--speed-muted)]">
              {result.errors.map((e) => (
                <li key={`${e.row}-${e.message}`}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
