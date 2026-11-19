import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SportsGrid } from '@/components/sports-grid'
import { TeamsStrip } from '@/components/teams-strip'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <section className="border-t border-white/10 bg-[var(--speed-bg)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">ABOUT SPEED</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl tracking-[0.05em] text-[var(--speed-ink)] sm:text-5xl">
              One tournament. Twelve teams. Every section on the field.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--speed-muted)]">
              SPEED 2026–27 brings senior, junior, faculty and IPM together on a single points table.
              Register your sports, follow fixtures, and watch the rivalry unfold.
            </p>
          </div>
        </section>
        <SportsGrid />
        <TeamsStrip />
      </main>
      <SiteFooter />
    </>
  )
}
