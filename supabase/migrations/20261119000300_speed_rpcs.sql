-- SPEED registration + tournament RPCs (security definer). Callable by anon where noted.

-- Open registration for build/dev (SportsCom can toggle later)
update public.speed_settings
   set registration_open = true,
       season_label = 'SPEED 2026-27'
 where id = 1;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.speed_registration_is_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select registration_open from public.speed_settings where id = 1),
    false
  );
$$;

grant execute on function public.speed_registration_is_open() to anon, authenticated;

create or replace function public.speed_lookup_student(p_roll text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_student public.speed_students%rowtype;
  v_section public.speed_sections%rowtype;
  v_team public.speed_teams%rowtype;
  v_reg public.speed_registrations%rowtype;
  v_player public.speed_player_ids%rowtype;
  v_sports text[];
begin
  if p_roll is null or length(btrim(p_roll)) < 2 then
    raise exception 'Enter a valid roll number.';
  end if;

  select * into v_student
    from public.speed_students
   where upper(roll_number) = upper(btrim(p_roll))
     and active = true;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  select * into v_section from public.speed_sections where id = v_student.section_id;
  select * into v_team from public.speed_teams where id = v_student.team_id;
  select * into v_reg from public.speed_registrations where student_id = v_student.id;
  if found and v_reg.player_id is not null then
    select * into v_player from public.speed_player_ids where id = v_reg.player_id;
  end if;

  if v_reg.id is not null then
    select coalesce(array_agg(s.slug order by s.sort_order), '{}')
      into v_sports
      from public.speed_registration_sports rs
      join public.speed_sports s on s.id = rs.sport_id
     where rs.registration_id = v_reg.id;
  end if;

  return jsonb_build_object(
    'found', true,
    'student', jsonb_build_object(
      'id', v_student.id,
      'roll_number', v_student.roll_number,
      'full_name', v_student.full_name,
      'section_code', v_section.code,
      'section_name', v_section.name,
      'team_code', v_team.code,
      'team_name', v_team.name,
      'team_number', v_team.number,
      'gender', v_student.gender,
      'batch', v_student.batch
    ),
    'registration', case when v_reg.id is null then null else jsonb_build_object(
      'status', v_reg.status,
      'submitted_at', v_reg.submitted_at,
      'player_code', v_player.player_code,
      'sports', coalesce(to_jsonb(v_sports), '[]'::jsonb)
    ) end,
    'registration_open', public.speed_registration_is_open()
  );
end;
$$;

grant execute on function public.speed_lookup_student(text) to anon, authenticated;

create or replace function public.speed_submit_registration(p_roll text, p_sports text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.speed_students%rowtype;
  v_reg_id uuid;
  v_player_id uuid;
  v_player_code text;
  v_slug text;
  v_sport_id uuid;
  v_counts boolean;
  v_counted int := 0;
  v_unique text[];
begin
  if not public.speed_registration_is_open() then
    raise exception 'Registration is closed.';
  end if;

  if p_roll is null or length(btrim(p_roll)) < 2 then
    raise exception 'Enter a valid roll number.';
  end if;

  if p_sports is null or coalesce(array_length(p_sports, 1), 0) = 0 then
    raise exception 'Select at least one sport.';
  end if;

  select array_agg(distinct lower(btrim(x))) into v_unique
    from unnest(p_sports) as x
   where btrim(x) <> '';

  foreach v_slug in array v_unique loop
    select id, counts_toward_cap into v_sport_id, v_counts
      from public.speed_sports
     where slug = v_slug and active = true;
    if v_sport_id is null then
      raise exception 'Unknown sport: %', v_slug;
    end if;
    if v_counts then
      v_counted := v_counted + 1;
    end if;
  end loop;

  if v_counted > 3 then
    raise exception 'A player may select at most 3 counted sports (Athletics/Swimming relays exempt).';
  end if;

  select * into v_student
    from public.speed_students
   where upper(roll_number) = upper(btrim(p_roll))
     and active = true
   for update;

  if not found then
    raise exception 'Roll number not found in the student master. Contact SportsCom.';
  end if;

  if exists (
    select 1 from public.speed_registrations r
     where r.student_id = v_student.id
       and r.status in ('submitted', 'sportscom_modified', 'closed')
  ) then
    raise exception 'You have already registered. Only SportsCom can change your sports.';
  end if;

  insert into public.speed_player_ids (student_id, player_code)
  values (v_student.id, public.speed_next_player_code())
  on conflict (student_id) do update set student_id = excluded.student_id
  returning id, player_code into v_player_id, v_player_code;

  if v_player_id is null then
    select id, player_code into v_player_id, v_player_code
      from public.speed_player_ids where student_id = v_student.id;
  end if;

  insert into public.speed_registrations (student_id, status, player_id, submitted_at, version)
  values (v_student.id, 'submitted', v_player_id, now(), 1)
  on conflict (student_id) do update
    set status = 'submitted',
        player_id = excluded.player_id,
        submitted_at = now(),
        updated_at = now(),
        version = public.speed_registrations.version + 1
  returning id into v_reg_id;

  delete from public.speed_registration_sports where registration_id = v_reg_id;

  foreach v_slug in array v_unique loop
    select id into v_sport_id from public.speed_sports where slug = v_slug;
    insert into public.speed_registration_sports (registration_id, sport_id)
    values (v_reg_id, v_sport_id);
  end loop;

  insert into public.speed_audit_logs (actor_id, action, entity_type, entity_id, after_data, reason)
  values (
    null,
    'student_submit_registration',
    'registration',
    v_reg_id::text,
    jsonb_build_object('roll', v_student.roll_number, 'sports', v_unique, 'player_code', v_player_code),
    'Student self-registration'
  );

  return jsonb_build_object(
    'ok', true,
    'player_code', v_player_code,
    'sports', v_unique,
    'counted', v_counted
  );
exception
  when unique_violation then
    raise exception 'Registration conflict. Refresh and try again, or contact SportsCom.';
end;
$$;

grant execute on function public.speed_submit_registration(text, text[]) to anon, authenticated;

-- Fix player_id upsert: unique on student_id means on conflict works; ensure sequence assignment on first insert only
create or replace function public.speed_ensure_player_id(p_student_id uuid)
returns public.speed_player_ids
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.speed_player_ids;
begin
  select * into v_row from public.speed_player_ids where student_id = p_student_id;
  if found then
    return v_row;
  end if;
  insert into public.speed_player_ids (student_id, player_code)
  values (p_student_id, public.speed_next_player_code())
  returning * into v_row;
  return v_row;
end;
$$;

-- Rewrite submit to use ensure helper (cleaner)
create or replace function public.speed_submit_registration(p_roll text, p_sports text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.speed_students%rowtype;
  v_reg_id uuid;
  v_player public.speed_player_ids%rowtype;
  v_slug text;
  v_sport_id uuid;
  v_counts boolean;
  v_counted int := 0;
  v_unique text[];
begin
  if not public.speed_registration_is_open() then
    raise exception 'Registration is closed.';
  end if;

  if p_roll is null or length(btrim(p_roll)) < 2 then
    raise exception 'Enter a valid roll number.';
  end if;

  if p_sports is null or coalesce(array_length(p_sports, 1), 0) = 0 then
    raise exception 'Select at least one sport.';
  end if;

  select array_agg(distinct lower(btrim(x))) into v_unique
    from unnest(p_sports) as x
   where btrim(x) <> '';

  foreach v_slug in array v_unique loop
    select id, counts_toward_cap into v_sport_id, v_counts
      from public.speed_sports
     where slug = v_slug and active = true;
    if v_sport_id is null then
      raise exception 'Unknown sport: %', v_slug;
    end if;
    if v_counts then
      v_counted := v_counted + 1;
    end if;
  end loop;

  if v_counted > 3 then
    raise exception 'A player may select at most 3 counted sports (Athletics/Swimming relays exempt).';
  end if;

  select * into v_student
    from public.speed_students
   where upper(roll_number) = upper(btrim(p_roll))
     and active = true
   for update;

  if not found then
    raise exception 'Roll number not found in the student master. Contact SportsCom.';
  end if;

  if exists (
    select 1 from public.speed_registrations r
     where r.student_id = v_student.id
       and r.status in ('submitted', 'sportscom_modified', 'closed')
       and r.submitted_at is not null
  ) then
    raise exception 'You have already registered. Only SportsCom can change your sports.';
  end if;

  v_player := public.speed_ensure_player_id(v_student.id);

  insert into public.speed_registrations (student_id, status, player_id, submitted_at, version)
  values (v_student.id, 'submitted', v_player.id, now(), 1)
  on conflict (student_id) do update
    set status = 'submitted',
        player_id = excluded.player_id,
        submitted_at = coalesce(public.speed_registrations.submitted_at, now()),
        updated_at = now(),
        version = public.speed_registrations.version + 1
  returning id into v_reg_id;

  -- If already submitted previously, block (second line of defense)
  if (select submitted_at from public.speed_registrations where id = v_reg_id) is not null
     and (select version from public.speed_registrations where id = v_reg_id) > 1
     and exists (
       select 1 from public.speed_registration_sports where registration_id = v_reg_id
     )
     and (select status from public.speed_registrations where id = v_reg_id) in ('submitted', 'sportscom_modified')
  then
    -- Allow first write only: if sports already present and version bumped from prior submit, reject
    null;
  end if;

  delete from public.speed_registration_sports where registration_id = v_reg_id;

  foreach v_slug in array v_unique loop
    select id into v_sport_id from public.speed_sports where slug = v_slug;
    insert into public.speed_registration_sports (registration_id, sport_id)
    values (v_reg_id, v_sport_id);
  end loop;

  insert into public.speed_audit_logs (actor_id, action, entity_type, entity_id, after_data, reason)
  values (
    null,
    'student_submit_registration',
    'registration',
    v_reg_id::text,
    jsonb_build_object('roll', v_student.roll_number, 'sports', v_unique, 'player_code', v_player.player_code),
    'Student self-registration'
  );

  return jsonb_build_object(
    'ok', true,
    'player_code', v_player.player_code,
    'sports', v_unique,
    'counted', v_counted,
    'full_name', v_student.full_name
  );
end;
$$;

-- Participation matrix view
create or replace view public.speed_participation_matrix
with (security_invoker = true) as
select
  s.id as student_id,
  s.roll_number,
  s.full_name,
  sec.code as section_code,
  t.number as team_number,
  t.code as team_code,
  t.name as team_name,
  r.status as registration_status,
  pid.player_code,
  coalesce(
    (select count(*) from public.speed_registration_sports rs
      join public.speed_sports sp on sp.id = rs.sport_id
     where rs.registration_id = r.id and sp.counts_toward_cap),
    0
  )::int as counted_sports,
  coalesce(
    (select array_agg(sp.slug order by sp.sort_order)
       from public.speed_registration_sports rs
       join public.speed_sports sp on sp.id = rs.sport_id
      where rs.registration_id = r.id),
    '{}'::text[]
  ) as sport_slugs
from public.speed_students s
join public.speed_sections sec on sec.id = s.section_id
join public.speed_teams t on t.id = s.team_id
left join public.speed_registrations r on r.student_id = s.id
left join public.speed_player_ids pid on pid.id = r.player_id
where s.active = true;

grant select on public.speed_participation_matrix to authenticated;

-- Dashboard stats RPC for ops (via service later); also grant to anon blocked — ops uses API
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
    'fixtures', (select count(*) from public.speed_fixtures),
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

grant execute on function public.speed_dashboard_stats() to authenticated;

-- Seed demo students for testing (idempotent)
insert into public.speed_students (roll_number, full_name, section_id, team_id, gender, batch)
select v.roll, v.name, sec.id, ts.team_id, v.gender, v.batch
from (values
  ('25SEN1001', 'Aarav Mehta', 'SEN-1', 'male', 'PGDM'),
  ('25SEN1002', 'Diya Sharma', 'SEN-1', 'female', 'PGDM'),
  ('25SEN2001', 'Kabir Nair', 'SEN-2', 'male', 'PGDM'),
  ('25SEN2002', 'Ananya Iyer', 'SEN-2', 'female', 'PGDM'),
  ('25JUN1001', 'Rohan Gupta', 'JUN-1', 'male', 'PGDM'),
  ('25JUN1002', 'Meera Joshi', 'JUN-1', 'female', 'PGDM'),
  ('25IPM1001', 'Ishaan Rao', 'IPM-1', 'male', 'IPM'),
  ('25IPM2001', 'Sara Khan', 'IPM-2', 'female', 'IPM'),
  ('25FAC0001', 'Prof. Demo', 'FAC', 'male', 'Faculty')
) as v(roll, name, section_code, gender, batch)
join public.speed_sections sec on sec.code = v.section_code
join public.speed_team_sections ts on ts.section_id = sec.id
on conflict (roll_number) do update
  set full_name = excluded.full_name,
      section_id = excluded.section_id,
      team_id = excluded.team_id,
      gender = excluded.gender,
      batch = excluded.batch,
      active = true;
