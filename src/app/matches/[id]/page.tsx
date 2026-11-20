import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Match · SPEED 2026–27`, description: `Official match detail ${id}` }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: fixture } = await supabase
    .from('speed_fixtures')
    .select(
      'id, title, venue, starts_at, status, published, stage, bracket_slot, sport_id, team_a_id, team_b_id, competition_id, group_id',
    )
    .eq('id', id)
    .maybeSingle()

  if (!fixture || !fixture.published) notFound()

  const [sportRes, teamsRes, compRes, groupRes, mrRes] = await Promise.all([
    supabase.from('speed_sports').select('name, slug').eq('id', fixture.sport_id).maybeSingle(),
    supabase.from('speed_teams').select('id, name, code'),
    fixture.competition_id
      ? supabase
          .from('speed_competitions')
          .select('name, slug, category')
          .eq('id', fixture.competition_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    fixture.group_id
      ? supabase
          .from('speed_competition_groups')
          .select('code')
          .eq('id', fixture.group_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('speed_match_results')
      .select(
        'score_a, score_b, winner_team_id, is_draw, metrics, summary, approval_status, approved_at, notes',
      )
      .eq('fixture_id', id)
      .eq('approval_status', 'approved')
      .maybeSingle(),
  ])

  const teamMap = new Map((teamsRes.data || []).map((t) => [t.id, t]))
  const teamA = fixture.team_a_id ? teamMap.get(fixture.team_a_id) : null
  const teamB = fixture.team_b_id ? teamMap.get(fixture.team_b_id) : null
  const mr = mrRes.data
  const winner = mr?.winner_team_id ? teamMap.get(mr.winner_team_id) : null
  const metrics = (mr?.metrics || {}) as Record<string, unknown>
  const stageLabel =
    fixture.stage === 'semi_final'
      ? 'Semi-final'
      : fixture.stage === 'final'
        ? 'Final'
        : fixture.stage === 'group_stage'
          ? `Group ${groupRes.data?.code || ''}`.trim()
          : null

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <Link href="/fixtures" className="text-xs text-[var(--speed-muted)] hover:text-[var(--speed-gold)]">
            ← Fixtures
          </Link>
          <p className="mt-4 font-display text-[10px] tracking-[0.3em] text-[var(--speed-gold)]">
            {(compRes.data?.name || sportRes.data?.name || 'MATCH').toUpperCase()}
            {stageLabel ? ` · ${stageLabel.toUpperCase()}` : ''}
          </p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[0.05em] text-white sm:text-5xl">
            {teamA?.name || 'TBD'}{' '}
            <span className="text-white/30">VS</span> {teamB?.name || 'TBD'}
          </h1>
          <p className="mt-3 text-sm text-[var(--speed-muted)]">
            {fixture.venue || 'Venue TBA'}
            {fixture.starts_at
              ? ` · ${new Date(fixture.starts_at).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                })}`
              : ''}
            {' · '}
            {fixture.status}
          </p>

          {mr ? (
            <div className="mt-10 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8">
              <p className="font-display text-[10px] tracking-[0.28em] text-[var(--speed-gold)]">
                OFFICIAL RESULT
              </p>
              {mr.is_draw ? (
                <p className="mt-4 font-display text-3xl tracking-[0.06em] text-white">Draw</p>
              ) : (
                <p className="mt-4 font-display text-3xl tracking-[0.06em] text-white">
                  {winner?.name} won
                </p>
              )}
              {mr.score_a != null && mr.score_b != null && (
                <p className="mt-2 font-display text-5xl tracking-[0.08em] text-[var(--speed-gold)]">
                  {mr.score_a} – {mr.score_b}
                </p>
              )}
              {mr.summary && (
                <p className="mt-4 text-sm leading-relaxed text-[var(--speed-muted)]">{mr.summary}</p>
              )}
              {metrics.schema === 'cricket' && (
                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  {(['team_a', 'team_b'] as const).map((key, i) => {
                    const side = metrics[key] as
                      | { runs?: number; wickets?: number; overs?: string }
                      | undefined
                    if (!side) return null
                    const name = i === 0 ? teamA?.name : teamB?.name
                    return (
                      <div key={key} className="border border-white/10 px-4 py-3">
                        <p className="text-[var(--speed-gold)]">{name}</p>
                        <p className="mt-1 text-white">
                          {side.runs != null ? side.runs : '—'}
                          {side.wickets != null ? `/${side.wickets}` : ''}
                          {side.overs ? ` (${side.overs} ov)` : ''}
                        </p>
                      </div>
                    )
                  })}
                  {typeof metrics.margin === 'string' && (
                    <p className="sm:col-span-2 text-[var(--speed-muted)]">
                      Margin: {metrics.margin}
                    </p>
                  )}
                </div>
              )}
              <p className="mt-6 text-xs text-white/35">
                Approved
                {mr.approved_at
                  ? ` · ${new Date(mr.approved_at).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}`
                  : ''}
              </p>
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-white/15 px-6 py-12 text-center">
              <p className="font-display text-xl tracking-[0.08em] text-[var(--speed-muted)]">
                Result pending
              </p>
              <p className="mt-2 text-sm text-white/35">
                Official score appears here after SportsCom approval.
              </p>
            </div>
          )}

          <p className="mt-8 text-xs text-white/30">
            Overall SPEED championship points are awarded only for final sport placements — not for
            individual match wins.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
