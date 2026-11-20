-- SPEED tournament structure (additive). Preserves registration + overall SPEED scoring.

-- Competitions (Basketball Men/Women are separate rows under sport basketball)
create table if not exists public.speed_competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sport_id uuid not null references public.speed_sports(id),
  name text not null,
  category text check (category is null or category in ('open', 'men', 'women')),
  format_status text not null default 'pending'
    check (format_status in ('active', 'pending')),
  -- Provisional group points (editable). Null means "not configured".
  points_win numeric,
  points_draw numeric,
  points_loss numeric,
  points_provisional boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speed_competition_groups (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.speed_competitions(id) on delete cascade,
  code text not null check (code in ('A', 'B', 'C', 'D')),
  unique (competition_id, code)
);

create table if not exists public.speed_group_teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.speed_competitions(id) on delete cascade,
  group_id uuid not null references public.speed_competition_groups(id) on delete cascade,
  team_id uuid not null references public.speed_teams(id),
  seed_order integer not null default 0,
  unique (group_id, team_id),
  unique (competition_id, team_id)
);

create table if not exists public.speed_competition_sf_rules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.speed_competitions(id) on delete cascade,
  sf_index smallint not null check (sf_index in (1, 2)),
  home_group text not null check (home_group in ('A', 'B', 'C', 'D')),
  away_group text not null check (away_group in ('A', 'B', 'C', 'D')),
  unique (competition_id, sf_index)
);

create table if not exists public.speed_tiebreak_configs (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.speed_competitions(id) on delete cascade,
  sort_order integer not null default 0,
  rule_key text not null,
  label text not null,
  unique (competition_id, sort_order)
);

-- Match outcomes (separate from overall SPEED place awards in speed_results)
create table if not exists public.speed_match_results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null unique references public.speed_fixtures(id) on delete cascade,
  score_a numeric,
  score_b numeric,
  winner_team_id uuid references public.speed_teams(id),
  is_draw boolean not null default false,
  metrics jsonb not null default '{}'::jsonb,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  notes text,
  entered_at timestamptz not null default now(),
  approved_at timestamptz,
  check (
    (is_draw = true and winner_team_id is null)
    or (is_draw = false and winner_team_id is not null)
  )
);

create table if not exists public.speed_qualification_reviews (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null unique references public.speed_competitions(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'invalidated')),
  winners jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  invalidated_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

-- Extend fixtures for tournament structure
alter table public.speed_fixtures
  add column if not exists competition_id uuid references public.speed_competitions(id) on delete set null;

alter table public.speed_fixtures
  add column if not exists group_id uuid references public.speed_competition_groups(id) on delete set null;

alter table public.speed_fixtures
  add column if not exists stage text
    check (stage is null or stage in ('group_stage', 'semi_final', 'final'));

alter table public.speed_fixtures
  add column if not exists bracket_slot text;

alter table public.speed_fixtures
  add column if not exists generation_key text;

-- NULL generation_key allowed for legacy manual fixtures (NULLs are distinct in PG unique)
create unique index if not exists speed_fixtures_generation_key_uidx
  on public.speed_fixtures (generation_key);

create index if not exists speed_fixtures_competition_idx on public.speed_fixtures (competition_id);
create index if not exists speed_fixtures_stage_idx on public.speed_fixtures (stage);

-- RLS
alter table public.speed_competitions enable row level security;
alter table public.speed_competition_groups enable row level security;
alter table public.speed_group_teams enable row level security;
alter table public.speed_competition_sf_rules enable row level security;
alter table public.speed_tiebreak_configs enable row level security;
alter table public.speed_match_results enable row level security;
alter table public.speed_qualification_reviews enable row level security;

drop policy if exists speed_competitions_read on public.speed_competitions;
create policy speed_competitions_read on public.speed_competitions for select using (true);

drop policy if exists speed_competition_groups_read on public.speed_competition_groups;
create policy speed_competition_groups_read on public.speed_competition_groups for select using (true);

drop policy if exists speed_group_teams_read on public.speed_group_teams;
create policy speed_group_teams_read on public.speed_group_teams for select using (true);

drop policy if exists speed_sf_rules_read on public.speed_competition_sf_rules;
create policy speed_sf_rules_read on public.speed_competition_sf_rules for select using (true);

drop policy if exists speed_tiebreak_read on public.speed_tiebreak_configs;
create policy speed_tiebreak_read on public.speed_tiebreak_configs for select using (true);

drop policy if exists speed_match_results_public on public.speed_match_results;
create policy speed_match_results_public on public.speed_match_results
  for select using (approval_status = 'approved' or public.speed_is_operator());

drop policy if exists speed_qualification_read on public.speed_qualification_reviews;
create policy speed_qualification_read on public.speed_qualification_reviews
  for select using (status = 'confirmed' or public.speed_is_operator());

grant select on public.speed_competitions to anon, authenticated;
grant select on public.speed_competition_groups to anon, authenticated;
grant select on public.speed_group_teams to anon, authenticated;
grant select on public.speed_competition_sf_rules to anon, authenticated;
grant select on public.speed_tiebreak_configs to anon, authenticated;
grant select on public.speed_match_results to anon, authenticated;
grant select on public.speed_qualification_reviews to anon, authenticated;

-- Rename athletics/swimming display names (slugs unchanged for registration)
update public.speed_sports set name = 'Athletics' where slug = 'athletics-relays';
update public.speed_sports set name = 'Swimming' where slug = 'swimming-relays';
