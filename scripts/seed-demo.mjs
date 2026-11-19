import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0 && !process.env[line.slice(0, i)]) process.env[line.slice(0, i)] = line.slice(i + 1)
}

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT || 6543),
  user: 'postgres.xiotbqcaiiefrrsyquxu',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const sport = (await client.query(`select id from speed_sports where slug='cricket'`)).rows[0].id
const t1 = (await client.query(`select id from speed_teams where number=1`)).rows[0].id
const t2 = (await client.query(`select id from speed_teams where number=2`)).rows[0].id

const existing = await client.query(
  `select id from speed_fixtures where title = $1 limit 1`,
  ['Cricket: Team 1 vs Team 2'],
)

let fixtureId = existing.rows[0]?.id
if (!fixtureId) {
  const f = await client.query(
    `insert into speed_fixtures (sport_id, team_a_id, team_b_id, title, venue, starts_at, status, published)
     values ($1,$2,$3,$4,$5, now() + interval '1 day', 'scheduled', true)
     returning id`,
    [sport, t1, t2, 'Cricket: Team 1 vs Team 2', 'Main Ground'],
  )
  fixtureId = f.rows[0].id
}

const hasResult = await client.query(
  `select id from speed_results where fixture_id=$1 and team_id=$2 limit 1`,
  [fixtureId, t1],
)
if (!hasResult.rows[0]) {
  const r = await client.query(
    `insert into speed_results (fixture_id, sport_id, team_id, place, event_category, approval_status)
     values ($1,$2,$3,1,'team_sport','pending') returning id`,
    [fixtureId, sport, t1],
  )
  await client.query(`select speed_approve_result($1)`, [r.rows[0].id])
}

const standings = await client.query(
  `select name, points from speed_team_standings order by points desc, number asc limit 5`,
)
console.log({ fixtureId, standings: standings.rows })
await client.end()
