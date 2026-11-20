'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Comp = {
  id: string
  slug: string
  name: string
  format_status: string
  category: string | null
  points_win: number | null
  points_draw: number | null
  points_loss: number | null
  points_provisional: boolean
  group_fixtures: number
  approved_matches: number
  sport_name: string
}

export default function OpsTournamentPage() {
  const [competitions, setCompetitions] = useState<Comp[]>([])
  const [counts, setCounts] = useState<{ group_fx: number; sf: number; finals: number } | null>(
    null,
  )
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    const res = await fetch('/api/ops/tournament')
    if (res.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const data = await res.json()
    setCompetitions(data.competitions || [])
    setCounts(data.counts || null)
  }

  useEffect(() => {
    void load()
  }, [])

  async function regenerate() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/tournament', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(
        data.report?.validationErrors?.length
          ? `Validation errors: ${data.report.validationErrors.join('; ')}`
          : `Generate OK · group +${data.report.groupFixtures} · KO +${data.report.knockoutShells} · skipped ${data.report.skippedExisting}`,
      )
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function publishCompetition(slug: string) {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/fixtures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish_competition: slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(`Published ${data.published} group fixtures for ${slug}`)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-[0.08em]">Tournament</h2>
          <p className="mt-2 text-sm text-[var(--speed-muted)]">
            Official draws, group fixtures, and knockout shells. Scheduling stays under{' '}
            <Link href="/ops/fixtures" className="text-[var(--speed-gold)] hover:underline">
              Fixtures
            </Link>
            ; winners under{' '}
            <Link href="/ops/results" className="text-[var(--speed-gold)] hover:underline">
              Results
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void regenerate()}
          className="speed-ghost text-sm disabled:opacity-40"
        >
          {busy ? 'Generating…' : 'Re-run generate (idempotent)'}
        </button>
      </div>

      {counts && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Group fixtures', counts.group_fx],
            ['Semi-finals', counts.sf],
            ['Finals', counts.finals],
          ].map(([label, n]) => (
            <div key={String(label)} className="border border-white/10 px-4 py-4">
              <p className="text-xs tracking-[0.2em] text-[var(--speed-muted)]">{label}</p>
              <p className="mt-1 font-display text-3xl">{n}</p>
            </div>
          ))}
        </div>
      )}

      {msg && <p className="text-sm text-[var(--speed-gold)]">{msg}</p>}

      <ul className="space-y-2">
        {competitions.map((c) => (
          <li key={c.id} className="border border-white/10 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl tracking-[0.06em] text-white">{c.name}</p>
              <span className="text-[var(--speed-muted)]">
                {c.format_status === 'pending' ? 'Format TBA' : 'Active'}
                {c.category ? ` · ${c.category}` : ''}
              </span>
            </div>
            {c.format_status === 'active' && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-[var(--speed-muted)]">
                  Group fixtures {c.group_fixtures} · Results {c.approved_matches}
                  {c.points_provisional
                    ? ` · Points ${c.points_win}/${c.points_draw}/${c.points_loss} (provisional)`
                    : ''}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void publishCompetition(c.slug)}
                  className="border border-white/20 px-2.5 py-1 text-xs tracking-wide text-white/80 hover:border-[var(--speed-gold)] hover:text-[var(--speed-gold)] disabled:opacity-40"
                >
                  Publish group fixtures
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
