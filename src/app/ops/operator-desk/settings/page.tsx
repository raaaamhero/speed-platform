export default function DeskSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-[#e2b14a]">SETTINGS</p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.08em]">Configuration</h2>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Competition formats, provisional group points (3/1/0), and publication controls live with
          each competition record. Official overall SPEED place values (1000/750/500/250) are fixed
          in scoring RPCs and must not be changed without SportsCom approval.
        </p>
      </div>
      <ul className="space-y-2 text-sm text-white/50">
        <li>· Shared ops password authentication (extensible to roles later)</li>
        <li>· Match results ≠ overall SPEED ledger</li>
        <li>· Placement awards idempotent per competition + place</li>
      </ul>
    </div>
  )
}
