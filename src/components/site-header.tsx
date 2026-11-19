'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '/#about', label: 'About' },
  { href: '/#sports', label: 'Sports' },
  { href: '/#teams', label: 'Teams' },
  { href: '/standings', label: 'Standings' },
  { href: '/fixtures', label: 'Fixtures' },
]

type Props = {
  variant?: 'overlay' | 'solid'
}

export function SiteHeader({ variant = 'overlay' }: Props) {
  const [open, setOpen] = useState(false)
  const solid = variant === 'solid'

  return (
    <header
      className={`${
        solid
          ? 'fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#07080b]/92 backdrop-blur-md'
          : 'absolute inset-x-0 top-0 z-40'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20">
            <Image src="/brand/sportscom-logo.jpg" alt="SportsCom" fill className="object-cover" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className="text-[10px] tracking-[0.2em] text-[var(--speed-muted)] transition group-hover:text-white"
              style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
            >
              <span className="font-extrabold text-white/90">SPORTSCOM</span>{' '}
              <span className="font-medium tracking-[0.28em] text-[var(--speed-gold)]">PRESENTS</span>
            </span>
            <span className="font-display text-2xl tracking-[0.12em] text-[var(--speed-ink)]">SPEED</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-[var(--speed-muted)] transition hover:text-[var(--speed-ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/register" className="speed-cta speed-cta-sweep text-sm">
            Register
          </Link>
          <button
            type="button"
            className="border border-white/20 px-2.5 py-2 text-xs text-white lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            MENU
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/95 px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display tracking-[0.15em] text-[var(--speed-muted)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
