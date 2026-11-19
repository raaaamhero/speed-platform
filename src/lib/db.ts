import { Client } from 'pg'

function loadEnv() {
  // Next.js already loads .env.local for server code; keep fallback for scripts.
}

loadEnv()

export function createDbClient() {
  const password = process.env.SUPABASE_DB_PASSWORD
  if (!password) throw new Error('Missing SUPABASE_DB_PASSWORD')

  const host = process.env.SUPABASE_DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com'
  const port = Number(process.env.SUPABASE_DB_PORT || 6543)
  const ref = process.env.SUPABASE_PROJECT_REF || 'xiotbqcaiiefrrsyquxu'

  return new Client({
    host,
    port,
    user: `postgres.${ref}`,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })
}

export async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = createDbClient()
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.end().catch(() => undefined)
  }
}
