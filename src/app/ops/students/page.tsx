'use client'

import { useEffect, useState } from 'react'
import { SPORTS } from '@/lib/rules/sports'

type Student = {
  roll_number: string
  full_name: string
  team_code: string
  section_code: string
  registration_status: string | null
  player_code: string | null
  sport_slugs: string[]
  counted_sports: number
}

export default function OpsStudentsPage() {
  const [q, setQ] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Student | null>(null)
  const [editSports, setEditSports] = useState<string[]>([])
  const [reason, setReason] = useState('SportsCom correction')
  const [msg, setMsg] = useState<string | null>(null)

  async function load(query = q) {
    const res = await fetch(`/api/ops/students?q=${encodeURIComponent(query)}`)
    if (res.status === 401) {
      window.location.href = '/ops/login'
      return
    }
    const data = await res.json()
    setStudents(data.students || [])
  }

  useEffect(() => {
    void load('')
  }, [])

  function openEdit(s: Student) {
    setSelected(s)
    setEditSports(s.sport_slugs || [])
    setMsg(null)
  }

  async function saveEdit() {
    if (!selected) return
    const res = await fetch('/api/ops/registration', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roll_number: selected.roll_number,
        sports: editSports,
        reason,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Failed')
      return
    }
    setMsg(`Updated ${data.player_code}`)
    setSelected(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-[0.08em]">Students & matrix</h2>
          <p className="mt-2 text-sm text-[var(--speed-muted)]">
            Search, review caps, and edit registrations with an audit reason.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void load()
          }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Roll, name, Player ID"
            className="border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--speed-gold)]"
          />
          <button type="submit" className="speed-ghost text-sm">
            Search
          </button>
        </form>
      </div>

      {msg && <p className="text-sm text-[var(--speed-gold)]">{msg}</p>}

      <div className="overflow-auto border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 font-display text-xs tracking-[0.15em] text-[var(--speed-muted)]">
            <tr>
              <th className="px-3 py-3 font-normal">Student</th>
              <th className="px-3 py-3 font-normal">Team</th>
              <th className="px-3 py-3 font-normal">Player ID</th>
              <th className="px-3 py-3 font-normal">Cap</th>
              <th className="px-3 py-3 font-normal">Sports</th>
              <th className="px-3 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.roll_number} className="border-b border-white/5">
                <td className="px-3 py-3">
                  <div className="text-[var(--speed-ink)]">{s.full_name}</div>
                  <div className="text-xs text-[var(--speed-muted)]">
                    {s.roll_number} · {s.section_code}
                  </div>
                </td>
                <td className="px-3 py-3">{s.team_code}</td>
                <td className="px-3 py-3 font-mono text-xs">{s.player_code || '—'}</td>
                <td className="px-3 py-3">{s.counted_sports}/3</td>
                <td className="px-3 py-3 text-xs text-[var(--speed-muted)]">
                  {(s.sport_slugs || []).join(', ') || '—'}
                </td>
                <td className="px-3 py-3">
                  <button type="button" className="text-[var(--speed-gold)]" onClick={() => openEdit(s)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto border border-white/15 bg-[#0b0d10] p-6">
            <h3 className="font-display text-2xl tracking-[0.08em]">Edit {selected.full_name}</h3>
            <p className="mt-1 text-sm text-[var(--speed-muted)]">{selected.roll_number}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SPORTS.map((sport) => {
                const on = editSports.includes(sport.slug)
                return (
                  <button
                    key={sport.slug}
                    type="button"
                    onClick={() =>
                      setEditSports((prev) =>
                        on ? prev.filter((x) => x !== sport.slug) : [...prev, sport.slug],
                      )
                    }
                    className={`border px-3 py-2 text-left text-sm ${
                      on ? 'border-[var(--speed-gold)]' : 'border-white/10'
                    }`}
                  >
                    {sport.name}
                  </button>
                )
              })}
            </div>
            <label className="mt-4 block text-sm">
              Reason
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2"
              />
            </label>
            <div className="mt-5 flex gap-3">
              <button type="button" className="speed-ghost text-sm" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button type="button" className="speed-cta text-sm" onClick={() => void saveEdit()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
