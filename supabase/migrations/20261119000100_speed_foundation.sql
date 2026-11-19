-- SPEED 2026–27 foundation schema (coexists with TPL Auction tables via speed_ prefix).
-- Apply in Supabase SQL editor for project niaexyzfpuzidgrzjhlo after review.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table if not exists public.speed_sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  cohort text not null check (cohort in ('senior', 'junior', 'faculty', 'ipm')),
  created_at timestamptz not null default now()
);

create table if not exists public.speed_teams (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique check (number between 1 and 12),
  code text not null unique,
  name text not null,
  captain_slots integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.speed_team_sections (
  team_id uuid not null references public.speed_teams(id) on delete cascade,
  section_id uuid not null references public.speed_sections(id) on delete cascade,
  primary key (team_id, section_id)
);

create table if not exists public.speed_sports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  counts_toward_cap boolean not null default true,
  max_squad integer not null,
  playing integer not null,
  substitutes integer not null default 0,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.speed_rule_versions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  effective_from date not null,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Students & registration
-- ---------------------------------------------------------------------------

create table if not exists public.speed_students (
  id uuid primary key default gen_random_uuid(),
  roll_number text not null unique,
  full_name text not null,
  section_id uuid not null references public.speed_sections(id),
  team_id uuid not null references public.speed_teams(id),
  gender text check (gender in ('male', 'female', 'other', 'unspecified')),
  batch text,
  active boolean not null default true,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists speed_students_team_idx on public.speed_students(team_id);
create index if not exists speed_students_section_idx on public.speed_students(section_id);
create index if not exists speed_students_name_idx on public.speed_students(full_name);

create sequence if not exists public.speed_player_id_seq start 1;

create table if not exists public.speed_player_ids (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.speed_students(id) on delete restrict,
  player_code text not null unique,
  assigned_at timestamptz not null default now()
);

create table if not exists public.speed_registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.speed_students(id) on delete cascade,
  status text not null default 'submitted'
    check (status in ('in_progress', 'submitted', 'sportscom_modified', 'closed')),
  player_id uuid references public.speed_player_ids(id),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table if not exists public.speed_registration_sports (
  registration_id uuid not null references public.speed_registrations(id) on delete cascade,
  sport_id uuid not null references public.speed_sports(id) on delete restrict,
  primary key (registration_id, sport_id)
);

-- ---------------------------------------------------------------------------
-- Tournament ops
-- ---------------------------------------------------------------------------

create table if not exists public.speed_fixtures (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.speed_sports(id),
  team_a_id uuid references public.speed_teams(id),
  team_b_id uuid references public.speed_teams(id),
  title text,
  venue text,
  starts_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'completed', 'postponed', 'cancelled')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speed_results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references public.speed_fixtures(id) on delete cascade,
  sport_id uuid not null references public.speed_sports(id),
  team_id uuid not null references public.speed_teams(id),
  place integer check (place is null or place >= 1),
  event_category text not null default 'team_sport'
    check (event_category in ('team_sport', 'athletics_swimming_single', 'athletics_swimming_relay')),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  entered_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.speed_jackpots (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.speed_teams(id),
  sport_id uuid not null references public.speed_sports(id),
  fixture_id uuid references public.speed_fixtures(id),
  placed_at timestamptz not null default now(),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  constraint speed_jackpot_not_relay check (true) -- enforced in RPC against sport slug
);

create table if not exists public.speed_points_ledger (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.speed_teams(id),
  result_id uuid references public.speed_results(id) on delete set null,
  sport_id uuid references public.speed_sports(id),
  base_points numeric not null default 0,
  jackpot_adjustment numeric not null default 0,
  final_points numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.speed_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'general',
  published boolean not null default false,
  author_id uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.speed_operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'admin', 'volunteer')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.speed_audit_logs (
  id bigserial primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.speed_settings (
  id integer primary key default 1 check (id = 1),
  registration_open boolean not null default false,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  season_label text not null default 'SPEED 2026-27',
  timezone text not null default 'Asia/Kolkata'
);

insert into public.speed_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Cap helper
-- ---------------------------------------------------------------------------

create or replace function public.speed_counted_sport_count(p_registration_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.speed_registration_sports rs
  join public.speed_sports s on s.id = rs.sport_id
  where rs.registration_id = p_registration_id
    and s.counts_toward_cap = true;
$$;

create or replace function public.speed_assert_registration_cap()
returns trigger
language plpgsql
as $$
declare
  v_count integer;
begin
  select public.speed_counted_sport_count(new.registration_id) into v_count;
  -- +1 if the newly inserted sport counts
  if exists (
    select 1 from public.speed_sports s
    where s.id = new.sport_id and s.counts_toward_cap
  ) then
    if v_count >= 3 then
      raise exception 'A player may select at most 3 counted sports (Athletics/Swimming relays exempt).';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists speed_registration_sports_cap on public.speed_registration_sports;
create trigger speed_registration_sports_cap
  before insert on public.speed_registration_sports
  for each row execute function public.speed_assert_registration_cap();

-- ---------------------------------------------------------------------------
-- Player ID assignment
-- ---------------------------------------------------------------------------

create or replace function public.speed_next_player_code()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.speed_player_id_seq');
  return 'SPEED-' || lpad(n::text, 4, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed sports & teams (idempotent)
-- ---------------------------------------------------------------------------

insert into public.speed_sports (slug, name, counts_toward_cap, max_squad, playing, substitutes, sort_order)
values
  ('basketball', 'Basketball', true, 10, 5, 5, 1),
  ('badminton', 'Badminton', true, 8, 8, 0, 2),
  ('cricket', 'Cricket', true, 15, 11, 4, 3),
  ('football', 'Football', true, 15, 11, 4, 4),
  ('throwball', 'Throwball', true, 11, 7, 4, 5),
  ('volleyball', 'Volleyball', true, 10, 6, 4, 6),
  ('table-tennis', 'Table Tennis', true, 8, 8, 0, 7),
  ('athletics-relays', 'Athletics Relays', false, 4, 4, 0, 8),
  ('swimming-relays', 'Swimming Relays', false, 4, 4, 0, 9)
on conflict (slug) do update set
  name = excluded.name,
  counts_toward_cap = excluded.counts_toward_cap,
  max_squad = excluded.max_squad,
  playing = excluded.playing,
  substitutes = excluded.substitutes,
  sort_order = excluded.sort_order;

insert into public.speed_teams (number, code, name, captain_slots) values
  (1, 'T1', 'Team 1', 4),
  (2, 'T2', 'Team 2', 4),
  (3, 'T3', 'Team 3', 4),
  (4, 'T4', 'Team 4', 4),
  (5, 'T5', 'Team 5', 4),
  (6, 'T6', 'Team 6', 4),
  (7, 'T7', 'Team 7', 4),
  (8, 'T8', 'Team 8', 4),
  (9, 'T9', 'Team 9', 4),
  (10, 'T10', 'Team 10', 4),
  (11, 'T11', 'Faculty', 0),
  (12, 'T12', 'IPM', 2)
on conflict (number) do update set name = excluded.name, code = excluded.code, captain_slots = excluded.captain_slots;

insert into public.speed_sections (code, name, cohort) values
  ('SEN-1', 'Senior Section 1', 'senior'),
  ('SEN-2', 'Senior Section 2', 'senior'),
  ('SEN-3', 'Senior Section 3', 'senior'),
  ('SEN-4', 'Senior Section 4', 'senior'),
  ('SEN-5', 'Senior Section 5', 'senior'),
  ('SEN-6', 'Senior Section 6', 'senior'),
  ('SEN-MSM', 'Senior MSM', 'senior'),
  ('SEN-IB', 'Senior IB', 'senior'),
  ('SEN-BKFS', 'Senior BKFS', 'senior'),
  ('SEN-AIDS', 'Senior AIDS', 'senior'),
  ('SEN-HR', 'Senior HR', 'senior'),
  ('JUN-1', 'Junior Section 1', 'junior'),
  ('JUN-2', 'Junior Section 2', 'junior'),
  ('JUN-3', 'Junior Section 3', 'junior'),
  ('JUN-4', 'Junior Section 4', 'junior'),
  ('JUN-5', 'Junior Section 5', 'junior'),
  ('JUN-IB', 'Junior IB', 'junior'),
  ('JUN-MSM', 'Junior MSM', 'junior'),
  ('JUN-AIDS', 'Junior AIDS', 'junior'),
  ('JUN-BKFS', 'Junior BKFS', 'junior'),
  ('JUN-HR', 'Junior HR', 'junior'),
  ('FAC', 'Faculty', 'faculty'),
  ('IPM-1', 'IPM 1', 'ipm'),
  ('IPM-2', 'IPM 2', 'ipm'),
  ('IPM-3', 'IPM 3', 'ipm')
on conflict (code) do update set name = excluded.name, cohort = excluded.cohort;

-- Team–section links
insert into public.speed_team_sections (team_id, section_id)
select t.id, s.id
from (values
  (1, 'SEN-1'), (1, 'SEN-2'),
  (2, 'SEN-3'), (2, 'SEN-4'),
  (3, 'SEN-5'), (3, 'SEN-6'),
  (4, 'SEN-MSM'), (4, 'SEN-IB'),
  (5, 'SEN-BKFS'), (5, 'SEN-AIDS'), (5, 'SEN-HR'),
  (6, 'JUN-1'), (6, 'JUN-2'),
  (7, 'JUN-3'), (7, 'JUN-4'),
  (8, 'JUN-5'), (8, 'JUN-IB'),
  (9, 'JUN-MSM'), (9, 'JUN-AIDS'),
  (10, 'JUN-BKFS'), (10, 'JUN-HR'),
  (11, 'FAC'),
  (12, 'IPM-1'), (12, 'IPM-2'), (12, 'IPM-3')
) as m(team_number, section_code)
join public.speed_teams t on t.number = m.team_number
join public.speed_sections s on s.code = m.section_code
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- RLS (public read of published/reference; writes via future RPCs)
-- ---------------------------------------------------------------------------

alter table public.speed_sections enable row level security;
alter table public.speed_teams enable row level security;
alter table public.speed_team_sections enable row level security;
alter table public.speed_sports enable row level security;
alter table public.speed_settings enable row level security;
alter table public.speed_students enable row level security;
alter table public.speed_registrations enable row level security;
alter table public.speed_registration_sports enable row level security;
alter table public.speed_player_ids enable row level security;
alter table public.speed_fixtures enable row level security;
alter table public.speed_results enable row level security;
alter table public.speed_points_ledger enable row level security;
alter table public.speed_jackpots enable row level security;
alter table public.speed_announcements enable row level security;
alter table public.speed_operators enable row level security;
alter table public.speed_audit_logs enable row level security;
alter table public.speed_rule_versions enable row level security;

create or replace function public.speed_is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.speed_operators o where o.user_id = auth.uid()
  );
$$;

grant execute on function public.speed_is_operator() to anon, authenticated;

-- Reference tables: public read
drop policy if exists speed_sections_read on public.speed_sections;
create policy speed_sections_read on public.speed_sections for select using (true);

drop policy if exists speed_teams_read on public.speed_teams;
create policy speed_teams_read on public.speed_teams for select using (true);

drop policy if exists speed_team_sections_read on public.speed_team_sections;
create policy speed_team_sections_read on public.speed_team_sections for select using (true);

drop policy if exists speed_sports_read on public.speed_sports;
create policy speed_sports_read on public.speed_sports for select using (true);

drop policy if exists speed_settings_read on public.speed_settings;
create policy speed_settings_read on public.speed_settings for select using (true);

drop policy if exists speed_fixtures_public on public.speed_fixtures;
create policy speed_fixtures_public on public.speed_fixtures for select using (published = true or public.speed_is_operator());

drop policy if exists speed_results_public on public.speed_results;
create policy speed_results_public on public.speed_results for select using (approval_status = 'approved' or public.speed_is_operator());

drop policy if exists speed_points_public on public.speed_points_ledger;
create policy speed_points_public on public.speed_points_ledger for select using (true);

drop policy if exists speed_announcements_public on public.speed_announcements;
create policy speed_announcements_public on public.speed_announcements for select using (published = true or public.speed_is_operator());

drop policy if exists speed_students_self_or_ops on public.speed_students;
create policy speed_students_self_or_ops on public.speed_students for select using (
  public.speed_is_operator() or auth_user_id = auth.uid()
);

drop policy if exists speed_reg_self_or_ops on public.speed_registrations;
create policy speed_reg_self_or_ops on public.speed_registrations for select using (
  public.speed_is_operator()
  or student_id in (select id from public.speed_students where auth_user_id = auth.uid())
);

drop policy if exists speed_reg_sports_self_or_ops on public.speed_registration_sports;
create policy speed_reg_sports_self_or_ops on public.speed_registration_sports for select using (
  public.speed_is_operator()
  or registration_id in (
    select r.id from public.speed_registrations r
    join public.speed_students s on s.id = r.student_id
    where s.auth_user_id = auth.uid()
  )
);

drop policy if exists speed_player_ids_self_or_ops on public.speed_player_ids;
create policy speed_player_ids_self_or_ops on public.speed_player_ids for select using (
  public.speed_is_operator()
  or student_id in (select id from public.speed_students where auth_user_id = auth.uid())
);

drop policy if exists speed_operators_self on public.speed_operators;
create policy speed_operators_self on public.speed_operators for select using (
  user_id = auth.uid() or public.speed_is_operator()
);

drop policy if exists speed_audit_ops on public.speed_audit_logs;
create policy speed_audit_ops on public.speed_audit_logs for select using (public.speed_is_operator());

drop policy if exists speed_jackpots_ops on public.speed_jackpots;
create policy speed_jackpots_ops on public.speed_jackpots for select using (public.speed_is_operator());

drop policy if exists speed_rule_versions_read on public.speed_rule_versions;
create policy speed_rule_versions_read on public.speed_rule_versions for select using (true);

-- Standings view
create or replace view public.speed_team_standings
with (security_invoker = true) as
select
  t.id,
  t.number,
  t.code,
  t.name,
  coalesce(sum(p.final_points), 0)::numeric as points,
  count(p.id)::integer as scoring_events
from public.speed_teams t
left join public.speed_points_ledger p on p.team_id = t.id
group by t.id
order by points desc, t.number asc;

grant select on public.speed_team_standings to anon, authenticated;
