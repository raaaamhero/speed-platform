'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SPORTS } from '@/lib/rules/sports'
import { checkSportCap } from '@/lib/rules/cap'

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
      <div className="border border-[var(--speed-gold)]/40 bg-black/40 p-8 text-center">
        <p className="font-display text-xs tracking-[0.35em] text-[var(--speed-gold)]">LOCKED IN</p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-[var(--speed-ink)]">
          {playerCode}
        </h2>
        <p className="mt-4 text-[var(--speed-muted)]">
          {lookup?.student?.full_name || 'Registration'} confirmed for {lookup?.student?.team_name}.
          Save your Player ID. Only SportsCom can change your sports after this.
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

      {error && (
        <p className="mb-4 border border-[var(--speed-crimson)]/40 bg-[var(--speed-crimson)]/10 px-3 py-2 text-sm text-[var(--speed-ink)]">
          {error}
        </p>
      )}

      {step === 'identify' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
              Find your profile
            </h2>
            <p className="mt-2 text-sm text-[var(--speed-muted)]">
              Enter your roll number. Name, section and team come from the SportsCom master list.
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
            className="speed-cta disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Checking…' : 'Continue'}
          </button>
          <p className="text-xs text-[var(--speed-muted)]">
            Demo rolls: 25SEN1001, 25JUN1001, 25IPM1001 (after SportsCom import, your real roll works).
          </p>
        </div>
      )}

      {step === 'select' && lookup?.student && (
        <div className="space-y-6">
          <div className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <p className="font-display text-xl tracking-[0.06em] text-[var(--speed-ink)]">
              {lookup.student.full_name}
            </p>
            <p className="mt-1 text-[var(--speed-muted)]">
              {lookup.student.roll_number} · {lookup.student.section_name} · {lookup.student.team_name}
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl tracking-[0.06em] text-[var(--speed-ink)]">
                Choose your sports
              </h2>
              <p className="mt-2 text-sm text-[var(--speed-muted)]">
                Maximum three counted sports. Relays are free extras.
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
                !on && sport.countsTowardCap && !checkSportCap([...selected, sport.slug]).ok
              return (
                <li key={sport.slug}>
                  <button
                    type="button"
                    disabled={wouldBreak || busy}
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
            {lookup?.student?.full_name} · {roll}. After submit, only SportsCom can change this.
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
            <button type="button" onClick={() => setStep('select')} className="speed-ghost" disabled={busy}>
              Back
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              className="speed-cta disabled:opacity-40"
            >
              {busy ? 'Submitting…' : 'Submit registration'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
