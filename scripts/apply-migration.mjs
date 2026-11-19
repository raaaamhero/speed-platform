import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sqlPath = path.join(root, 'supabase/migrations/20261119000100_speed_foundation.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    const key = m[1].trim()
    const val = m[2].trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

const password = process.env.SUPABASE_DB_PASSWORD
if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env.local')
  process.exit(1)
}
const ref = 'xiotbqcaiiefrrsyquxu'

async function tryConnect(label, config) {
  const client = new Client({
    connectionTimeoutMillis: 8000,
    ...config,
  })
  try {
    await client.connect()
    console.log('CONNECTED', label)
    await client.query(sql)
    console.log('MIGRATION_OK', label)
    const teams = await client.query('select count(*)::int as n from public.speed_teams')
    const sports = await client.query('select count(*)::int as n from public.speed_sports')
    const sections = await client.query('select count(*)::int as n from public.speed_sections')
    console.log('speed_teams', teams.rows[0].n)
    console.log('speed_sports', sports.rows[0].n)
    console.log('speed_sections', sections.rows[0].n)
    await client.end()
    return true
  } catch (e) {
    console.log('FAIL', label, e.message)
    try {
      await client.end()
    } catch {
      /* ignore */
    }
    return false
  }
}

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'eu-west-1',
  'eu-central-1',
  'us-east-1',
  'us-west-1',
  'sa-east-1',
]

const configs = []

for (const aws of ['aws-0', 'aws-1']) {
  for (const region of regions) {
    for (const port of [6543, 5432]) {
      configs.push([
        `${aws}-${region}-${port}`,
        {
          host: `${aws}-${region}.pooler.supabase.com`,
          port,
          user: `postgres.${ref}`,
          password,
          database: 'postgres',
          ssl: { rejectUnauthorized: false },
        },
      ])
    }
  }
}

let ok = false
for (const [label, cfg] of configs) {
  if (await tryConnect(label, cfg)) {
    ok = true
    break
  }
}
process.exit(ok ? 0 : 1)
