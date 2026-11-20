import Link from 'next/link'

export default function DeskKnockoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">KNOCKOUTS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Semi-finals & finals</h2>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Official competition-specific SF pairings. Enter KO scores under Match Results. Winning a
          semi-final does not award overall SPEED points — only final sport placement does.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/ops/operator-desk/match-results"
          className="border border-[#e2b14a]/40 px-5 py-3 text-sm text-[#e2b14a]"
        >
          Enter KO results
        </Link>
        <Link href="/tournament" className="border border-white/15 px-5 py-3 text-sm text-white/50">
          Public brackets
        </Link>
      </div>
    </div>
  )
}
