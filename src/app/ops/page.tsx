import { redirect } from 'next/navigation'
import { isOpsAuthenticated } from '@/lib/ops-auth'
import { OpsDashboard } from '@/components/ops-dashboard'

export const metadata = { title: 'Command Centre | SPEED' }

export default async function OpsPage() {
  if (!(await isOpsAuthenticated())) redirect('/ops/login')
  return <OpsDashboard />
}
