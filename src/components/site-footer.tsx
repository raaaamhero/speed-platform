import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-muted)]">
            THE SPORTS COMMITTEE · TAPMI
          </p>
          <p className="mt-2 font-display text-2xl tracking-[0.1em] text-[var(--speed-ink)]">SPEED 2026–27</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--speed-muted)]">
          <Link href="/register" className="hover:text-[var(--speed-ink)]">
            Register
          </Link>
          <Link href="/standings" className="hover:text-[var(--speed-ink)]">
            Standings
          </Link>
          <Link href="/fixtures" className="hover:text-[var(--speed-ink)]">
            Fixtures
          </Link>
          <Link href="/ops" className="hover:text-[var(--speed-ink)]">
            SportsCom
          </Link>
        </div>
      </div>
    </footer>
  )
}
