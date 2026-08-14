import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Fixture,
  FixtureDetails,
  FixtureH2H,
  FixtureLineups,
} from '#/lib/types'

export const getFixturesFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; divisionId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const fixtures: Fixture[] = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/fixtures?division_id=${data.divisionId}`,
    )
    return fixtures
  })

export const fixturesQueryOptions = (
  competitionId: string,
  seasonId: string,
  divisionId: string,
) =>
  queryOptions({
    queryKey: ['fixtures', competitionId, seasonId, divisionId],
    queryFn: () =>
      getFixturesFn({
        data: { competitionId, seasonId, divisionId },
      }),
  })

export const getFixtureDetailsFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; fixtureId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const fixture: FixtureDetails = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/fixtures/${data.fixtureId}/details`,
    )

    return fixture
  })

export const getFixtureLineupsFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; fixtureId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const lineups: FixtureLineups = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/fixtures/${data.fixtureId}/lineups`,
    )
    return lineups
  })

export const getFixtureH2HFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; fixtureId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const h2h: FixtureH2H = await apiService.get(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/fixtures/${data.fixtureId}/match-context`,
    )
    return h2h
  })
