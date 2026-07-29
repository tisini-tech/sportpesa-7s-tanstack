import { apiService } from '#/lib/api'
import type {
  PaginatedResponse,
  Team,
  TeamFixturesResponse,
  TeamStats,
  TopPlayerStats,
  TopTeamStats,
} from '#/lib/types'
import { createServerFn } from '@tanstack/react-start'

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
      data: CompetitionSeasonDivision & {
        eventId: string
        isPoints?: boolean
      },
    ) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiService.get<TopTeamStats[]>(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/events/${data.eventId}/top-teams?division_id=${data.divisionId}${data.isPoints ? '&is_points=true' : ''}`,
    )
    return response
  })

export const getTopPlayerStatsFn = createServerFn({ method: 'GET' })
  .validator(
    (
      data: CompetitionSeasonDivision & {
        eventId: string
        isPoints?: boolean
        page?: number
      },
    ) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      division_id: data.divisionId,
    })
    if (data.isPoints) params.set('is_points', 'true')
    if (data.page && data.page > 1) params.set('page', String(data.page))

    const response = await apiService.get<PaginatedResponse<TopPlayerStats>>(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/events/${data.eventId}/top-performers?${params}`,
    )
    return response
  })
