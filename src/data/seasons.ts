import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type { DivisionPool, Season, SeasonImage } from '#/lib/types'

export const getSeasonsFn = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const seasons = await apiService.get<Season[]>(
      `/competitions/${data.id}/seasons`,
    )
    return seasons
  })

export const getDivisionPoolsFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; divisionId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const divisionPools = await apiService.get<DivisionPool[]>(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/pools?division_id=${data.divisionId}`,
    )
    return divisionPools
  })

export const poolsQueryOptions = (
  competitionId: string,
  seasonId: string,
  divisionId: string,
) =>
  queryOptions({
    queryKey: ['divisionPools', competitionId, seasonId, divisionId],
    queryFn: () =>
      getDivisionPoolsFn({
        data: {
          competitionId,
          seasonId,
          divisionId,
        },
      }),
  })

export const getSeasonImagesFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { competitionId: string; seasonId: string; divisionId: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    try {
      const seasonImages = await apiService.get<SeasonImage[]>(
        `/competitions/${data.competitionId}/seasons/${data.seasonId}/images?division_id=${data.divisionId}`,
      )
      return seasonImages
    } catch {
      return []
    }
  })

export const seasonImagesQueryOptions = (
  competitionId: string,
  seasonId: string,
  divisionId: string,
) =>
  queryOptions({
    queryKey: ['seasonImages', competitionId, seasonId, divisionId],
    queryFn: () =>
      getSeasonImagesFn({
        data: { competitionId, seasonId, divisionId },
      }),
  })
