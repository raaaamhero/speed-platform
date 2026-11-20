import { isOpsAuthenticated } from '@/lib/ops-auth'
import { OpsChrome } from '@/components/ops-chrome'

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const authed = await isOpsAuthenticated()

  return (
    <div className="min-h-[100svh] bg-[#080a0e] text-[var(--speed-ink)]">
      <OpsChrome authed={authed}>{children}</OpsChrome>
    </div>
  )
}
