'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DESK_PATH = '/ops/operator-desk'
const DESK_WINDOW = 'speed_operator_desk'

function isChromeBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // Real Google Chrome (not Edge / Opera / Chromium-branded others)
  return /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/Brave\//.test(ua)
}

function deskAbsoluteUrl() {
  return `${window.location.origin}${DESK_PATH}`
}

/** Chrome: dedicated window. Must open during the user gesture (before await). */
function openDeskWindowChrome(): Window | null {
  const w = window.screen?.availWidth || 1440
  const h = window.screen?.availHeight || 900
  const width = Math.min(1440, Math.max(1100, w - 40))
  const height = Math.min(960, Math.max(720, h - 60))
  const left = Math.max(0, Math.round((w - width) / 2))
  const top = Math.max(0, Math.round((h - height) / 2))
  const features = [
    'popup=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=yes',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
  ].join(',')

  const win = window.open('about:blank', DESK_WINDOW, features)
  if (win) {
    try {
      win.document.title = 'Operator Desk · SportsCom'
      win.document.body.innerHTML =
        '<p style="font-family:system-ui;color:#9a958c;padding:2rem">Signing in…</p>'
    } catch {
      /* cross-origin blank may block write briefly — fine */
    }
  }
  return win
}

export default function OpsLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  function openDeskSameTab() {
    router.push(DESK_PATH)
    router.refresh()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setPopupBlocked(false)

    const chrome = isChromeBrowser()
    // Open during the click gesture so Chrome does not block the popup
    const deskWin = chrome ? openDeskWindowChrome() : null

    try {
      const res = await fetch('/api/ops/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      setSignedIn(true)
      const url = deskAbsoluteUrl()

      if (chrome) {
        if (deskWin && !deskWin.closed) {
          deskWin.location.replace(url)
          deskWin.focus()
        } else {
          setPopupBlocked(true)
        }
        // Keep this tab on login — desk lives in the new Chrome window only
        return
      }

      // Non-Chrome: same-tab Operator Desk (no forced new window)
      openDeskSameTab()
    } catch (err) {
      if (deskWin && !deskWin.closed) deskWin.close()
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  function retryOpenDesk() {
    setPopupBlocked(false)
    if (isChromeBrowser()) {
      const win = openDeskWindowChrome()
      if (win && !win.closed) {
        win.location.replace(deskAbsoluteUrl())
        win.focus()
        return
      }
      setPopupBlocked(true)
      return
    }
    openDeskSameTab()
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-5 py-16">
      <p className="font-display text-[10px] tracking-[0.4em] text-[#e2b14a]">SPORTSCOM</p>
      <h2 className="mt-2 font-display text-3xl tracking-[0.08em] text-[#f3ead7]">
        Operator login
      </h2>
      <p className="mt-2 text-sm text-white/45">
        Chrome opens Operator Desk in a new window. Session stays on this login page.
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

      {(popupBlocked || signedIn) && (
        <div className="mt-8 border border-[#e2b14a]/35 bg-[#e2b14a]/5 p-4">
          <p className="text-sm text-[#f3ead7]">
            {popupBlocked
              ? 'Chrome blocked the new window. Allow popups for this site, then open the desk:'
              : 'Signed in. Operator Desk should be in the new Chrome window.'}
          </p>
          <button
            type="button"
            onClick={retryOpenDesk}
            className="mt-3 border border-[#e2b14a]/50 px-4 py-2 text-sm text-[#e2b14a]"
          >
            Open Operator Desk
          </button>
        </div>
      )}
    </div>
  )
}
