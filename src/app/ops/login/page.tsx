'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OpsLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [popupBlocked, setPopupBlocked] = useState(false)

  function openDesk(preferNewTab: boolean) {
    const url = '/ops/operator-desk'
    if (preferNewTab) {
      const w = window.open(url, '_blank', 'noopener,noreferrer')
      if (!w) {
        setPopupBlocked(true)
        return false
      }
      return true
    }
    router.push(url)
    router.refresh()
    return true
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setPopupBlocked(false)
    try {
      const res = await fetch('/api/ops/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      const opened = openDesk(true)
      if (!opened) {
        // Session is live — show fallback CTA; also navigate this tab as backup path
      } else {
        // Keep login tab usable; optional soft navigate
        router.refresh()
      }
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
        Operator login
      </h2>
      <p className="mt-2 text-sm text-white/45">
        Authenticated access to OPERATOR DESK · SPEED 2026–27
      </p>
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
          {busy ? 'Signing in…' : 'Enter Operator Desk'}
        </button>
      </form>

      {popupBlocked && (
        <div className="mt-8 border border-[#e2b14a]/35 bg-[#e2b14a]/5 p-4">
          <p className="text-sm text-[#f3ead7]">
            Browser blocked the new tab. Your session is active — open the desk manually:
          </p>
          <button
            type="button"
            onClick={() => openDesk(false)}
            className="mt-3 border border-[#e2b14a]/50 px-4 py-2 text-sm text-[#e2b14a]"
          >
            Open Operator Desk
          </button>
        </div>
      )}

      {!popupBlocked && (
        <p className="mt-6 text-xs text-white/35">
          Already signed in?{' '}
          <button
            type="button"
            className="text-[#e2b14a] hover:underline"
            onClick={() => openDesk(true)}
          >
            Open Operator Desk
          </button>
        </p>
      )}
    </div>
  )
}
