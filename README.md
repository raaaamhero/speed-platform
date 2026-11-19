# SPEED 2026–27 Platform

SportsCom presents **SPEED** — *Where Rivalries Are Born.*

Public registration + tournament portal, and a SportsCom Command Centre. Built from the Master Project Blueprint and the official SPEED 2026–27 Rulebook.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Framer Motion (reduced-motion aware)
- Supabase (Postgres + Auth + RLS) — tables prefixed `speed_`
- Vitest for rulebook logic tests

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # cap + points engine
npm run build     # production build
```

## Environment

Copy `.env.example` → `.env.local` (already set for the default SportsCom Supabase project).

## Database

Apply [`supabase/migrations/20261119000100_speed_foundation.sql`](supabase/migrations/20261119000100_speed_foundation.sql) in the Supabase SQL editor for project `niaexyzfpuzidgrzjhlo`.

This creates `speed_*` tables alongside the existing TPL Auction schema without colliding.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Cinematic landing |
| `/register` | Student registration (demo UI; live submit next) |
| `/standings` | Overall points table |
| `/fixtures` | Published schedule |
| `/ops` | SportsCom Command Centre shell |

## Important product boundary

Registration is an **expression of interest**, not a final match squad. Match-day selection stays with SportsCom / tools like CricHeroes.
