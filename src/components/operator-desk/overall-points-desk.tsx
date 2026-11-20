'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Competition = { id: string; slug: string; name: string; format_status: string }
type Team = { id: string; name: string; code: string; number: number }
type Placement = {
  place: number
  team_id: string
  team_name: string
  competition_slug: string
  competition_name: string
}

export function OverallPointsDesk() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [slug, setSlug] = useState('')
  const [places, setPlaces] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '' })
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const [tRes, pRes] = await Promise.all([
      fetch('/api/ops/tournament'),
      fetch('/api/ops/placements'),
    ])
    if (tRes.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const tData = await tRes.json()
    const comps = ((tData.competitions || []) as Competition[]).filter(
      (c) => c.format_status === 'active',
    )
    setCompetitions(comps)
    setTeams(tData.teams || [])
    if (!slug && comps[0]) setSlug(comps[0].slug)
    const pData = await pRes.json()
    setPlacements(pData.placements || [])
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function award(e: React.FormEvent) {
    e.preventDefault()
    if (!slug) return
    setBusy(true)
    setMsg(null)
    try {
      const payload = [1, 2, 3, 4]
        .filter((n) => places[n])
        .map((n) => ({ place: n, team_id: places[n] }))

      const res = await fetch('/api/ops/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competition_slug: slug, places: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      const skipped = (data.skipped || [])
        .map((s: { place: number; reason: string }) => `${s.place}: ${s.reason}`)
        .join('; ')
      setMsg(
        `Awarded ${data.awarded?.length || 0} placement(s).${skipped ? ` Skipped — ${skipped}` : ''}`,
      )
      setPlaces({ 1: '', 2: '', 3: '', 4: '' })
      await refresh()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const labels: Record<number, string> = {
    1: '1st · 1,000 pts',
    2: '2nd · 750 pts',
    3: '3rd · 500 pts',
    4: '4th · 250 pts',
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">OVERALL SPEED</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Final placement awards</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Award 1st–4th only when a sport competition finishes. Uses existing approve-result + ledger.
          Match wins never touch overall points. Duplicate place awards per competition are blocked.
        </p>
        <Link href="/standings" className="mt-3 inline-block text-xs text-[#e2b14a] hover:underline">
          View public overall standings →
        </Link>
      </div>

      {msg && <p className="text-sm text-[#e2b14a]">{msg}</p>}

      <form onSubmit={award} className="space-y-4 border border-white/10 p-5">
        <label className="block text-xs text-white/45">
          Competition
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
          >
            {competitions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {[1, 2, 3, 4].map((place) => (
          <label key={place} className="block text-xs text-white/45">
            {labels[place]}
            <select
              value={places[place]}
              onChange={(e) => setPlaces((p) => ({ ...p, [place]: e.target.value }))}
              className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
            >
              <option value="">— skip —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button type="submit" disabled={busy || !slug} className="speed-cta disabled:opacity-40">
          {busy ? 'Awarding…' : 'Confirm placement awards'}
        </button>
      </form>

      <div>
        <h3 className="font-display text-lg tracking-[0.08em]">Awarded placements</h3>
        <ul className="mt-3 divide-y divide-white/10 border border-white/10">
          {placements.length === 0 && (
            <li className="px-4 py-6 text-sm text-white/40">No competition placements yet.</li>
          )}
          {placements.map((p) => (
            <li key={`${p.competition_slug}-${p.place}`} className="px-4 py-3 text-sm">
              <span className="text-[#e2b14a]">{p.competition_name}</span>
              {' · '}
              {p.place}
              {p.place === 1 ? 'st' : p.place === 2 ? 'nd' : p.place === 3 ? 'rd' : 'th'} ·{' '}
              {p.team_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
