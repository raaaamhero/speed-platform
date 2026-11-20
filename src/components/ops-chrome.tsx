'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/ops/operator-desk', label: 'Operator Desk' },
  { href: '/ops/students', label: 'Students' },
  { href: '/ops/import', label: 'Import' },
]

export function OpsChrome({
  authed,
  children,
}: {
  authed: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const bare =
    pathname === '/ops/login' ||
    pathname.startsWith('/ops/operator-desk')

  if (bare) return <>{children}</>

  return (
    <>
      <header className="border-b border-white/10 bg-[#0c0f14]/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-[10px] tracking-[0.35em] text-[var(--speed-gold)]">
              SPORTSCOM
            </p>
            <h1 className="font-display text-2xl tracking-[0.1em]">LEGACY TOOLS</h1>
            <p className="mt-1 text-xs text-[var(--speed-muted)]">
              Prefer{' '}
              <Link href="/ops/operator-desk" className="text-[var(--speed-gold)]">
                Operator Desk
              </Link>{' '}
              for day-to-day operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm sm:gap-2">
            {authed &&
              links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="border border-transparent px-3 py-1.5 text-[var(--speed-muted)] transition hover:border-white/15 hover:text-[var(--speed-ink)]"
                >
                  {l.label}
                </Link>
              ))}
            <Link
              href="/"
              className="border border-white/15 px-3 py-1.5 text-[var(--speed-muted)] hover:text-[var(--speed-ink)]"
            >
              Public site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
    </>
  )
}
