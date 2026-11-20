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
await client.query('begin')
try {
  // Manual test fixtures (no competition / no generation key)
  const del = await client.query(`
    delete from public.speed_fixtures
    where competition_id is null and generation_key is null
    returning id, title, venue
  `)
  console.log('deleted manual fixtures:', del.rows)

  // Any completed fixture with no match result → reopen
  const reopen = await client.query(`
    update public.speed_fixtures f
    set status = 'scheduled', updated_at = now()
    where f.status = 'completed'
      and not exists (
        select 1 from public.speed_match_results mr
        where mr.fixture_id = f.id and mr.approval_status = 'approved'
      )
    returning id
  `)
  console.log('reopened orphan completed:', reopen.rowCount)

  await client.query(
    `insert into public.speed_audit_logs (action, entity_type, after_data, reason)
     values ('remove_stray_fixtures', 'fixture', $1::jsonb, $2)`,
    [
      JSON.stringify({ deleted: del.rows, reopened: reopen.rowCount }),
      'Removed manual test fixtures; kept official tournament fixtures',
    ],
  )
  await client.query('commit')
} catch (e) {
  await client.query('rollback')
  throw e
}
await client.end()
console.log('ok')
