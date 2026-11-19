import Link from 'next/link'
import { RegisterForm } from '@/components/register-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'Register | SPEED 2026–27',
}

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="speed-arena min-h-[100svh] pt-28 pb-20">
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">
            STUDENT REGISTRATION
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
            Join SPEED.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
            This is your expression of interest — not a final match squad. SportsCom handles
            match-day selection separately.
          </p>
          <div className="mt-10">
            <RegisterForm />
          </div>
          <p className="mt-6 text-sm text-[var(--speed-muted)]">
            Looking for the public board?{' '}
            <Link href="/standings" className="text-[var(--speed-gold)] hover:underline">
              Standings
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
