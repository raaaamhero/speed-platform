import { redirect } from 'next/navigation'
import { isOpsAuthenticated } from '@/lib/ops-auth'

export const metadata = { title: 'Operator Desk | SPEED' }

export default async function OpsPage() {
  if (!(await isOpsAuthenticated())) redirect('/ops/login')
  redirect('/ops/operator-desk')
}
