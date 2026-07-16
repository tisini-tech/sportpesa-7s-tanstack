import { apiService } from '#/lib/api'
import type {
  Team,
  TeamFixturesResponse,
  TeamStats,
  TopTeamStats,
} from '#/lib/types'
import { createServerFn } from '@tanstack/react-start'

export const getTeamsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; divisionId: string }) => data)
  .handler(async ({ data }) => {
    const teams: Team[] = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/teams?division_id=${data.divisionId}`,
    )
    return teams
  })

export const getTeamFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { seasonId: string; divisionId: string; teamId: string }) => data,
  )
  .handler(async ({ data }) => {
    const team: Team = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/teams/${data.teamId}`,
    )
    return team
  })

export const getTeamFixturesFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { seasonId: string; divisionId: string; teamId: string }) => data,
  )
  .handler(async ({ data }) => {
    const response: TeamFixturesResponse = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/teams/${data.teamId}/fixtures`,
    )
    return response
  })

export const getTeamStatsFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { seasonId: string; divisionId: string; teamId: string }) => data,
  )
  .handler(async ({ data }) => {
    const response: TeamStats = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/teams/${data.teamId}/stats`,
    )
    return response
  })

export const getTopTeamStatsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; eventId: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiService.get<TopTeamStats[]>(
      `/competitions/238/seasons/${data.seasonId}/events/${data.eventId}/top-teams`,
    )
    return response
  })
