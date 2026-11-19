# SPEED 2026–27 Platform

SportsCom presents **SPEED** — *Where Rivalries Are Born.*

Live stack: Next.js + Supabase (your project) + GitHub (`raaaamhero/speed-platform`).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What works

| Area | Path |
|------|------|
| Landing | `/` |
| Student registration (live Player IDs) | `/register` |
| Live standings | `/standings` |
| Published fixtures | `/fixtures` |
| SportsCom Command Centre | `/ops` (login `/ops/login`) |

### Demo student rolls
`25SEN1001`, `25JUN1001`, `25IPM1001`, … (seeded). Import your real Excel via `/ops/import`.

### SportsCom login
Default local password: set in `.env.local` as `SPEED_OPS_PASSWORD` (default `sportscom`).

## Environment (`.env.local`, never commit)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xiotbqcaiiefrrsyquxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_DB_PASSWORD=...
SUPABASE_DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SPEED_OPS_PASSWORD=sportscom
```

## Database migrations

SQL files live in `supabase/migrations/`. Apply with:

```bash
node scripts/apply-sql.mjs supabase/migrations/<file>.sql
```

## Tests

```bash
npm test
```

## Product boundary

Registration = intended sports participation. Final match squads / live scoring stay outside this app (e.g. CricHeroes).
