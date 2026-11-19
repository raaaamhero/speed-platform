'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Dash = {
  stats: {
    students: number
    registered: number
    registration_open: boolean
    fixtures: number
    pending_results: number
    by_sport: Record<string, number>
  }
  recent: { action: string; entity_type: string; created_at: string; reason: string | null }[]
  unregistered: { roll_number: string; full_name: string; team_code: string }[]
}

export function OpsDashboard() {
  const [data, setData] = useState<Dash | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/ops/dashboard')
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load')
        return
      }
      setData(json)
    })()
  }, [])

  if (error) return <p className="text-[var(--speed-crimson)]">{error}</p>
  if (!data) return <p className="text-[var(--speed-muted)]">Loading command centre…</p>

  const pct =
    data.stats.students > 0 ? Math.round((data.stats.registered / data.stats.students) * 100) : 0

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-[0.08em]">Overview</h2>
          <p className="mt-2 text-sm text-[var(--speed-muted)]">
            Registration {data.stats.registration_open ? 'OPEN' : 'CLOSED'} · {pct}% complete
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/ops/import" className="speed-cta text-sm">
            Import Excel
          </Link>
          <Link href="/ops/students" className="speed-ghost text-sm">
            Students
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Students loaded', data.stats.students],
          ['Registered', data.stats.registered],
          ['Fixtures', data.stats.fixtures],
          ['Pending results', data.stats.pending_results],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-white/10 bg-white/[0.03] px-5 py-5">
            <p className="font-display text-xs tracking-[0.2em] text-[var(--speed-muted)]">{label}</p>
            <p className="mt-2 font-display text-4xl tracking-[0.06em]">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="font-display text-xl tracking-[0.08em]">Registrations by sport</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {Object.entries(data.stats.by_sport || {}).map(([slug, n]) => (
            <li key={slug} className="flex justify-between border border-white/10 px-4 py-3 text-sm">
              <span className="text-[var(--speed-muted)]">{slug}</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h3 className="font-display text-xl tracking-[0.08em]">Not registered yet</h3>
          <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
            {data.unregistered.length === 0 && (
              <li className="text-[var(--speed-muted)]">Everyone in the master list has registered.</li>
            )}
            {data.unregistered.map((s) => (
              <li key={s.roll_number} className="flex justify-between border-b border-white/5 py-2">
                <span>
                  {s.full_name}{' '}
                  <span className="text-[var(--speed-muted)]">({s.roll_number})</span>
                </span>
                <span className="text-[var(--speed-muted)]">{s.team_code}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-display text-xl tracking-[0.08em]">Recent activity</h3>
          <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
            {data.recent.map((a, i) => (
              <li key={`${a.created_at}-${i}`} className="border-b border-white/5 py-2">
                <p className="text-[var(--speed-ink)]">{a.action}</p>
                <p className="text-xs text-[var(--speed-muted)]">
                  {new Date(a.created_at).toLocaleString()} · {a.reason || a.entity_type}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
