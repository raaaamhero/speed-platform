import { redirect } from 'next/navigation'

/** Audit lives under Settings in the simplified desk. */
export default function DeskAuditRedirect() {
  redirect('/ops/operator-desk/settings')
}
