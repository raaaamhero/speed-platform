import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TEAMS } from '@/lib/rules/teams'

export const metadata = {
  title: 'Standings | SPEED 2026–27',
}

export default function StandingsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] bg-[var(--speed-bg)] pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">OVERALL TABLE</p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)]">
            Standings
          </h1>
          <p className="mt-4 text-[var(--speed-muted)]">
            Live points appear here once SportsCom approves results. Until then, the twelve teams are
            listed in starting order.
          </p>

          <div className="mt-10 overflow-hidden border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-display text-xs tracking-[0.2em] text-[var(--speed-muted)]">
                <tr>
                  <th className="px-4 py-3 font-normal">#</th>
                  <th className="px-4 py-3 font-normal">Team</th>
                  <th className="px-4 py-3 text-right font-normal">Pts</th>
                </tr>
              </thead>
              <tbody>
                {TEAMS.map((team, i) => (
                  <tr key={team.code} className="border-b border-white/5">
                    <td className="px-4 py-4 font-display text-lg text-[var(--speed-muted)]">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-display text-xl tracking-[0.06em] text-[var(--speed-ink)]">
                        {team.name}
                      </span>
                      <span className="ml-3 text-xs text-[var(--speed-muted)]">{team.code}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[var(--speed-ink)]">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
