'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const links = [
  { href: '/#about', label: 'About' },
  { href: '/#sports', label: 'Sports' },
  { href: '/#teams', label: 'Teams' },
  { href: '/tournament', label: 'Tournament' },
  { href: '/standings', label: 'Standings' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/register', label: 'Register' },
]

type Props = {
  variant?: 'overlay' | 'solid'
}

export function SiteHeader({ variant = 'overlay' }: Props) {
  const [open, setOpen] = useState(false)
  const solid = variant === 'solid'

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 ${open ? 'z-[80]' : 'z-40'} ${
          solid || open
            ? 'border-b border-white/10 bg-[#07080b]'
            : 'border-b border-transparent bg-gradient-to-b from-[#07080b]/90 via-[#07080b]/45 to-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20 sm:h-10 sm:w-10">
              <Image src="/brand/sportscom-logo.jpg" alt="SportsCom" fill className="object-cover" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span
                className="text-[13px] font-extrabold tracking-[0.14em] text-white transition group-hover:text-[var(--speed-gold)] sm:text-sm"
                style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
              >
                SPORTSCOM
              </span>
              <span
                className="mt-0.5 block truncate text-[9px] font-medium leading-snug tracking-[0.02em] text-white/55 sm:text-[11px] sm:tracking-[0.04em]"
                style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
              >
                a team above all, above all a team
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/20 text-white transition hover:border-[var(--speed-gold)]/60 hover:text-[var(--speed-gold)]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {open && (
        <>
          {/* Full-screen frost so hero / page content never shows through */}
          <div
            className="fixed inset-0 z-[70] bg-[#07080b]/80 backdrop-blur-2xl"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 top-[3.75rem] z-[75] overflow-y-auto border-t border-white/10 bg-[#07080b] sm:top-[4.25rem]">
            <nav
              className="mx-auto flex max-w-6xl flex-col gap-0 px-4 py-5 sm:px-8 sm:py-8"
              aria-label="Site menu"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`border-b border-white/10 py-4 font-display text-2xl tracking-[0.12em] transition hover:text-[var(--speed-gold)] sm:py-5 sm:text-3xl ${
                    l.href === '/register' ? 'text-[var(--speed-gold)]' : 'text-white'
                  }`}
                >
                  {l.label.toUpperCase()}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
