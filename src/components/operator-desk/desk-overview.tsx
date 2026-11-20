'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  students: number
  registered: number
  teams?: number
  fixtures: number
  fixtures_scheduled?: number
  fixtures_awaiting_results?: number
  results_pending_approval?: number
  matches_completed?: number
  upcoming_matches?: number
  active_competitions?: number
  pending_qualification?: number
  registration_open: boolean
}

type Recent = { action: string; entity_type: string; created_at: string; reason: string | null }

const MODULES = [
  { href: '/ops/operator-desk/match-results', label: 'Match Results', hint: 'Enter & approve scores' },
  { href: '/ops/operator-desk/fixtures', label: 'Fixtures', hint: 'Schedule & publish' },
  { href: '/ops/operator-desk/overall-points', label: 'Overall SPEED', hint: 'Final placements only' },
  { href: '/ops/operator-desk/competitions', label: 'Competitions', hint: 'Groups & formats' },
  { href: '/ops/operator-desk/registrations', label: 'Registrations', hint: 'Students & import' },
  { href: '/ops/operator-desk/audit', label: 'Audit Logs', hint: 'Operator activity' },
]

export function DeskOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Recent[]>([])
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
      setStats(json.stats)
      setRecent(json.recent || [])
    })()
  }, [])

  if (error) return <p className="text-[#c81e2c]">{error}</p>
  if (!stats) {
    return <p className="text-white/40">Loading operational overview…</p>
  }

  const cards: [string, number | string][] = [
    ['Participants registered', stats.registered],
    ['Teams', stats.teams ?? 12],
    ['Active competitions', stats.active_competitions ?? '—'],
    ['Fixtures scheduled', stats.fixtures_scheduled ?? stats.fixtures],
    ['Awaiting results', stats.fixtures_awaiting_results ?? 0],
    ['Pending approval', stats.results_pending_approval ?? 0],
    ['Completed matches', stats.matches_completed ?? 0],
    ['Upcoming published', stats.upcoming_matches ?? 0],
    ['Qualification drafts', stats.pending_qualification ?? 0],
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">LIVE OVERVIEW</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em] text-[#f3ead7] sm:text-4xl">
          Command status
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Match wins drive sport progress only. Final placements award overall SPEED points.
          Registration {stats.registration_open ? 'is open' : 'is closed'}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent px-4 py-4"
          >
            <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">{label}</p>
            <p className="mt-2 font-display text-3xl tracking-[0.06em] text-[#e2b14a]">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-lg tracking-[0.1em] text-[#f3ead7]">Modules</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group border border-white/10 px-4 py-4 transition hover:border-[#e2b14a]/35"
            >
              <p className="font-display tracking-[0.08em] text-[#f3ead7] group-hover:text-[#e2b14a]">
                {m.label}
              </p>
              <p className="mt-1 text-xs text-white/40">{m.hint}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg tracking-[0.1em]">Recent activity</h3>
        <ul className="mt-4 divide-y divide-white/10 border border-white/10">
          {recent.length === 0 && (
            <li className="px-4 py-6 text-sm text-white/40">No audit entries yet.</li>
          )}
          {recent.map((r, i) => (
            <li key={`${r.created_at}-${i}`} className="px-4 py-3 text-sm">
              <p className="text-[#f3ead7]">{r.action.replace(/_/g, ' ')}</p>
              <p className="mt-0.5 text-xs text-white/40">
                {r.reason || r.entity_type} ·{' '}
                {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
