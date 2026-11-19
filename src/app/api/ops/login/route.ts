import { NextResponse } from 'next/server'
import { checkOpsPassword, createOpsToken, OPS_COOKIE } from '@/lib/ops-auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const password = String(body.password || '')
  if (!checkOpsPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(OPS_COOKIE, createOpsToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(OPS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
