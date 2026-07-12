import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Fixture,
  FixtureDetails,
  FixtureH2H,
  FixtureLineups,
} from '#/lib/types'

export const getFixturesFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; divisionId: string }) => data)
  .handler(async ({ data }) => {
    const fixtures: Fixture[] = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/fixtures?division_id=${data.divisionId}`,
    )
    return fixtures
  })

export const getFixtureDetailsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; fixtureId: string }) => data)
  .handler(async ({ data }) => {
    const fixture: FixtureDetails = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/fixtures/${data.fixtureId}/details`,
    )

    return fixture
  })

export const getFixtureLineupsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; fixtureId: string }) => data)
  .handler(async ({ data }) => {
    const lineups: FixtureLineups = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/fixtures/${data.fixtureId}/lineups`,
    )
    return lineups
  })

export const getFixtureH2HFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; fixtureId: string }) => data)
  .handler(async ({ data }) => {
    const h2h: FixtureH2H = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/fixtures/${data.fixtureId}/match-context`,
    )
    return h2h
  })
