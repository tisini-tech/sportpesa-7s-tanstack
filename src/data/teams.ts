import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import { getLeagueStatsEvents } from '#/lib/league-stats'
import type {
  PaginatedResponse,
  Team,
  TeamFixturesResponse,
  TeamStats,
  TopPlayerStats,
  TopTeamStats,
} from '#/lib/types'

type CompetitionSeason = {
  competitionId: string
  seasonId: string
}

type CompetitionSeasonDivision = CompetitionSeason & {
  divisionId: string
}

export const getTeamsFn = createServerFn({ method: 'GET' })
  .validator((data: CompetitionSeasonDivision) => data)
  .handler(async ({ data }) => {
    const teams: Team[] = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/teams?division_id=${data.divisionId}`,
    )
    return teams
  })

export const getTeamFn = createServerFn({ method: 'GET' })
  .validator((data: CompetitionSeasonDivision & { teamId: string }) => data)
  .handler(async ({ data }) => {
    const team: Team = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/teams/${data.teamId}`,
    )
    return team
  })

export const getTeamFixturesFn = createServerFn({ method: 'GET' })
  .validator((data: CompetitionSeasonDivision & { teamId: string }) => data)
  .handler(async ({ data }) => {
    const response: TeamFixturesResponse = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/teams/${data.teamId}/fixtures`,
    )
    return response
  })

export const getTeamStatsFn = createServerFn({ method: 'GET' })
  .validator((data: CompetitionSeasonDivision & { teamId: string }) => data)
  .handler(async ({ data }) => {
    const response: TeamStats = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/teams/${data.teamId}/stats`,
    )
    return response
  })

export const getTopTeamStatsFn = createServerFn({ method: 'GET' })
  .validator(
    (
      data: CompetitionSeason & {
        eventId: string
        divisionId?: string
        isPoints?: boolean
      },
    ) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.divisionId) params.set('division_id', data.divisionId)
    if (data.isPoints) params.set('is_points', 'true')
    const query = params.toString()

    const response = await apiService.get<TopTeamStats[]>(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/events/${data.eventId}/top-teams${query ? `?${query}` : ''}`,
    )
    return response
  })

export const getTopPlayerStatsFn = createServerFn({ method: 'GET' })
  .validator(
    (
      data: CompetitionSeason & {
        eventId: string
        divisionId?: string
        isPoints?: boolean
        page?: number
      },
    ) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.divisionId) params.set('division_id', data.divisionId)
    if (data.isPoints) params.set('is_points', 'true')
    if (data.page && data.page > 1) params.set('page', String(data.page))
    const query = params.toString()

    const response = await apiService.get<PaginatedResponse<TopPlayerStats>>(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/events/${data.eventId}/top-performers${query ? `?${query}` : ''}`,
    )
    return response
  })

export type LeagueStatsGlimpse = {
  events: ReturnType<typeof getLeagueStatsEvents>
  topTeamTries: TopTeamStats[]
  topTeamPoints: TopTeamStats[]
  topTeamVisits: TopTeamStats[]
  topPlayerTries: TopPlayerStats[]
  topPlayerPoints: TopPlayerStats[]
  topPlayersCarries: TopPlayerStats[]
}

async function fetchLeagueStatsGlimpse(data: {
  competitionId: string
  seasonId: string
  seasonSlug: string
}): Promise<LeagueStatsGlimpse> {
  const events = getLeagueStatsEvents(data.seasonSlug)
  const base = {
    competitionId: data.competitionId,
    seasonId: data.seasonId,
  }

  const [
    topTeamTries,
    topTeamVisits,
    topTeamPoints,
    topPlayerTries,
    topPlayerPoints,
    topPlayersCarries,
  ] = await Promise.all([
    getTopTeamStatsFn({
      data: { ...base, eventId: events.score },
    }),
    getTopTeamStatsFn({
      data: { ...base, eventId: events.visits },
    }),
    getTopTeamStatsFn({
      data: { ...base, eventId: events.score, isPoints: true },
    }),
    getTopPlayerStatsFn({
      data: { ...base, eventId: events.score },
    }),
    getTopPlayerStatsFn({
      data: { ...base, eventId: events.score, isPoints: true },
    }),
    getTopPlayerStatsFn({
      data: { ...base, eventId: events.carries },
    }),
  ])

  return {
    events,
    topTeamTries,
    topTeamPoints,
    topTeamVisits,
    topPlayerTries: topPlayerTries.items,
    topPlayerPoints: topPlayerPoints.items,
    topPlayersCarries: topPlayersCarries.items,
  }
}

export const leagueStatsGlimpseQueryOptions = (
  competitionId: string,
  seasonId: string,
  seasonSlug: string,
) =>
  queryOptions({
    queryKey: ['league-stats-glimpse', competitionId, seasonId, seasonSlug],
    queryFn: () =>
      fetchLeagueStatsGlimpse({
        competitionId,
        seasonId,
        seasonSlug,
      }),
  })
