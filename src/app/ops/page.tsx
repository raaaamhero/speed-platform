import Link from 'next/link'

const modules = [
  { href: '/ops', title: 'Overview', blurb: 'KPIs, alerts, registration progress' },
  { href: '/ops', title: 'Student master', blurb: 'Import Excel, search preloaded students' },
  { href: '/ops', title: 'Registrations', blurb: 'Review, edit with audit, export lists' },
  { href: '/ops', title: 'Participation matrix', blurb: 'Who plays what — 3-sport cap radar' },
  { href: '/ops', title: 'Fixtures', blurb: 'Create, publish, reschedule' },
  { href: '/ops', title: 'Results & points', blurb: 'Approve results, jackpot, ledger' },
]

export const metadata = {
  title: 'Command Centre | SPEED 2026–27',
}

export default function OpsPage() {
  return (
    <main className="min-h-[100svh] bg-[#0b0d10] text-[var(--speed-ink)]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="font-display text-[10px] tracking-[0.3em] text-[var(--speed-muted)]">
              SPORTSCOM
            </p>
            <h1 className="font-display text-2xl tracking-[0.1em]">COMMAND CENTRE</h1>
          </div>
          <Link href="/" className="text-sm text-[var(--speed-muted)] hover:text-[var(--speed-ink)]">
            ← Public site
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="max-w-2xl text-[var(--speed-muted)]">
          Operator login and live data modules land next. This shell shows the Command Centre map
          from the Master Blueprint — clarity and speed over spectacle.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.title} className="border border-white/10 bg-white/[0.03] px-5 py-5">
              <h2 className="font-display text-xl tracking-[0.08em]">{m.title}</h2>
              <p className="mt-2 text-sm text-[var(--speed-muted)]">{m.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
