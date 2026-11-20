'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { scoreSchemaForSport } from '@/lib/tournament/score-schemas'

type FixtureRow = {
  fixture_id: string
  competition_name: string | null
  competition_slug: string | null
  sport_name: string
  sport_slug: string
  group_code: string | null
  stage: string | null
  team_a_name: string
  team_b_name: string
  team_a_id: string
  team_b_id: string
  starts_at: string | null
  venue: string | null
  /** Present when a result already exists */
  id?: string
  score_a?: number | null
  score_b?: number | null
  winner_team_id?: string | null
  is_draw?: boolean
  metrics?: Record<string, unknown>
  summary?: string | null
  winner_name?: string | null
  done?: boolean
}

export function MatchResultsDesk() {
  const [showDone, setShowDone] = useState(false)
  const [rows, setRows] = useState<FixtureRow[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<FixtureRow | null>(null)
  const [sportFilter, setSportFilter] = useState('all')

  const [winner, setWinner] = useState<'a' | 'b' | 'draw'>('a')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [metricsExtra, setMetricsExtra] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setMsg(null)
    if (!showDone) {
      const res = await fetch('/api/ops/match-results?awaiting=1')
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      setRows((data.awaiting || []).map((r: FixtureRow) => ({ ...r, done: false })))
    } else {
      const res = await fetch('/api/ops/match-results?status=approved')
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      setRows(
        (data.results || []).map(
          (r: FixtureRow & { id: string }) => ({ ...r, done: true }),
        ),
      )
    }
  }, [showDone])

  useEffect(() => {
    void load()
  }, [load])

  const sports = useMemo(
    () => Array.from(new Set(rows.map((x) => x.sport_name))).sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    if (sportFilter === 'all') return rows
    return rows.filter((x) => x.sport_name === sportFilter)
  }, [rows, sportFilter])

  function openEntry(row: FixtureRow) {
    setSelected(row)
    setWinner('a')
    setScoreA('')
    setScoreB('')
    setMetricsExtra({})
    if (row.done) {
      setScoreA(row.score_a != null ? String(row.score_a) : '')
      setScoreB(row.score_b != null ? String(row.score_b) : '')
      if (row.is_draw) setWinner('draw')
      else if (row.winner_team_id === row.team_a_id) setWinner('a')
      else if (row.winner_team_id === row.team_b_id) setWinner('b')
    }
  }

  function buildMetrics(sportSlug: string, competitionSlug?: string | null) {
    const schema = scoreSchemaForSport(sportSlug, competitionSlug || undefined)
    const base: Record<string, unknown> = { schema }
    if (schema === 'cricket') {
      base.team_a = {
        runs: metricsExtra.a_runs ? Number(metricsExtra.a_runs) : undefined,
        wickets: metricsExtra.a_wickets ? Number(metricsExtra.a_wickets) : undefined,
        overs: metricsExtra.a_overs || undefined,
      }
      base.team_b = {
        runs: metricsExtra.b_runs ? Number(metricsExtra.b_runs) : undefined,
        wickets: metricsExtra.b_wickets ? Number(metricsExtra.b_wickets) : undefined,
        overs: metricsExtra.b_overs || undefined,
      }
      if (metricsExtra.margin) base.margin = metricsExtra.margin
    }
    return base
  }

  async function saveResult() {
    if (!selected) return
    setBusy(true)
    setMsg(null)
    try {
      const metrics = buildMetrics(selected.sport_slug, selected.competition_slug)
      const payload = {
        winner: winner === 'draw' ? undefined : winner,
        is_draw: winner === 'draw',
        score_a: scoreA !== '' ? Number(scoreA) : null,
        score_b: scoreB !== '' ? Number(scoreB) : null,
        metrics,
      }

      let res: Response
      if (selected.done && selected.id) {
        res = await fetch('/api/ops/match-results', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selected.id, action: 'correct', ...payload }),
        })
      } else {
        res = await fetch('/api/ops/match-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fixture_id: selected.fixture_id,
            ...payload,
            status: 'approved',
          }),
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(data.summary || 'Result saved · group standings update from approved results')
      setSelected(null)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const schema =
    selected && scoreSchemaForSport(selected.sport_slug, selected.competition_slug || undefined)

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">MATCH RESULTS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Mark fixture results</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Pick a preloaded group or knockout fixture, mark the winner (and score). Saves as the
          official result and updates group standings automatically. Does not award overall SPEED
          points.
        </p>
      </div>

      {msg && <p className="text-sm text-[#e2b14a]">{msg}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShowDone(false)
            setSelected(null)
          }}
          className={`px-3 py-1.5 text-xs tracking-wide ${
            !showDone
              ? 'border border-[#e2b14a]/50 text-[#e2b14a]'
              : 'border border-white/10 text-white/45'
          }`}
        >
          To mark
        </button>
        <button
          type="button"
          onClick={() => {
            setShowDone(true)
            setSelected(null)
          }}
          className={`px-3 py-1.5 text-xs tracking-wide ${
            showDone
              ? 'border border-[#e2b14a]/50 text-[#e2b14a]'
              : 'border border-white/10 text-white/45'
          }`}
        >
          Completed
        </button>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="ml-auto border border-white/15 bg-black/40 px-3 py-1.5 text-xs"
        >
          <option value="all">All sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="space-y-2 lg:col-span-2">
          {filtered.length === 0 && (
            <li className="border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
              {showDone
                ? 'No completed results yet.'
                : 'All fixtures marked — or generate fixtures under Fixtures first.'}
            </li>
          )}
          {filtered.map((row) => {
            const active = selected?.fixture_id === row.fixture_id
            return (
              <li key={row.id || row.fixture_id}>
                <button
                  type="button"
                  onClick={() => openEntry(row)}
                  className={`w-full border px-3 py-3 text-left transition ${
                    active
                      ? 'border-[#e2b14a]/40 bg-white/[0.04]'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <p className="text-[10px] tracking-[0.2em] text-[#e2b14a]">
                    {(row.competition_name || row.sport_name).toUpperCase()}
                    {row.group_code ? ` · G${row.group_code}` : ''}
                    {row.stage && row.stage !== 'group_stage'
                      ? ` · ${row.stage.replace('_', ' ')}`
                      : ''}
                  </p>
                  <p className="mt-1 font-display text-base tracking-[0.04em]">
                    {row.team_a_name} <span className="text-white/30">vs</span> {row.team_b_name}
                  </p>
                  {row.done && row.summary && (
                    <p className="mt-1 text-xs text-white/40">{row.summary}</p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="border border-white/10 bg-white/[0.02] p-5 lg:col-span-3">
          {!selected ? (
            <p className="text-sm text-white/40">Select a fixture to mark the result.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-display text-xs tracking-[0.25em] text-[#e2b14a]">
                  {selected.sport_name.toUpperCase()}
                </p>
                <p className="mt-2 font-display text-2xl tracking-[0.04em]">
                  {selected.team_a_name}{' '}
                  <span className="text-white/30">VS</span> {selected.team_b_name}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setWinner('a')}
                  className={`border px-3 py-2 text-sm ${
                    winner === 'a' ? 'border-[#e2b14a] text-[#e2b14a]' : 'border-white/15'
                  }`}
                >
                  {selected.team_a_name} won
                </button>
                <button
                  type="button"
                  onClick={() => setWinner('b')}
                  className={`border px-3 py-2 text-sm ${
                    winner === 'b' ? 'border-[#e2b14a] text-[#e2b14a]' : 'border-white/15'
                  }`}
                >
                  {selected.team_b_name} won
                </button>
                <button
                  type="button"
                  onClick={() => setWinner('draw')}
                  className={`border px-3 py-2 text-sm ${
                    winner === 'draw' ? 'border-[#e2b14a] text-[#e2b14a]' : 'border-white/15'
                  }`}
                >
                  Draw
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-white/45">
                  {selected.team_a_name} score
                  <input
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
                    inputMode="decimal"
                  />
                </label>
                <label className="text-xs text-white/45">
                  {selected.team_b_name} score
                  <input
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
                    inputMode="decimal"
                  />
                </label>
              </div>

              {schema === 'cricket' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['a_runs', 'A runs'],
                      ['a_wickets', 'A wickets'],
                      ['a_overs', 'A overs'],
                      ['b_runs', 'B runs'],
                      ['b_wickets', 'B wickets'],
                      ['b_overs', 'B overs'],
                      ['margin', 'Margin'],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="text-xs text-white/45">
                      {label}
                      <input
                        value={metricsExtra[k] || ''}
                        onChange={(e) =>
                          setMetricsExtra((m) => ({ ...m, [k]: e.target.value }))
                        }
                        className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => void saveResult()}
                className="speed-cta disabled:opacity-40"
              >
                {busy
                  ? 'Saving…'
                  : selected.done
                    ? 'Update result'
                    : 'Save result'}
              </button>

              {selected.done && (
                <a
                  href={`/matches/${selected.fixture_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs text-[#e2b14a] hover:underline"
                >
                  View public match page →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
