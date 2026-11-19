import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Standings | SPEED 2026–27',
}

export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const supabase = await createClient()
  const { data: standings } = await supabase
    .from('speed_team_standings')
    .select('number, code, name, points, scoring_events')
    .order('points', { ascending: false })
    .order('number', { ascending: true })

  const rows = standings || []

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
            Live points from approved results. Last load: {new Date().toLocaleString()}.
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
                {rows.map((team, i) => (
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
                    <td className="px-4 py-4 text-right font-mono text-[var(--speed-ink)]">
                      {Number(team.points)}
                    </td>
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
