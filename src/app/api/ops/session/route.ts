import { NextResponse } from 'next/server'
import { isOpsAuthenticated } from '@/lib/ops-auth'

export async function GET() {
  return NextResponse.json({ ok: await isOpsAuthenticated() })
}
