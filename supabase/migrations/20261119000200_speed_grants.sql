-- Grants required for anon/authenticated to use RLS policies on SPEED tables.

grant usage on schema public to anon, authenticated;

grant select on public.speed_sections to anon, authenticated;
grant select on public.speed_teams to anon, authenticated;
grant select on public.speed_team_sections to anon, authenticated;
grant select on public.speed_sports to anon, authenticated;
grant select on public.speed_settings to anon, authenticated;
grant select on public.speed_rule_versions to anon, authenticated;
grant select on public.speed_fixtures to anon, authenticated;
grant select on public.speed_results to anon, authenticated;
grant select on public.speed_points_ledger to anon, authenticated;
grant select on public.speed_announcements to anon, authenticated;
grant select on public.speed_team_standings to anon, authenticated;

-- Student/registration data: still gated by RLS (self or operator)
grant select on public.speed_students to authenticated;
grant select on public.speed_registrations to authenticated;
grant select on public.speed_registration_sports to authenticated;
grant select on public.speed_player_ids to authenticated;
grant select on public.speed_operators to authenticated;
grant select on public.speed_audit_logs to authenticated;
grant select on public.speed_jackpots to authenticated;

grant execute on function public.speed_is_operator() to anon, authenticated;
grant execute on function public.speed_counted_sport_count(uuid) to anon, authenticated;
grant execute on function public.speed_next_player_code() to authenticated;
