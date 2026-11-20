import Link from 'next/link'

export default function DeskRegistrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">REGISTRATIONS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Students & import</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/ops/students"
          className="border border-[#e2b14a]/40 px-5 py-3 text-sm text-[#e2b14a]"
        >
          Students
        </Link>
        <Link
          href="/ops/import"
          className="border border-white/15 px-5 py-3 text-sm text-white/50"
        >
          Excel import
        </Link>
      </div>
    </div>
  )
}
