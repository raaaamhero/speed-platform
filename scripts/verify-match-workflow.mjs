import fs from 'node:fs'
import { Client } from 'pg'

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: Number(process.env.SUPABASE_DB_PORT || 6543),
  user: `postgres.${process.env.SUPABASE_PROJECT_REF || 'xiotbqcaiiefrrsyquxu'}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const cols = await client.query(`
  select column_name from information_schema.columns
  where table_schema='public' and table_name='speed_match_results'
  order by 1
`)
console.log(
  'match_results cols:',
  cols.rows.map((r) => r.column_name).join(', '),
)

const pl = await client.query(`select to_regclass('public.speed_competition_placements') as t`)
console.log('placements table:', pl.rows[0].t)

const beforeLedger = await client.query(`select count(*)::int as n from public.speed_points_ledger`)
console.log('ledger rows before check:', beforeLedger.rows[0].n)

const stats = await client.query(`select public.speed_dashboard_stats() as s`)
console.log('desk stats keys:', Object.keys(stats.rows[0].s).sort().join(', '))
console.log(
  'awaiting / pending / completed:',
  stats.rows[0].s.fixtures_awaiting_results,
  stats.rows[0].s.results_pending_approval,
  stats.rows[0].s.matches_completed,
)

// Confirm draft status allowed
const check = await client.query(`
  select conname, pg_get_constraintdef(oid)
  from pg_constraint
  where conrelid = 'public.speed_match_results'::regclass
    and contype = 'c'
`)
console.log(
  'match_results checks:',
  check.rows.map((r) => r.pg_get_constraintdef).join(' | '),
)

await client.end()
console.log('verify ok')
