'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SPORTS } from '@/lib/rules/sports'
import { checkSportCap } from '@/lib/rules/cap'
import { sportVisual } from '@/lib/sports-visuals'

type Step = 'identify' | 'select' | 'review' | 'done'

type Lookup = {
  found: boolean
  registration_open?: boolean
  student?: {
    full_name: string
    roll_number: string
    section_name: string
    team_name: string
    team_code: string
  }
  registration?: {
    status: string
    player_code: string
    sports: string[]
  } | null
}

export function RegisterForm() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState<Step>('identify')
  const [roll, setRoll] = useState('')
  const [lookup, setLookup] = useState<Lookup | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerCode, setPlayerCode] = useState<string | null>(null)

  const cap = useMemo(() => checkSportCap(selected), [selected])

  async function lookupStudent() {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.rpc('speed_lookup_student', {
        p_roll: roll.trim(),
      })
      if (err) throw err
      const result = data as Lookup
      setLookup(result)
      if (!result.found) {
        setError('Roll number not found. Ask SportsCom to add you to the student master.')
        return
      }
      if (result.registration?.player_code) {
        setSelected(result.registration.sports || [])
        setPlayerCode(result.registration.player_code)
        setStep('done')
        return
      }
      if (result.registration_open === false) {
        setError('Registration is currently closed.')
        return
      }
      setStep('select')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setBusy(false)
    }
  }

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      const next = [...prev, slug]
      return checkSportCap(next).ok ? next : prev
    })
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.rpc('speed_submit_registration', {
        p_roll: roll.trim(),
        p_sports: selected,
      })
      if (err) throw err
      setPlayerCode((data as { player_code: string }).player_code)
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'done' && playerCode) {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden border border-[var(--speed-gold)]/45 bg-gradient-to-b from-[var(--speed-gold)]/10 to-black/50 p-8 text-center sm:p-10"
      >
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 opacity-40">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-[var(--speed-gold)]"
                style={{
                  left: `${8 + (i * 7) % 84}%`,
                  top: `${10 + (i * 11) % 70}%`,
                  opacity: 0.35 + (i % 5) * 0.1,
                }}
              />
            ))}
          </div>
        )}
        <p className="speed-kicker relative">YOU&apos;RE REGISTERED</p>
        <h2 className="relative mt-4 font-display text-3xl tracking-[0.08em] text-white sm:text-4xl">
          {lookup?.student?.full_name || 'Athlete'}
        </h2>
        <p className="relative mt-2 text-sm text-[var(--speed-muted)]">
          {lookup?.student?.team_name} · {lookup?.student?.section_name}
        </p>
        <div className="relative mx-auto mt-8 max-w-sm border border-white/15 bg-black/50 px-6 py-6">
          <p className="font-display text-[10px] tracking-[0.35em] text-[var(--speed-gold)]">
            SPEED PLAYER ID
          </p>
          <p className="mt-2 font-display text-4xl tracking-[0.12em] text-[var(--speed-ink)] sm:text-5xl">
            {playerCode}
          </p>
        </div>
        <p className="relative mt-6 text-sm text-[var(--speed-muted)]">
          Registration complete. Contact SportsCom to change sports later.
        </p>
        <ul className="relative mt-6 flex flex-wrap justify-center gap-2">
          {selected.map((s) => {
            const sport = SPORTS.find((x) => x.slug === s)
            const visual = sportVisual(s)
            return (
              <li
                key={s}
                className="border border-white/15 px-3 py-1.5 text-xs text-[var(--speed-ink)]"
                style={{ borderColor: visual?.accent || undefined }}
              >
                {sport?.name}
                {!sport?.countsTowardCap ? ' · EXEMPT' : ''}
              </li>
            )
          })}
        </ul>
      </motion.div>
    )
  }

  return (
    <div className="speed-panel overflow-hidden">
      <div className="border-b border-white/10 bg-black/40 px-5 py-4 sm:px-8">
        <ol className="flex flex-wrap gap-4 font-display text-[10px] tracking-[0.25em] text-[var(--speed-muted)]">
          {(['identify', 'select', 'review'] as const).map((s, i) => (
            <li
              key={s}
              className={step === s ? 'text-[var(--speed-gold)]' : ''}
              aria-current={step === s ? 'step' : undefined}
            >
              {String(i + 1).padStart(2, '0')} {s.toUpperCase()}
            </li>
          ))}
        </ol>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <p
            role="alert"
            className="mb-5 border border-[var(--speed-crimson)]/40 bg-[var(--speed-crimson)]/10 px-3 py-2 text-sm text-[var(--speed-ink)]"
          >
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          {step === 'identify' && (
            <motion.div
              key="identify"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
                  Enter your roll number
                </h2>
                <p className="mt-2 text-sm text-[var(--speed-muted)]">
                  Your SPEED journey begins with registration.
                </p>
              </div>
              <label className="block">
                <span className="font-display text-xs tracking-[0.25em] text-[var(--speed-muted)]">
                  ROLL NUMBER
                </span>
                <input
                  value={roll}
                  onChange={(e) => setRoll(e.target.value.toUpperCase())}
                  className="speed-input mt-2 font-mono"
                  placeholder="e.g. 25SEN1001"
                  autoComplete="username"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && roll.trim().length >= 3) void lookupStudent()
                  }}
                />
              </label>
              <button
                type="button"
                disabled={roll.trim().length < 3 || busy}
                onClick={() => void lookupStudent()}
                className="speed-cta speed-cta-sweep"
              >
                {busy ? 'Checking…' : 'Continue'}
              </button>
              <p className="text-xs text-[var(--speed-muted)]">
                Demo rolls: 25SEN1001, 25JUN1001, 25IPM1001 (after SportsCom import, your real roll
                works).
              </p>
            </motion.div>
          )}

          {step === 'select' && lookup?.student && (
            <motion.div
              key="select"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="border border-[var(--speed-gold)]/30 bg-[var(--speed-gold)]/[0.06] px-5 py-5">
                <p className="mt-0 font-display text-3xl tracking-[0.06em] text-white">
                  {lookup.student.full_name}
                </p>
                <p className="mt-2 text-sm text-[var(--speed-muted)]">
                  {lookup.student.roll_number} · {lookup.student.section_name} ·{' '}
                  {lookup.student.team_name}
                </p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
                    Choose your sports
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-[var(--speed-muted)]">
                    Up to 3 counted sports. Athletics and swimming relays are exempt.
                  </p>
                </div>
                <p
                  className="font-display text-sm tracking-[0.15em] text-[var(--speed-gold)]"
                  aria-live="polite"
                >
                  {cap.counted} / 3 COUNTED
                  {cap.exempt > 0 ? ` · ${cap.exempt} EXEMPT` : ''}
                </p>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2">
                {SPORTS.map((sport) => {
                  const on = selected.includes(sport.slug)
                  const wouldBreak =
                    !on && sport.countsTowardCap && !checkSportCap([...selected, sport.slug]).ok
                  const visual = sportVisual(sport.slug)
                  return (
                    <li key={sport.slug}>
                      <button
                        type="button"
                        disabled={wouldBreak || busy}
                        onClick={() => toggle(sport.slug)}
                        aria-pressed={on}
                        className={`relative flex w-full items-center justify-between overflow-hidden border px-4 py-4 text-left transition ${
                          on
                            ? 'border-[var(--speed-gold)] bg-[var(--speed-gold)]/10'
                            : 'border-white/10 hover:border-white/25'
                        } disabled:cursor-not-allowed disabled:opacity-35`}
                      >
                        {visual && (
                          <span
                            className="pointer-events-none absolute inset-y-0 left-0 w-1"
                            style={{ background: visual.accent }}
                          />
                        )}
                        <span>
                          <span className="block font-display text-lg tracking-[0.06em] text-[var(--speed-ink)]">
                            {sport.name}
                          </span>
                          <span className="mt-1 block text-xs text-[var(--speed-muted)]">
                            {sport.countsTowardCap ? 'Counts toward 3-sport cap' : 'EXEMPT — free extra'}
                          </span>
                        </span>
                        <span
                          className={`font-display text-xs tracking-[0.2em] ${
                            on ? 'text-[var(--speed-gold)]' : 'text-[var(--speed-muted)]'
                          }`}
                        >
                          {on ? 'SELECTED' : 'SELECT'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep('identify')} className="speed-ghost">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  disabled={selected.length === 0 || !cap.ok}
                  className="speed-cta"
                >
                  Review
                </button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
                Confirm registration
              </h2>
              <p className="text-sm text-[var(--speed-muted)]">
                {lookup?.student?.full_name} · {roll} · {lookup?.student?.team_name}
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
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="speed-ghost"
                  disabled={busy}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy}
                  className="speed-cta speed-cta-sweep"
                >
                  {busy ? 'Submitting…' : 'Submit registration'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
