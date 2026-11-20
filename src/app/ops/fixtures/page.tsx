'use client'

import { useEffect, useMemo, useState } from 'react'
import { SPORTS } from '@/lib/rules/sports'
import { TEAMS } from '@/lib/rules/teams'

type Fixture = {
  id: string
  title: string | null
  venue: string | null
  starts_at: string | null
  status: string
  published: boolean
  sport_name: string
  team_a_name: string | null
  team_b_name: string | null
}

/** Build ISO timestamptz from date + time in Asia/Kolkata (+05:30). */
function toIsoFromLocalParts(date: string, time: string): string | null {
  if (!date) return null
  const t = time && time.length >= 4 ? time : '00:00'
  const hhmm = t.length === 5 ? t : t.slice(0, 5)
  // Explicit offset so Postgres stores the intended India wall-clock time
  return `${date}T${hhmm}:00+05:30`
}

export default function OpsFixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [sport, setSport] = useState('cricket')
  const [teamA, setTeamA] = useState(1)
  const [teamB, setTeamB] = useState(2)
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [published, setPublished] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  const teamAName = useMemo(() => TEAMS.find((t) => t.number === teamA)?.name || 'TBD', [teamA])
  const teamBName = useMemo(() => TEAMS.find((t) => t.number === teamB)?.name || 'TBD', [teamB])
  const sportName = useMemo(() => SPORTS.find((s) => s.slug === sport)?.name || sport, [sport])

  async function load() {
    const res = await fetch('/api/ops/fixtures')
    if (res.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const data = await res.json()
    setFixtures(data.fixtures || [])
  }

  useEffect(() => {
    void load()
  }, [])

  async function createFixture(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (teamA === teamB) {
      setMsg('Pick two different teams')
      return
    }

    const startsAt = toIsoFromLocalParts(date, time)
    if (date && !startsAt) {
      setMsg('Invalid date/time')
      return
    }

    const res = await fetch('/api/ops/fixtures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport_slug: sport,
        team_a_number: teamA,
        team_b_number: teamB,
        venue: venue.trim() || null,
        starts_at: startsAt,
        published,
        title: `${sportName}: ${teamAName} vs ${teamBName}`,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Failed')
      return
    }
    setMsg(
      startsAt
        ? `Fixture created · ${new Date(startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
        : 'Fixture created (time TBA)',
    )
    setDate('')
    setTime('')
    await load()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl tracking-[0.08em]">Fixtures</h2>
        <p className="mt-2 text-sm text-[var(--speed-muted)]">
          Create matches, set India time (IST), then publish for the public site.
        </p>
      </div>

      <form onSubmit={createFixture} className="grid gap-3 border border-white/10 p-5 sm:grid-cols-2">
        <label className="text-sm">
          Sport
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          >
            {SPORTS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Venue
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Endpoint / MIT Sports Park"
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          Team A
          <select
            value={teamA}
            onChange={(e) => setTeamA(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          >
            {TEAMS.filter((t) => t.code !== 'T11').map((t) => (
              <option key={t.number} value={t.number}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Team B
          <select
            value={teamB}
            onChange={(e) => setTeamB(Number(e.target.value))}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5"
          >
            {TEAMS.filter((t) => t.code !== 'T11').map((t) => (
              <option key={t.number} value={t.number}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5 [color-scheme:dark]"
          />
        </label>
        <label className="text-sm">
          Time (IST)
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2.5 [color-scheme:dark]"
          />
        </label>
        {date && (
          <p className="text-xs text-[var(--speed-muted)] sm:col-span-2">
            Scheduled:{' '}
            {new Date(toIsoFromLocalParts(date, time) || '').toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </p>
        )}
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish to public site
        </label>
        <button type="submit" className="speed-cta sm:col-span-2">
          Create fixture
        </button>
      </form>

      {msg && <p className="text-sm text-[var(--speed-gold)]">{msg}</p>}

      <ul className="space-y-2">
        {fixtures.map((f) => (
          <li key={f.id} className="border border-white/10 px-4 py-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-display text-lg tracking-[0.06em]">
                {f.sport_name}: {f.team_a_name || 'TBD'} vs {f.team_b_name || 'TBD'}
              </span>
              <span className="text-[var(--speed-muted)]">
                {f.published ? 'Published' : 'Draft'} · {f.status}
              </span>
            </div>
            <p className="mt-1 text-[var(--speed-muted)]">
              {f.venue || 'Venue TBA'}
              {f.starts_at
                ? ` · ${new Date(f.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
                : ' · Time TBA'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
