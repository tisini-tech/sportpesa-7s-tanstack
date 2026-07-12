import { apiService } from '#/lib/api'
import { createServerFn } from '@tanstack/react-start'
import type { Season } from '#/lib/types'

export const getSeasonsFn = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const seasons = await apiService.get<Season[]>(
      `/competitions/${data.id}/seasons`,
    )
    return seasons
  })
