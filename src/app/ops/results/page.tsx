'use client'

import { useState } from 'react'
import { SPORTS } from '@/lib/rules/sports'
import { TEAMS } from '@/lib/rules/teams'

export default function OpsResultsPage() {
  const [sport, setSport] = useState('cricket')
  const [team, setTeam] = useState(1)
  const [place, setPlace] = useState(1)
  const [category, setCategory] = useState('team_sport')
  const [jackpotTeam, setJackpotTeam] = useState(1)
  const [jackpotSport, setJackpotSport] = useState('cricket')
  const [msg, setMsg] = useState<string | null>(null)

  async function submitResult(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const res = await fetch('/api/ops/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport_slug: sport,
        team_number: team,
        place,
        event_category: category,
        approve: true,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Failed')
      return
    }
    setMsg(`Result approved for Team ${team} — place ${place}`)
  }

  async function placeJackpot(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const res = await fetch('/api/ops/jackpot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_number: jackpotTeam, sport_slug: jackpotSport }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Failed')
      return
    }
    setMsg(`Jackpot placed for Team ${jackpotTeam} on ${jackpotSport}`)
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-3xl tracking-[0.08em]">Results & jackpot</h2>
        <p className="mt-2 text-sm text-[var(--speed-muted)]">
          Approving a result writes the points ledger (with jackpot math if active).
        </p>
      </div>

      {msg && <p className="text-sm text-[var(--speed-gold)]">{msg}</p>}

      <form onSubmit={submitResult} className="grid gap-3 border border-white/10 p-5 sm:grid-cols-2">
        <h3 className="font-display text-xl tracking-[0.08em] sm:col-span-2">Enter result</h3>
        <label className="text-sm">
          Sport
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            {SPORTS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Team
          <select
            value={team}
            onChange={(e) => setTeam(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            {TEAMS.map((t) => (
              <option key={t.number} value={t.number}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Place
          <select
            value={place}
            onChange={(e) => setPlace(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            {[1, 2, 3, 4].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            <option value="team_sport">Team sport</option>
            <option value="athletics_swimming_single">Athletics/Swim single</option>
            <option value="athletics_swimming_relay">Athletics/Swim relay</option>
          </select>
        </label>
        <button type="submit" className="speed-cta sm:col-span-2">
          Approve & award points
        </button>
      </form>

      <form onSubmit={placeJackpot} className="grid gap-3 border border-white/10 p-5 sm:grid-cols-2">
        <h3 className="font-display text-xl tracking-[0.08em] sm:col-span-2">Place jackpot</h3>
        <label className="text-sm">
          Team
          <select
            value={jackpotTeam}
            onChange={(e) => setJackpotTeam(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            {TEAMS.map((t) => (
              <option key={t.number} value={t.number}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sport
          <select
            value={jackpotSport}
            onChange={(e) => setJackpotSport(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
          >
            {SPORTS.filter((s) => s.countsTowardCap).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="speed-cta sm:col-span-2">
          Confirm jackpot
        </button>
      </form>
    </div>
  )
}
