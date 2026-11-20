'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { scoreSchemaForSport } from '@/lib/tournament/score-schemas'

type Awaiting = {
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
}

type MatchResult = Awaiting & {
  id: string
  fixture_id: string
  score_a: number | null
  score_b: number | null
  winner_team_id: string | null
  is_draw: boolean
  metrics: Record<string, unknown>
  approval_status: string
  summary: string | null
  entered_at: string
  approved_at: string | null
  entered_by_label: string | null
  approved_by_label: string | null
  winner_name: string | null
  notes: string | null
}

type Tab = 'awaiting' | 'draft' | 'pending' | 'approved' | 'rejected'

function isStoredResult(row: Awaiting | MatchResult): row is MatchResult {
  return 'approval_status' in row && 'id' in row
}

export function MatchResultsDesk() {
  const [tab, setTab] = useState<Tab>('awaiting')
  const [awaiting, setAwaiting] = useState<Awaiting[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<Awaiting | MatchResult | null>(null)
  const [sportFilter, setSportFilter] = useState('all')

  const [winner, setWinner] = useState<'a' | 'b' | 'draw'>('a')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [metricsExtra, setMetricsExtra] = useState<Record<string, string>>({})
  const [entryMode, setEntryMode] = useState<'draft' | 'pending' | 'approved'>('approved')

  const load = useCallback(async () => {
    setMsg(null)
    if (tab === 'awaiting') {
      const res = await fetch('/api/ops/match-results?awaiting=1')
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      setAwaiting(data.awaiting || [])
      setResults([])
    } else {
      const res = await fetch(`/api/ops/match-results?status=${tab}`)
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      setResults(data.results || [])
      setAwaiting([])
    }
  }, [tab])

  useEffect(() => {
    void load()
  }, [load])

  const sports = useMemo(() => {
    const list = tab === 'awaiting' ? awaiting : results
    return Array.from(new Set(list.map((x) => x.sport_name))).sort()
  }, [awaiting, results, tab])

  const filtered = useMemo(() => {
    const list = tab === 'awaiting' ? awaiting : results
    if (sportFilter === 'all') return list
    return list.filter((x) => x.sport_name === sportFilter)
  }, [awaiting, results, tab, sportFilter])

  function openEntry(row: Awaiting | MatchResult) {
    setSelected(row)
    setWinner('a')
    setScoreA('')
    setScoreB('')
    setMetricsExtra({})
    if (isStoredResult(row)) {
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
      const body = {
        fixture_id: selected.fixture_id,
        winner: winner === 'draw' ? undefined : winner,
        is_draw: winner === 'draw',
        score_a: scoreA !== '' ? Number(scoreA) : null,
        score_b: scoreB !== '' ? Number(scoreB) : null,
        metrics: buildMetrics(selected.sport_slug, selected.competition_slug),
        status: entryMode,
      }
      const res = await fetch('/api/ops/match-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg(data.summary || 'Saved')
      setSelected(null)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function approve(id: string) {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/ops/match-results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg('Result approved — now public')
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function reject(id: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/ops/match-results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg('Rejected')
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
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Score entry & approval</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Sport progress only — never awards overall SPEED points. Unapproved results stay private.
        </p>
      </div>

      {msg && <p className="text-sm text-[#e2b14a]">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['awaiting', 'Awaiting entry'],
            ['draft', 'Drafts'],
            ['pending', 'Pending approval'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k)
              setSelected(null)
            }}
            className={`px-3 py-1.5 text-xs tracking-wide ${
              tab === k
                ? 'border border-[#e2b14a]/50 text-[#e2b14a]'
                : 'border border-white/10 text-white/45'
            }`}
          >
            {label}
          </button>
        ))}
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
              Nothing in this queue.
            </li>
          )}
          {filtered.map((row) => {
            const stored = isStoredResult(row)
            const key = stored ? row.id : row.fixture_id
            const active =
              selected &&
              (selected.fixture_id === row.fixture_id ||
                (stored && isStoredResult(selected) && selected.id === row.id))
            return (
              <li key={key}>
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
                  {stored && (
                    <p className="mt-1 text-xs text-white/40">
                      {row.approval_status}
                      {row.summary ? ` · ${row.summary}` : ''}
                    </p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="border border-white/10 bg-white/[0.02] p-5 lg:col-span-3">
          {!selected ? (
            <p className="text-sm text-white/40">Select a match to enter or review the result.</p>
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

              {isStoredResult(selected) && selected.approval_status === 'approved' ? (
                <div className="space-y-3 text-sm">
                  <p className="text-[#e2b14a]">{selected.summary}</p>
                  <p className="text-white/45">
                    Official · entered {selected.entered_by_label || 'ops'}
                    {selected.approved_at
                      ? ` · approved ${new Date(selected.approved_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}`
                      : ''}
                  </p>
                  <p className="text-xs text-white/35">
                    Corrections recalculate standings and invalidate qualification — use PATCH
                    action=correct via ops API when needed.
                  </p>
                  <a
                    href={`/matches/${selected.fixture_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-[#e2b14a] hover:underline"
                  >
                    View public match page →
                  </a>
                </div>
              ) : (
                <>
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

                  <label className="block text-xs text-white/45">
                    Save as
                    <select
                      value={entryMode}
                      onChange={(e) =>
                        setEntryMode(e.target.value as 'draft' | 'pending' | 'approved')
                      }
                      className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
                    >
                      <option value="draft">Draft (private)</option>
                      <option value="pending">Submit for approval</option>
                      <option value="approved">Approve immediately</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveResult()}
                    className="speed-cta disabled:opacity-40"
                  >
                    {busy ? 'Saving…' : 'Save match result'}
                  </button>
                </>
              )}

              {isStoredResult(selected) &&
                (selected.approval_status === 'draft' ||
                  selected.approval_status === 'pending') && (
                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void approve(selected.id)}
                      className="border border-[#e2b14a]/40 px-4 py-2 text-sm text-[#e2b14a]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void reject(selected.id)}
                      className="border border-[#c81e2c]/40 px-4 py-2 text-sm text-[#c81e2c]/90"
                    >
                      Reject
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
