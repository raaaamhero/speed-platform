import Link from 'next/link'
import { isOpsAuthenticated } from '@/lib/ops-auth'

const links = [
  { href: '/ops', label: 'Overview' },
  { href: '/ops/students', label: 'Students' },
  { href: '/ops/import', label: 'Import' },
  { href: '/ops/fixtures', label: 'Fixtures' },
  { href: '/ops/results', label: 'Results' },
]

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const authed = await isOpsAuthenticated()

  return (
    <div className="min-h-[100svh] bg-[#080a0e] text-[var(--speed-ink)]">
      <header className="border-b border-white/10 bg-[#0c0f14]/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-[10px] tracking-[0.35em] text-[var(--speed-gold)]">
              SPORTSCOM
            </p>
            <h1 className="font-display text-2xl tracking-[0.1em]">COMMAND CENTRE</h1>
            <p className="mt-1 text-xs text-[var(--speed-muted)]">Tournament control · SPEED 2026–27</p>
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
    </div>
  )
}
