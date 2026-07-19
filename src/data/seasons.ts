import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type { DivisionPool, Season } from '#/lib/types'

export const getSeasonsFn = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const seasons = await apiService.get<Season[]>(
      `/competitions/${data.id}/seasons`,
    )
    return seasons
  })

export const getDivisionPoolsFn = createServerFn({ method: 'GET' })
  .validator((data: { seasonId: string; divisionId: string }) => data)
  .handler(async ({ data }) => {
    const divisionPools = await apiService.get<DivisionPool[]>(
      `/competitions/238/seasons/${data.seasonId}/pools?division_id=${data.divisionId}`,
    )
    return divisionPools
  })

export const poolsQueryOptions = (seasonId: string, divisionId: string) =>
  queryOptions({
    queryKey: ['divisionPools', seasonId, divisionId],
    queryFn: () =>
      getDivisionPoolsFn({
        data: {
          seasonId,
          divisionId,
        },
      }),
  })
