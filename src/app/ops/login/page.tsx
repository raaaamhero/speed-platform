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
      router.push('/ops')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-display text-3xl tracking-[0.08em]">Operator login</h2>
      <p className="mt-2 text-sm text-[var(--speed-muted)]">SportsCom access only.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="font-display text-xs tracking-[0.2em] text-[var(--speed-muted)]">PASSWORD</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-[var(--speed-gold)]"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-[var(--speed-crimson)]">{error}</p>}
        <button type="submit" disabled={busy} className="speed-cta disabled:opacity-40">
          {busy ? 'Signing in…' : 'Enter Command Centre'}
        </button>
      </form>
    </div>
  )
}
