-- Match-result workflow + idempotent overall SPEED placement awards (additive)

-- Allow draft → pending → approved / rejected on match results
alter table public.speed_match_results
  drop constraint if exists speed_match_results_approval_status_check;

alter table public.speed_match_results
  add constraint speed_match_results_approval_status_check
  check (approval_status in ('draft', 'pending', 'approved', 'rejected'));

alter table public.speed_match_results
  add column if not exists competition_id uuid references public.speed_competitions(id) on delete set null;

alter table public.speed_match_results
  add column if not exists summary text;

alter table public.speed_match_results
  add column if not exists entered_by_label text;

alter table public.speed_match_results
  add column if not exists approved_by_label text;

alter table public.speed_match_results
  add column if not exists corrected_from uuid references public.speed_match_results(id) on delete set null;

create index if not exists speed_match_results_competition_idx
  on public.speed_match_results (competition_id);

create index if not exists speed_match_results_status_idx
  on public.speed_match_results (approval_status);

-- Backfill competition_id from fixtures
update public.speed_match_results mr
set competition_id = f.competition_id
from public.speed_fixtures f
where mr.fixture_id = f.id
  and mr.competition_id is null
  and f.competition_id is not null;

-- Final sport placement → overall SPEED points (idempotent per competition + place)
create table if not exists public.speed_competition_placements (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.speed_competitions(id) on delete cascade,
  place integer not null check (place between 1 and 4),
  team_id uuid not null references public.speed_teams(id),
  result_id uuid references public.speed_results(id) on delete set null,
  awarded_at timestamptz not null default now(),
  unique (competition_id, place)
);

alter table public.speed_competition_placements enable row level security;

drop policy if exists speed_placements_read on public.speed_competition_placements;
create policy speed_placements_read on public.speed_competition_placements for select using (true);

grant select on public.speed_competition_placements to anon, authenticated;

-- Public can only see approved match results (draft/pending hidden)
drop policy if exists speed_match_results_public on public.speed_match_results;
create policy speed_match_results_public on public.speed_match_results
  for select using (approval_status = 'approved' or public.speed_is_operator());

-- Richer operator desk stats (additive fields; keeps prior keys)
create or replace function public.speed_dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'students', (select count(*) from public.speed_students where active),
    'registered', (select count(*) from public.speed_registrations where submitted_at is not null),
    'registration_open', public.speed_registration_is_open(),
    'teams', (select count(*) from public.speed_teams),
    'fixtures', (select count(*) from public.speed_fixtures),
    'fixtures_scheduled', (select count(*) from public.speed_fixtures where status = 'scheduled' and starts_at is not null),
    'fixtures_awaiting_results', (
      select count(*) from public.speed_fixtures f
      where f.team_a_id is not null and f.team_b_id is not null
        and f.status not in ('cancelled', 'abandoned', 'completed')
        and not exists (select 1 from public.speed_match_results mr where mr.fixture_id = f.id)
    ),
    'results_pending_approval', (
      select count(*) from public.speed_match_results where approval_status in ('draft', 'pending')
    ),
    'matches_completed', (
      select count(*) from public.speed_match_results where approval_status = 'approved'
    ),
    'upcoming_matches', (
      select count(*) from public.speed_fixtures
      where published and status = 'scheduled' and starts_at is not null and starts_at > now()
    ),
    'active_competitions', (
      select count(*) from public.speed_competitions where format_status = 'active'
    ),
    'pending_qualification', (
      select count(*) from public.speed_qualification_reviews where status = 'draft'
    ),
    'pending_results', (select count(*) from public.speed_results where approval_status = 'pending'),
    'by_sport', coalesce((
      select jsonb_object_agg(slug, n) from (
        select sp.slug, count(rs.*)::int as n
        from public.speed_sports sp
        left join public.speed_registration_sports rs on rs.sport_id = sp.id
        group by sp.slug
      ) x
    ), '{}'::jsonb)
  );
$$;
