import Link from 'next/link'

export default function DeskCompetitionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">COMPETITIONS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Groups, draws & formats</h2>
        <p className="mt-2 text-sm text-white/45">
          Manage competition seed, group allocation and fixture generation from the tournament
          console.
        </p>
      </div>
      <Link
        href="/ops/tournament"
        className="inline-flex border border-[#e2b14a]/40 px-5 py-3 text-sm text-[#e2b14a] hover:bg-[#e2b14a]/10"
      >
        Open tournament console →
      </Link>
      <Link href="/tournament" className="ml-3 text-sm text-white/40 hover:text-[#e2b14a]">
        Public Tournament Centre
      </Link>
    </div>
  )
}
