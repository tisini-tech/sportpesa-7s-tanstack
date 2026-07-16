import { apiService } from '#/lib/api'
import type { CompetitionStanding } from '#/lib/types'
import { createServerFn } from '@tanstack/react-start'

export const getGroupStandingsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; divisionId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const standings: CompetitionStanding = await apiService.get(
        `/competitions/238/seasons/${data.seasonId}/standings?division_id=${data.divisionId}`,
      )

      return standings?.stages ?? []
    } catch {
      return []
    }
  })

export const getDivisionStandingsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; divisionId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const standings: CompetitionStanding = await apiService.get(
        `/competitions/238/seasons/${data.seasonId}/standings?division_id=${data.divisionId}&leg=True`,
      )

      return standings
    } catch {
      return {
        competition: 0,
        season: Number(data.seasonId),
        division: Number(data.divisionId),
        type: 'division',
        matches_played: 0,
        standings: [],
        stages: [],
        division_standings: [],
        overall_standings: [],
      } satisfies CompetitionStanding
    }
  })

export const getOverallStandingsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const standings: CompetitionStanding = await apiService.get(
        `/competitions/238/seasons/${data.seasonId}/standings?overall=True`,
      )

      return standings
    } catch {
      return {
        competition: 0,
        season: Number(data.seasonId),
        division: 0,
        type: 'overall',
        matches_played: 0,
        standings: [],
        stages: [],
        division_standings: [],
        overall_standings: [],
      } satisfies CompetitionStanding
    }
  })
