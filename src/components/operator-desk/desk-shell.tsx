'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/ops/operator-desk', label: 'Dashboard', exact: true },
  { href: '/ops/operator-desk/fixtures', label: 'Fixtures' },
  { href: '/ops/operator-desk/match-results', label: 'Match Results' },
  { href: '/ops/operator-desk/standings-knockouts', label: 'Standings & Knockouts' },
  { href: '/ops/operator-desk/registrations', label: 'Registrations' },
  { href: '/ops/operator-desk/overall-points', label: 'Overall SPEED Points' },
  { href: '/ops/operator-desk/announcements', label: 'Announcements' },
  { href: '/ops/operator-desk/settings', label: 'Settings' },
]

export function DeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/ops/login', { method: 'DELETE' })
    router.push('/ops/login')
    router.refresh()
  }

  return (
    <div className="desk-root min-h-[100svh] text-[#f3ead7]">
      <div className="flex min-h-[100svh]">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#07080b] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="font-display text-[10px] tracking-[0.4em] text-[#e2b14a]">SPORTSCOM</p>
            <h1 className="mt-1 font-display text-xl tracking-[0.12em] text-[#f3ead7]">
              COMMAND CENTRE
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.18em] text-white/40">SPEED 2026–27</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm transition ${
                    active
                      ? 'border-l-2 border-[#c81e2c] bg-white/[0.04] text-[#e2b14a]'
                      : 'border-l-2 border-transparent text-white/50 hover:bg-white/[0.03] hover:text-[#f3ead7]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="space-y-2 border-t border-white/10 p-4">
            <Link href="/" className="block text-xs text-white/40 hover:text-[#e2b14a]">
              Public website →
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-xs tracking-wide text-[#c81e2c]/80 hover:text-[#c81e2c]"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0b0f]/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="lg:hidden">
                <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">SPORTSCOM</p>
                <p className="font-display text-lg tracking-[0.1em]">COMMAND CENTRE</p>
              </div>
              <p className="hidden text-xs tracking-[0.2em] text-white/35 lg:block">
                LIVE OPERATIONS
              </p>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="border border-white/15 px-3 py-1.5 text-xs text-white/60"
                >
                  Sign out
                </button>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 px-3 py-1.5 text-xs ${
                      active
                        ? 'border border-[#e2b14a]/40 text-[#e2b14a]'
                        : 'border border-white/10 text-white/45'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
