import { notFound } from '@tanstack/react-router'

import { getSeasonsFn } from '#/data/seasons'
import {
  resolveLeagueBySlug,
  type LeagueDefinition,
} from '#/lib/leagues'
import { resolveSeasonBySlug } from '#/lib/tournament-slugs'
import type { Season } from '#/lib/types'

export type ScheduleSeasonContext = {
  league: LeagueDefinition
  seasons: Season[]
  season: Season
  competitionId: string
}

export async function loadScheduleSeasonContext(params: {
  leagueSlug: string
  seasonSlug: string
}): Promise<ScheduleSeasonContext> {
  const league = resolveLeagueBySlug(params.leagueSlug)
  if (!league) throw notFound()

  const seasons = await getSeasonsFn({
    data: { id: String(league.id) },
  })
  const season = resolveSeasonBySlug(seasons, params.seasonSlug)
  if (!season) throw notFound()

  return {
    league,
    seasons,
    season,
    competitionId: String(league.id),
  }
}
