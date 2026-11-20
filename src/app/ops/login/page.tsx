'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OpsLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/ops/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      // Same tab becomes Command Centre — public site already stayed in its own tab
      router.replace('/ops/operator-desk')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-5 py-16">
      <p className="font-display text-[10px] tracking-[0.4em] text-[#e2b14a]">SPORTSCOM</p>
      <h2 className="mt-2 font-display text-3xl tracking-[0.08em] text-[#f3ead7]">
        Command Centre
      </h2>
      <p className="mt-2 text-sm text-white/45">SPEED 2026–27 · SportsCom operators only</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="font-display text-xs tracking-[0.2em] text-white/40">PASSWORD</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-[#e2b14a]"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-[#c81e2c]">{error}</p>}
        <button type="submit" disabled={busy} className="speed-cta disabled:opacity-40">
          {busy ? 'Signing in…' : 'Enter Command Centre'}
        </button>
      </form>
    </div>
  )
}
