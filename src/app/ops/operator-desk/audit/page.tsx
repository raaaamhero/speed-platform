'use client'

import { useEffect, useState } from 'react'

type Row = {
  action: string
  entity_type: string
  created_at: string
  reason: string | null
}

export default function DeskAuditPage() {
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
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">AUDIT LOGS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Operator activity</h2>
      </div>
      <ul className="divide-y divide-white/10 border border-white/10">
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
  )
}
