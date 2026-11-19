import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'speed_ops_session'

function opsPassword() {
  return process.env.SPEED_OPS_PASSWORD || 'sportscom'
}

function sign(value: string) {
  const secret = process.env.SPEED_OPS_SECRET || process.env.SUPABASE_DB_PASSWORD || 'speed-ops'
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function createOpsToken() {
  const payload = `ops:${Date.now()}`
  return `${payload}.${sign(payload)}`
}

export function verifyOpsToken(token: string | undefined) {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload)
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function isOpsAuthenticated() {
  const jar = await cookies()
  return verifyOpsToken(jar.get(COOKIE)?.value)
}

export function checkOpsPassword(password: string) {
  return password === opsPassword()
}

export { COOKIE as OPS_COOKIE }
