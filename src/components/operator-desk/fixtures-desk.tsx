'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Comp = {
  id: string
  slug: string
  name: string
  format_status: string
  group_fixtures: number
  approved_matches: number
  points_win: number | null
  points_draw: number | null
  points_loss: number | null
  points_provisional: boolean
}

type Fixture = {
  id: string
  venue: string | null
  starts_at: string | null
  status: string
  published: boolean
  sport_name: string
  competition_name: string | null
  competition_slug: string | null
  group_code: string | null
  stage: string | null
  team_a_name: string | null
  team_b_name: string | null
  has_result: boolean
}

type GroupView = {
  code: string
  teams: { team: { name: string; code: string } | null }[]
}

function toIsoFromLocalParts(date: string, time: string): string | null {
  if (!date) return null
  const t = time && time.length >= 4 ? time : '00:00'
  const hhmm = t.length === 5 ? t : t.slice(0, 5)
  return `${date}T${hhmm}:00+05:30`
}

function partsFromIso(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const tf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return { date: fmt.format(d), time: tf.format(d) }
}

export function FixturesDesk() {
  const [competitions, setCompetitions] = useState<Comp[]>([])
  const [counts, setCounts] = useState<{ group_fx: number; sf: number; finals: number } | null>(
    null,
  )
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [slug, setSlug] = useState('all')
  const [groups, setGroups] = useState<GroupView[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [published, setPublished] = useState(true)

  const loadCore = useCallback(async () => {
    const [tRes, fRes] = await Promise.all([
      fetch('/api/ops/tournament'),
      fetch('/api/ops/fixtures'),
    ])
    if (tRes.status === 401 || fRes.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const tData = await tRes.json()
    const fData = await fRes.json()
    setCompetitions(tData.competitions || [])
    setCounts(tData.counts || null)
    setFixtures(fData.fixtures || [])
  }, [])

  useEffect(() => {
    void loadCore()
  }, [loadCore])

  useEffect(() => {
    if (slug === 'all') {
      setGroups([])
      return
    }
    void (async () => {
      const res = await fetch(`/api/public/tournament?competition=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (!res.ok) return
      setGroups(
        (data.groups || []).map((g: { code: string; teams: GroupView['teams'] }) => ({
          code: g.code,
          teams: g.teams || [],
        })),
      )
    })()
  }, [slug])

  const filtered = useMemo(() => {
    if (slug === 'all') return fixtures
    return fixtures.filter((f) => f.competition_slug === slug)
  }, [fixtures, slug])

  async function regenerate() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/tournament', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(
        data.report?.validationErrors?.length
          ? `Validation: ${data.report.validationErrors.join('; ')}`
          : `Fixtures ready · group +${data.report.groupFixtures} · KO +${data.report.knockoutShells} · skipped ${data.report.skippedExisting}`,
      )
      await loadCore()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function publishCompetition(compSlug: string) {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/fixtures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish_competition: compSlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(`Published ${data.published} group fixtures for ${compSlug}`)
      await loadCore()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(f: Fixture) {
    setEditId(f.id)
    setVenue(f.venue || '')
    const parts = partsFromIso(f.starts_at)
    setDate(parts.date)
    setTime(parts.time)
    setPublished(f.published)
  }

  async function saveSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setBusy(true)
    setMsg(null)
    try {
      const startsAt = date ? toIsoFromLocalParts(date, time) : null
      const res = await fetch('/api/ops/fixtures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          venue: venue.trim() || null,
          starts_at: startsAt,
          published,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg('Fixture updated')
      setEditId(null)
      await loadCore()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">FIXTURES</p>
          <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Schedule & groups</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Groups, generate round-robin fixtures, assign IST date/time and venue, then publish.
            Match scores live under Match Results.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void regenerate()}
          className="border border-[#e2b14a]/40 px-4 py-2 text-sm text-[#e2b14a] disabled:opacity-40"
        >
          {busy ? 'Working…' : 'Generate fixtures'}
        </button>
      </div>

      {counts && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Group fixtures', counts.group_fx],
            ['Semi-finals', counts.sf],
            ['Finals', counts.finals],
          ].map(([label, n]) => (
            <div key={String(label)} className="border border-white/10 px-4 py-3">
              <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">{label}</p>
              <p className="mt-1 font-display text-3xl text-[#e2b14a]">{n}</p>
            </div>
          ))}
        </div>
      )}

      {msg && <p className="text-sm text-[#e2b14a]">{msg}</p>}

      <label className="block text-xs text-white/45">
        Competition
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full max-w-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
        >
          <option value="all">All competitions</option>
          {competitions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
              {c.format_status === 'pending' ? ' (TBA)' : ''}
            </option>
          ))}
        </select>
      </label>

      {slug !== 'all' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-lg tracking-[0.08em]">Official groups</h3>
            {competitions.find((c) => c.slug === slug)?.format_status === 'active' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void publishCompetition(slug)}
                className="border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:border-[#e2b14a] hover:text-[#e2b14a] disabled:opacity-40"
              >
                Publish group fixtures
              </button>
            )}
          </div>
          {groups.length === 0 ? (
            <p className="text-sm text-white/40">No groups for this competition yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groups.map((g) => (
                <div key={g.code} className="border border-white/10">
                  <p className="border-b border-white/10 px-3 py-2 font-display text-xs tracking-[0.2em] text-[#e2b14a]">
                    GROUP {g.code}
                  </p>
                  <ul className="px-3 py-2 text-sm">
                    {g.teams.map((row, i) => (
                      <li key={row.team?.code || i} className="py-1 text-white/80">
                        {row.team?.name || '—'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editId && (
        <form onSubmit={saveSchedule} className="grid gap-3 border border-[#e2b14a]/30 p-5 sm:grid-cols-2">
          <h3 className="font-display text-lg tracking-[0.08em] sm:col-span-2">
            Schedule fixture
          </h3>
          <label className="text-xs text-white/45">
            Venue
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-white/45">
            Date (IST)
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm [color-scheme:dark]"
            />
          </label>
          <label className="text-xs text-white/45">
            Time (IST)
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm [color-scheme:dark]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published on public site
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="speed-cta disabled:opacity-40">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="border border-white/15 px-4 py-2 text-sm text-white/50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 className="font-display text-lg tracking-[0.08em]">
          Fixtures ({filtered.length})
        </h3>
        <ul className="mt-3 max-h-[32rem] space-y-2 overflow-y-auto">
          {filtered.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-white/10 px-4 py-3"
            >
              <div>
                <p className="text-[10px] tracking-[0.18em] text-[#e2b14a]">
                  {(f.competition_name || f.sport_name).toUpperCase()}
                  {f.group_code ? ` · G${f.group_code}` : ''}
                  {f.stage && f.stage !== 'group_stage'
                    ? ` · ${f.stage.replace('_', ' ')}`
                    : ''}
                </p>
                <p className="mt-1 font-display text-lg tracking-[0.04em]">
                  {f.team_a_name || 'TBD'} <span className="text-white/30">vs</span>{' '}
                  {f.team_b_name || 'TBD'}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {f.venue || 'Venue TBA'}
                  {f.starts_at
                    ? ` · ${new Date(f.starts_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                      })}`
                    : ' · Time TBA'}
                  {' · '}
                  {f.published ? 'Published' : 'Unpublished'}
                  {f.has_result ? ' · Result in' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(f)}
                className="border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-[#e2b14a] hover:text-[#e2b14a]"
              >
                Schedule
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
              No fixtures in this filter. Generate fixtures first.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
