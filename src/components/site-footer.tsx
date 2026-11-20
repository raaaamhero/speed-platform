import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40 py-10 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-[10px] tracking-[0.28em] text-[var(--speed-muted)] sm:text-xs sm:tracking-[0.35em]">
            THE SPORTS COMMITTEE · TAPMI
          </p>
          <p className="mt-2 font-display text-xl tracking-[0.1em] text-[var(--speed-ink)] sm:text-2xl">
            SPEED 2026–27
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--speed-muted)]">
          <Link href="/register" className="py-1 hover:text-[var(--speed-ink)]">
            Register
          </Link>
          <Link href="/tournament" className="py-1 hover:text-[var(--speed-ink)]">
            Tournament
          </Link>
          <Link href="/standings" className="py-1 hover:text-[var(--speed-ink)]">
            Standings
          </Link>
          <Link href="/fixtures" className="py-1 hover:text-[var(--speed-ink)]">
            Fixtures
          </Link>
          <a
            href="/ops/login"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 hover:text-[var(--speed-ink)]"
          >
            SportsCom
          </a>
        </div>
      </div>
    </footer>
  )
}
