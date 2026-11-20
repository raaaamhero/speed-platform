import { redirect } from 'next/navigation'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { DeskShell } from '@/components/operator-desk/desk-shell'

export const metadata = {
  title: 'Operator Desk | SportsCom · SPEED 2026–27',
}

export default async function OperatorDeskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isOpsAuthenticated())) redirect('/ops/login')
  return <DeskShell>{children}</DeskShell>
}
