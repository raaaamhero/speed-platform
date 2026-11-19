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
    <div className="min-h-[100svh] bg-[#0b0d10] text-[var(--speed-ink)]">
      <header className="border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[10px] tracking-[0.3em] text-[var(--speed-muted)]">
              SPORTSCOM
            </p>
            <h1 className="font-display text-2xl tracking-[0.1em]">COMMAND CENTRE</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {authed &&
              links.map((l) => (
                <Link key={l.href} href={l.href} className="text-[var(--speed-muted)] hover:text-[var(--speed-ink)]">
                  {l.label}
                </Link>
              ))}
            <Link href="/" className="text-[var(--speed-muted)] hover:text-[var(--speed-ink)]">
              Public site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
    </div>
  )
}
