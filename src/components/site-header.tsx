'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnnouncementCentre } from '@/components/announcement-centre'

const links = [
  { href: '/#about', label: 'About' },
  { href: '/#sports', label: 'Sports' },
  { href: '/#teams', label: 'Teams' },
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

  return (
    <header
      className={`${
        solid
          ? 'fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#07080b]/95 backdrop-blur-md'
          : 'absolute inset-x-0 top-0 z-40'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
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
              className="mt-0.5 hidden text-[11px] font-medium leading-snug tracking-[0.04em] text-white/55 sm:block"
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

      {open && (
        <div className="absolute inset-x-0 top-full z-50 max-h-[min(80vh,36rem)] overflow-y-auto border-t border-white/10 bg-[#07080b]/98 backdrop-blur-md">
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-8 sm:py-6"
            aria-label="Site menu"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`border-b border-white/10 py-3.5 font-display text-xl tracking-[0.12em] transition hover:text-[var(--speed-gold)] sm:py-4 sm:text-2xl ${
                  l.href === '/register' ? 'text-[var(--speed-gold)]' : 'text-white'
                }`}
              >
                {l.label.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <AnnouncementCentre />
    </header>
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
