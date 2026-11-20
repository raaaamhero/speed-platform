'use client'

import { useEffect, useState } from 'react'

type Row = {
  action: string
  entity_type: string
  created_at: string
  reason: string | null
}

export default function DeskSettingsPage() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/ops/dashboard')
      if (res.status === 401) {
        window.location.href = '/ops/login'
        return
      }
      const data = await res.json()
      setRows(data.recent || [])
    })()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">SETTINGS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Configuration & audit</h2>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Official overall SPEED place values (1000/750/500/250) stay in scoring RPCs. Group points
          remain provisional 3/1/0. Match results never write to the overall points ledger.
        </p>
      </div>

      <ul className="space-y-2 text-sm text-white/50">
        <li>· Shared ops password (roles can be added later)</li>
        <li>· Fixtures module owns generate / schedule / publish</li>
        <li>· Standings & Knockouts are calculated views — not manual point edits</li>
        <li>· Legacy /ops/tournament APIs remain for compatibility</li>
      </ul>

      <div>
        <h3 className="font-display text-lg tracking-[0.08em]">Recent audit</h3>
        <ul className="mt-3 divide-y divide-white/10 border border-white/10">
          {rows.length === 0 && (
            <li className="px-4 py-8 text-sm text-white/40">No recent entries.</li>
          )}
          {rows.map((r, i) => (
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
