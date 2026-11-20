'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

type AnnouncementItem = {
  id: string
  kind: 'fixture' | 'result'
  title: string
  detail: string
  href: string
  at: string
}

const STORAGE_KEY = 'speed-announcements-seen-at'
const POLL_MS = 45_000

function readSeenAt(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function writeSeenAt(ts: number) {
  localStorage.setItem(STORAGE_KEY, String(ts))
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function AnnouncementCentre() {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AnnouncementItem[]>([])
  const [seenAt, setSeenAt] = useState(0)
  const [viewCutoff, setViewCutoff] = useState(0)
  const [toast, setToast] = useState<AnnouncementItem | null>(null)
  const knownIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    const seen = readSeenAt()
    setSeenAt(seen)
    setViewCutoff(seen)

    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/public/announcements', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { announcements?: AnnouncementItem[] }
        const next = data.announcements || []

        if (knownIds.current === null) {
          knownIds.current = new Set(next.map((n) => n.id))
        } else {
          const fresh = next.find((n) => !knownIds.current!.has(n.id))
          if (fresh && new Date(fresh.at).getTime() > readSeenAt()) {
            setToast(fresh)
          }
          knownIds.current = new Set(next.map((n) => n.id))
        }

        if (!cancelled) setItems(next)
      } catch {
        /* ignore network blips */
      }
    }

    void load()
    const id = window.setInterval(() => void load(), POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 5200)
    return () => window.clearTimeout(id)
  }, [toast])

  const unread = useMemo(() => {
    if (!seenAt) return items.length
    return items.filter((i) => new Date(i.at).getTime() > seenAt).length
  }, [items, seenAt])

  const markSeen = () => {
    const now = Date.now()
    writeSeenAt(now)
    setSeenAt(now)
    setToast(null)
  }

  const toggle = () => {
    setOpen((v) => {
      if (!v) {
        setViewCutoff(seenAt || 0)
        markSeen()
        return true
      }
      return false
    })
  }

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {toast && !open ? (
          <motion.div
            key={toast.id}
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto w-[min(100vw-2.5rem,20rem)] border border-[var(--speed-gold)]/40 bg-[#0c0e14]/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
            role="status"
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--speed-gold)]">
              {toast.kind === 'fixture' ? 'NEW FIXTURE' : 'RESULT ANNOUNCED'}
            </p>
            <p className="mt-1 text-sm leading-snug text-white">{toast.detail}</p>
            <Link
              href={toast.href}
              onClick={() => {
                markSeen()
                setToast(null)
              }}
              className="mt-2 inline-block text-xs tracking-wide text-white/70 hover:text-[var(--speed-gold)]"
            >
              View →
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto flex h-[min(70vh,28rem)] w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden border border-white/15 bg-[#0a0c12]/97 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
            role="dialog"
            aria-label="Announcement centre"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--speed-gold)]">
                  ANNOUNCEMENTS
                </p>
                <p className="mt-0.5 text-sm text-white/70">Fixtures & results</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs tracking-wide text-white/50 hover:text-white"
                aria-label="Close announcements"
              >
                CLOSE
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-2 py-2">
              {items.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-white/45">
                  No announcements yet. New fixtures and results will show up here.
                </li>
              ) : (
                items.map((item) => {
                  const isNew = !viewCutoff || new Date(item.at).getTime() > viewCutoff
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block border-b border-white/5 px-3 py-3 transition hover:bg-white/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-[10px] font-semibold tracking-[0.18em] ${
                              item.kind === 'fixture'
                                ? 'text-[var(--speed-gold)]'
                                : 'text-emerald-400/90'
                            }`}
                          >
                            {item.kind === 'fixture' ? 'FIXTURE' : 'RESULT'}
                            {isNew ? (
                              <span className="ml-2 text-[var(--speed-gold)]">· NEW</span>
                            ) : null}
                          </p>
                          <span className="shrink-0 text-[10px] text-white/35">
                            {formatWhen(item.at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-snug text-white/90">{item.detail}</p>
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        className="pointer-events-auto relative flex h-12 w-12 items-center justify-center border border-[var(--speed-gold)]/50 bg-[#0c0e14] text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition hover:border-[var(--speed-gold)] hover:bg-[#12151e] sm:h-14 sm:w-14"
        aria-label="Open announcement centre"
        aria-expanded={open}
      >
        <BellIcon />
        {unread > 0 && !open ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-[var(--speed-gold)] px-1 text-[10px] font-bold text-black">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a5.5 5.5 0 0 0-5.5 5.5v2.1c0 .7-.2 1.4-.6 2L4.6 14.7A1.2 1.2 0 0 0 5.6 16.5h12.8a1.2 1.2 0 0 0 1-1.8l-1.3-2.1c-.4-.6-.6-1.3-.6-2V8.5A5.5 5.5 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 16.5a2.5 2.5 0 0 0 5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
