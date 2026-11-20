import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import { seedAndGenerateFixtures } from '../src/lib/tournament/generate'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (!m) continue
  const key = m[1].trim()
  if (!process.env[key]) process.env[key] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const ref = process.env.SUPABASE_PROJECT_REF || 'xiotbqcaiiefrrsyquxu'
const client = new Client({
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: Number(process.env.SUPABASE_DB_PORT || 6543),
  user: `postgres.${ref}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()
  await client.query('begin')
  try {
    const report = await seedAndGenerateFixtures(client)
    console.log(JSON.stringify(report, null, 2))
    if (report.validationErrors.length) {
      await client.query('rollback')
      process.exit(1)
    }
    await client.query('commit')

    const counts = await client.query(`
      select
        (select count(*) from speed_competitions where format_status='active')::int as active_comps,
        (select count(*) from speed_competition_groups)::int as groups,
        (select count(*) from speed_group_teams)::int as group_teams,
        (select count(*) from speed_fixtures where stage='group_stage')::int as group_fx,
        (select count(*) from speed_fixtures where stage='semi_final')::int as sf,
        (select count(*) from speed_fixtures where stage='final')::int as finals
    `)
    console.log('DB counts', counts.rows[0])
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
