import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'Fixtures | SPEED 2026–27',
}

export default function FixturesPage() {
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
            Published matches will show here by sport, day and team. SportsCom enters the schedule —
            the platform does not invent formats or dates.
          </p>
          <div className="mt-12 border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="font-display text-2xl tracking-[0.08em] text-[var(--speed-muted)]">
              No fixtures published yet
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
