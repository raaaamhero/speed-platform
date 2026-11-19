import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Usage: node scripts/apply-sql.mjs <sql-file>')
  process.exit(1)
}

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
const ref = 'xiotbqcaiiefrrsyquxu'
const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8')

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  user: `postgres.${ref}`,
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

await client.connect()
await client.query(sql)
console.log('OK applied', sqlFile)
await client.end()
