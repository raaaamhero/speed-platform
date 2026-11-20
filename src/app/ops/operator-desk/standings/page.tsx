import Link from 'next/link'

export default function DeskStandingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">GROUP STANDINGS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Sport tables</h2>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Calculated from approved match results only. Points here are group-stage points — not
          overall SPEED championship points. Manual edits of calculated positions are not allowed.
        </p>
      </div>
      <Link
        href="/tournament"
        className="inline-flex border border-[#e2b14a]/40 px-5 py-3 text-sm text-[#e2b14a] hover:bg-[#e2b14a]/10"
      >
        View Tournament Centre tables →
      </Link>
    </div>
  )
}
