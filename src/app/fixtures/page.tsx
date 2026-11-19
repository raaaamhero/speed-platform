import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Fixtures | SPEED 2026–27',
}

export const dynamic = 'force-dynamic'

export default async function FixturesPage() {
  const supabase = await createClient()
  const { data: fixtures } = await supabase
    .from('speed_fixtures')
    .select('id, title, venue, starts_at, status, sport_id, team_a_id, team_b_id')
    .eq('published', true)
    .order('starts_at', { ascending: true })

  const { data: sports } = await supabase.from('speed_sports').select('id, name, slug')
  const { data: teams } = await supabase.from('speed_teams').select('id, name, code')
  const sportMap = new Map((sports || []).map((s) => [s.id, s]))
  const teamMap = new Map((teams || []).map((t) => [t.id, t]))

  const rows = fixtures || []

  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] bg-[var(--speed-bg)] pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">SCHEDULE</p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)]">
            Fixtures
          </h1>
          <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
            Published matches from SportsCom. Status updates as the fest runs.
          </p>

          {rows.length === 0 ? (
            <div className="mt-12 border border-dashed border-white/15 px-6 py-16 text-center">
              <p className="font-display text-2xl tracking-[0.08em] text-[var(--speed-muted)]">
                No fixtures published yet
              </p>
            </div>
          ) : (
            <ul className="mt-10 space-y-3">
              {rows.map((f) => {
                const sport = sportMap.get(f.sport_id)
                const a = f.team_a_id ? teamMap.get(f.team_a_id) : null
                const b = f.team_b_id ? teamMap.get(f.team_b_id) : null
                return (
                  <li key={f.id} className="border border-white/10 px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-2xl tracking-[0.06em] text-[var(--speed-ink)]">
                        {a?.name || 'TBD'} vs {b?.name || 'TBD'}
                      </p>
                      <span className="font-display text-xs tracking-[0.2em] text-[var(--speed-gold)]">
                        {f.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--speed-muted)]">
                      {sport?.name}
                      {f.venue ? ` · ${f.venue}` : ''}
                      {f.starts_at ? ` · ${new Date(f.starts_at).toLocaleString()}` : ''}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
