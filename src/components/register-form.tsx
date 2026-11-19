'use client'

import { useMemo, useState } from 'react'
import { SPORTS } from '@/lib/rules/sports'
import { checkSportCap } from '@/lib/rules/cap'

type Step = 'identify' | 'select' | 'review' | 'done'

/** Demo registration UI — wired to Supabase auth/submit in the next phase. */
export function RegisterForm() {
  const [step, setStep] = useState<Step>('identify')
  const [roll, setRoll] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const cap = useMemo(() => checkSportCap(selected), [selected])

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      const next = [...prev, slug]
      const check = checkSportCap(next)
      return check.ok ? next : prev
    })
  }

  if (step === 'done') {
    return (
      <div className="border border-[var(--speed-gold)]/40 bg-black/40 p-8 text-center">
        <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">LOCKED IN</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-[var(--speed-ink)]">
          SPEED-DEMO
        </h2>
        <p className="mt-4 text-[var(--speed-muted)]">
          Demo confirmation — live Player IDs will be assigned when registration goes live with the
          student master Excel.
        </p>
        <ul className="mt-6 space-y-1 text-sm text-[var(--speed-ink)]">
          {selected.map((s) => {
            const sport = SPORTS.find((x) => x.slug === s)
            return (
              <li key={s}>
                {sport?.name}
                {!sport?.countsTowardCap ? ' (exempt)' : ''}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <div className="border border-white/10 bg-black/35 p-6 sm:p-8">
      <ol className="mb-8 flex flex-wrap gap-3 font-display text-[10px] tracking-[0.25em] text-[var(--speed-muted)]">
        {(['identify', 'select', 'review'] as const).map((s, i) => (
          <li key={s} className={step === s ? 'text-[var(--speed-gold)]' : ''}>
            {String(i + 1).padStart(2, '0')} {s.toUpperCase()}
          </li>
        ))}
      </ol>

      {step === 'identify' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
              Find your profile
            </h2>
            <p className="mt-2 text-sm text-[var(--speed-muted)]">
              Enter your roll number. Your name, section and team are preloaded by SportsCom — you
              will not type them.
            </p>
          </div>
          <label className="block">
            <span className="font-display text-xs tracking-[0.25em] text-[var(--speed-muted)]">
              ROLL NUMBER
            </span>
            <input
              value={roll}
              onChange={(e) => setRoll(e.target.value.toUpperCase())}
              className="mt-2 w-full border border-white/15 bg-black/50 px-4 py-3 font-mono text-[var(--speed-ink)] outline-none focus:border-[var(--speed-gold)]"
              placeholder="e.g. 25A123"
              autoComplete="username"
            />
          </label>
          <button
            type="button"
            disabled={roll.trim().length < 3}
            onClick={() => setStep('select')}
            className="speed-cta disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
          <p className="text-xs text-[var(--speed-muted)]">
            Secure login (OTP / first-time password) will replace this demo step once SportsCom
            confirms the auth method.
          </p>
        </div>
      )}

      {step === 'select' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
                Choose your sports
              </h2>
              <p className="mt-2 text-sm text-[var(--speed-muted)]">
                Maximum three counted sports. Relays are extra.
              </p>
            </div>
            <p className="font-display text-sm tracking-[0.15em] text-[var(--speed-gold)]">
              {cap.counted} / 3 COUNTED
              {cap.exempt > 0 ? ` · ${cap.exempt} EXEMPT` : ''}
            </p>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {SPORTS.map((sport) => {
              const on = selected.includes(sport.slug)
              const wouldBreak =
                !on &&
                sport.countsTowardCap &&
                !checkSportCap([...selected, sport.slug]).ok
              return (
                <li key={sport.slug}>
                  <button
                    type="button"
                    disabled={wouldBreak}
                    onClick={() => toggle(sport.slug)}
                    className={`flex w-full items-center justify-between border px-4 py-4 text-left transition ${
                      on
                        ? 'border-[var(--speed-gold)] bg-[var(--speed-gold)]/10'
                        : 'border-white/10 hover:border-white/25'
                    } disabled:cursor-not-allowed disabled:opacity-35`}
                  >
                    <span>
                      <span className="block font-display text-lg tracking-[0.06em] text-[var(--speed-ink)]">
                        {sport.name}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--speed-muted)]">
                        {sport.countsTowardCap ? 'Counts toward cap' : 'Does not count toward cap'}
                      </span>
                    </span>
                    <span className="font-display text-xs tracking-[0.2em] text-[var(--speed-muted)]">
                      {on ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {!cap.ok && <p className="text-sm text-[var(--speed-crimson)]">{cap.reason}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep('identify')} className="speed-ghost">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep('review')}
              disabled={selected.length === 0 || !cap.ok}
              className="speed-cta disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
            Confirm registration
          </h2>
          <p className="text-sm text-[var(--speed-muted)]">
            Roll <span className="text-[var(--speed-ink)]">{roll}</span>. After you submit for real,
            only SportsCom can change your sports.
          </p>
          <ul className="space-y-2 border border-white/10 p-4">
            {selected.map((s) => {
              const sport = SPORTS.find((x) => x.slug === s)!
              return (
                <li key={s} className="flex justify-between text-sm">
                  <span className="text-[var(--speed-ink)]">{sport.name}</span>
                  <span className="text-[var(--speed-muted)]">
                    {sport.countsTowardCap ? 'Counted' : 'Exempt'}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep('select')} className="speed-ghost">
              Back
            </button>
            <button type="button" onClick={() => setStep('done')} className="speed-cta">
              Submit (demo)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
