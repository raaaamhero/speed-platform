import { redirect } from 'next/navigation'

/** Tournament setup absorbed into Fixtures. */
export default function DeskCompetitionsRedirect() {
  redirect('/ops/operator-desk/fixtures')
}
