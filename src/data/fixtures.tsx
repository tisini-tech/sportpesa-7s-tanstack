import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type { Fixture } from '#/lib/types'

export const getFixturesFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: number; divisionId: number }) => data)
  .handler(async ({ data }) => {
    const fixtures: Fixture[] = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/fixtures?division_id=${data.divisionId}`,
    )
    return fixtures
  })
