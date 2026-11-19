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
      <SiteHeader variant="solid" />
      <main className="speed-arena min-h-[100svh] pt-28 pb-20">
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <p className="speed-kicker">REGISTER</p>
          <h1 className="mt-3 font-display text-5xl tracking-[0.06em] text-[var(--speed-ink)] sm:text-6xl">
            Register for SPEED.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--speed-muted)]">
            Your SPEED journey begins with registration. Register for SPEED now.
          </p>
          <div className="mt-10">
            <RegisterForm />
          </div>
          <p className="mt-6 text-sm text-[var(--speed-muted)]">
            Looking for the public board?{' '}
            <Link href="/standings" className="text-[var(--speed-gold)] hover:underline">
              Standings
            </Link>
            {' · '}
            <Link href="/fixtures" className="text-[var(--speed-gold)] hover:underline">
              Fixtures
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
