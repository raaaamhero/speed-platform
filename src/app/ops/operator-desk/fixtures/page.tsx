import Link from 'next/link'

export default function DeskFixturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">FIXTURES</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Schedule & publish</h2>
        <p className="mt-2 text-sm text-white/45">
          Assign date, time and venue. Unscheduled matches without date/venue must not appear as
          upcoming on the public site.
        </p>
      </div>
      <Link
        href="/ops/fixtures"
        className="inline-flex border border-[#e2b14a]/40 px-5 py-3 text-sm text-[#e2b14a] hover:bg-[#e2b14a]/10"
      >
        Open fixtures manager →
      </Link>
    </div>
  )
}
