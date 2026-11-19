-- Clean registration submit + tournament ops RPCs

create or replace function public.speed_submit_registration(p_roll text, p_sports text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.speed_students%rowtype;
  v_reg public.speed_registrations%rowtype;
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

  select * into v_reg from public.speed_registrations where student_id = v_student.id for update;
  if found then
    if v_reg.submitted_at is not null then
      raise exception 'You have already registered. Only SportsCom can change your sports.';
    end if;
  end if;

  v_player := public.speed_ensure_player_id(v_student.id);

  if v_reg.id is null then
    insert into public.speed_registrations (student_id, status, player_id, submitted_at, version)
    values (v_student.id, 'submitted', v_player.id, now(), 1)
    returning * into v_reg;
  else
    update public.speed_registrations
       set status = 'submitted',
           player_id = v_player.id,
           submitted_at = now(),
           updated_at = now(),
           version = version + 1
     where id = v_reg.id
    returning * into v_reg;
  end if;

  delete from public.speed_registration_sports where registration_id = v_reg.id;

  foreach v_slug in array v_unique loop
    select id into v_sport_id from public.speed_sports where slug = v_slug;
    insert into public.speed_registration_sports (registration_id, sport_id)
    values (v_reg.id, v_sport_id);
  end loop;

  insert into public.speed_audit_logs (action, entity_type, entity_id, after_data, reason)
  values (
    'student_submit_registration',
    'registration',
    v_reg.id::text,
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

-- Points helper
create or replace function public.speed_base_points(p_category text, p_place int)
returns numeric
language sql
immutable
as $$
  select case
    when p_place is null or p_place < 1 or p_place > 4 then 0::numeric
    when p_category = 'team_sport' then
      case p_place when 1 then 1000 when 2 then 750 when 3 then 500 when 4 then 250 else 0 end
    when p_category = 'athletics_swimming_single' then
      case p_place when 1 then 250 when 2 then 200 when 3 then 150 when 4 then 100 else 0 end
    when p_category = 'athletics_swimming_relay' then
      case p_place when 1 then 500 when 2 then 400 when 3 then 300 when 4 then 200 else 0 end
    else 0
  end;
$$;

create or replace function public.speed_apply_jackpot(p_base numeric, p_place int, p_active boolean)
returns table(base_points numeric, jackpot_adjustment numeric, final_points numeric, note text)
language sql
immutable
as $$
  select
    case when p_active and (p_place is null or p_place > 4) then 0::numeric else p_base end,
    case
      when not coalesce(p_active, false) then 0::numeric
      when p_place = 1 then p_base
      when p_place between 2 and 4 then - (p_base / 2)
      else -500::numeric
    end,
    case
      when not coalesce(p_active, false) then p_base
      when p_place = 1 then p_base * 2
      when p_place between 2 and 4 then p_base / 2
      else -500::numeric
    end,
    case
      when not coalesce(p_active, false) then 'No jackpot'
      when p_place = 1 then 'Jackpot win — doubled'
      when p_place between 2 and 4 then 'Jackpot — halved'
      else 'Jackpot miss — 500 deducted'
    end;
$$;

-- Approve result and write ledger
create or replace function public.speed_approve_result(p_result_id uuid)
returns public.speed_results
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.speed_results;
  v_sport public.speed_sports;
  v_jackpot boolean := false;
  v_base numeric;
  v_calc record;
begin
  select * into v_result from public.speed_results where id = p_result_id for update;
  if not found then raise exception 'Result not found.'; end if;
  if v_result.approval_status = 'approved' then
    return v_result;
  end if;

  select * into v_sport from public.speed_sports where id = v_result.sport_id;

  select exists (
    select 1 from public.speed_jackpots j
     where j.team_id = v_result.team_id
       and j.sport_id = v_result.sport_id
       and j.approval_status = 'approved'
  ) into v_jackpot;

  if v_jackpot and v_sport.slug in ('athletics-relays', 'swimming-relays') then
    v_jackpot := false;
  end if;

  v_base := public.speed_base_points(v_result.event_category, v_result.place);
  select * into v_calc from public.speed_apply_jackpot(v_base, v_result.place, v_jackpot);

  delete from public.speed_points_ledger where result_id = v_result.id;

  insert into public.speed_points_ledger (
    team_id, result_id, sport_id, base_points, jackpot_adjustment, final_points, note
  ) values (
    v_result.team_id, v_result.id, v_result.sport_id,
    v_calc.base_points, v_calc.jackpot_adjustment, v_calc.final_points, v_calc.note
  );

  update public.speed_results
     set approval_status = 'approved', approved_at = now()
   where id = v_result.id
  returning * into v_result;

  return v_result;
end;
$$;
