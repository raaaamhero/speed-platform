import type { Client } from 'pg'
import {
  ALL_COMPETITION_SEEDS,
  ACTIVE_COMPETITIONS,
  generationKey,
  roundRobinPairs,
  validateCompetitionDraw,
  type GroupCode,
} from './draws'

export type GenerateReport = {
  validationErrors: string[]
  competitionsUpserted: number
  groupsUpserted: number
  groupTeamsUpserted: number
  groupFixtures: number
  knockoutShells: number
  skippedExisting: number
}

export async function seedAndGenerateFixtures(client: Client): Promise<GenerateReport> {
  const validationErrors: string[] = []
  for (const c of ACTIVE_COMPETITIONS) {
    validationErrors.push(...validateCompetitionDraw(c))
  }
  if (validationErrors.length) {
    return {
      validationErrors,
      competitionsUpserted: 0,
      groupsUpserted: 0,
      groupTeamsUpserted: 0,
      groupFixtures: 0,
      knockoutShells: 0,
      skippedExisting: 0,
    }
  }

  const teams = await client.query<{ id: string; code: string; name: string }>(
    `select id, code, name from public.speed_teams`,
  )
  const teamByName = new Map(teams.rows.map((t) => [t.name, t]))
  const sports = await client.query<{ id: string; slug: string }>(
    `select id, slug from public.speed_sports`,
  )
  const sportBySlug = new Map(sports.rows.map((s) => [s.slug, s.id]))

  let competitionsUpserted = 0
  let groupsUpserted = 0
  let groupTeamsUpserted = 0
  let groupFixtures = 0
  let knockoutShells = 0
  let skippedExisting = 0

  for (const seed of ALL_COMPETITION_SEEDS) {
    const sportId = sportBySlug.get(seed.sportSlug)
    if (!sportId) {
      validationErrors.push(`Missing sport slug ${seed.sportSlug}`)
      continue
    }

    const pointsWin = seed.formatStatus === 'active' ? 3 : null
    const pointsDraw = seed.formatStatus === 'active' ? 1 : null
    const pointsLoss = seed.formatStatus === 'active' ? 0 : null

    const comp = await client.query<{ id: string }>(
      `
      insert into public.speed_competitions
        (slug, sport_id, name, category, format_status, points_win, points_draw, points_loss, points_provisional)
      values ($1,$2,$3,$4,$5,$6,$7,$8, true)
      on conflict (slug) do update set
        sport_id = excluded.sport_id,
        name = excluded.name,
        category = excluded.category,
        format_status = excluded.format_status,
        points_win = coalesce(public.speed_competitions.points_win, excluded.points_win),
        points_draw = coalesce(public.speed_competitions.points_draw, excluded.points_draw),
        points_loss = coalesce(public.speed_competitions.points_loss, excluded.points_loss),
        updated_at = now()
      returning id
      `,
      [
        seed.slug,
        sportId,
        seed.name,
        seed.category,
        seed.formatStatus,
        pointsWin,
        pointsDraw,
        pointsLoss,
      ],
    )
    const competitionId = comp.rows[0].id
    competitionsUpserted += 1

    if (seed.formatStatus !== 'active') continue

    const groupIds = new Map<GroupCode, string>()
    for (const code of ['A', 'B', 'C', 'D'] as GroupCode[]) {
      const g = await client.query<{ id: string }>(
        `
        insert into public.speed_competition_groups (competition_id, code)
        values ($1,$2)
        on conflict (competition_id, code) do update set code = excluded.code
        returning id
        `,
        [competitionId, code],
      )
      groupIds.set(code, g.rows[0].id)
      groupsUpserted += 1

      const names = seed.groups[code]
      for (let i = 0; i < names.length; i++) {
        const team = teamByName.get(names[i])
        if (!team) {
          validationErrors.push(`${seed.slug} Group ${code}: unknown team "${names[i]}"`)
          continue
        }
        await client.query(
          `
          insert into public.speed_group_teams (competition_id, group_id, team_id, seed_order)
          values ($1,$2,$3,$4)
          on conflict (competition_id, team_id) do update set
            group_id = excluded.group_id,
            seed_order = excluded.seed_order
          `,
          [competitionId, g.rows[0].id, team.id, i],
        )
        groupTeamsUpserted += 1
      }
    }

    // SF rules
    for (let i = 0; i < 2; i++) {
      const [home, away] = seed.semiFinals[i]
      await client.query(
        `
        insert into public.speed_competition_sf_rules (competition_id, sf_index, home_group, away_group)
        values ($1,$2,$3,$4)
        on conflict (competition_id, sf_index) do update set
          home_group = excluded.home_group,
          away_group = excluded.away_group
        `,
        [competitionId, i + 1, home, away],
      )
    }

    // Group-stage RR fixtures
    for (const code of ['A', 'B', 'C', 'D'] as GroupCode[]) {
      const groupId = groupIds.get(code)!
      const members = await client.query<{ team_id: string; code: string }>(
        `
        select gt.team_id, t.code
        from public.speed_group_teams gt
        join public.speed_teams t on t.id = gt.team_id
        where gt.group_id = $1
        order by gt.seed_order
        `,
        [groupId],
      )
      if (members.rows.length !== 3) continue
      const codes = members.rows.map((m) => m.code) as [string, string, string]
      const idByCode = new Map(members.rows.map((m) => [m.code, m.team_id]))

      for (const [ca, cb] of roundRobinPairs(codes)) {
        const key = generationKey(seed.slug, 'group_stage', code, ca, cb)
        const ins = await client.query(
          `
          insert into public.speed_fixtures
            (sport_id, team_a_id, team_b_id, title, status, published,
             competition_id, group_id, stage, generation_key)
          values ($1,$2,$3,$4,'scheduled', false, $5,$6,'group_stage',$7)
          on conflict (generation_key) do nothing
          returning id
          `,
          [
            sportId,
            idByCode.get(ca),
            idByCode.get(cb),
            `${seed.name} · Group ${code}`,
            competitionId,
            groupId,
            key,
          ],
        )
        if (ins.rows[0]) groupFixtures += 1
        else skippedExisting += 1
      }
    }

    // Knockout shells (teams null until qualification)
    for (const slot of ['SF1', 'SF2'] as const) {
      const key = `${seed.slug}|semi_final|${slot}|TBD|TBD`
      const ins = await client.query(
        `
        insert into public.speed_fixtures
          (sport_id, team_a_id, team_b_id, title, status, published,
           competition_id, stage, bracket_slot, generation_key)
        values ($1,null,null,$2,'scheduled', false, $3,'semi_final',$4,$5)
        on conflict (generation_key) do nothing
        returning id
        `,
        [sportId, `${seed.name} · ${slot}`, competitionId, slot, key],
      )
      if (ins.rows[0]) knockoutShells += 1
      else skippedExisting += 1
    }

    {
      const key = `${seed.slug}|final|F|TBD|TBD`
      const ins = await client.query(
        `
        insert into public.speed_fixtures
          (sport_id, team_a_id, team_b_id, title, status, published,
           competition_id, stage, bracket_slot, generation_key)
        values ($1,null,null,$2,'scheduled', false, $3,'final','F',$4)
        on conflict (generation_key) do nothing
        returning id
        `,
        [sportId, `${seed.name} · Final`, competitionId, key],
      )
      if (ins.rows[0]) knockoutShells += 1
      else skippedExisting += 1
    }
  }

  await client.query(
    `insert into public.speed_audit_logs (action, entity_type, after_data, reason)
     values ('tournament_generate', 'tournament', $1::jsonb, 'Seed draws + RR + KO shells')`,
    [
      JSON.stringify({
        competitionsUpserted,
        groupsUpserted,
        groupTeamsUpserted,
        groupFixtures,
        knockoutShells,
        skippedExisting,
      }),
    ],
  )

  return {
    validationErrors,
    competitionsUpserted,
    groupsUpserted,
    groupTeamsUpserted,
    groupFixtures,
    knockoutShells,
    skippedExisting,
  }
}
