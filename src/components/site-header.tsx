import Link from 'next/link'

const links = [
  { href: '/#sports', label: 'Sports' },
  { href: '/#teams', label: 'Teams' },
  { href: '/standings', label: 'Standings' },
  { href: '/fixtures', label: 'Fixtures' },
]

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-[11px] tracking-[0.35em] text-[var(--speed-muted)] transition group-hover:text-[var(--speed-gold)]">
            SPORTSCOM PRESENTS
          </span>
          <span className="font-display text-2xl tracking-[0.12em] text-[var(--speed-ink)]">SPEED</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
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

        <Link href="/register" className="speed-cta text-sm">
          Register
        </Link>
      </div>
    </header>
  )
}
