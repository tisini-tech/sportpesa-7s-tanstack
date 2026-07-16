import { apiService } from '#/lib/api'
import { createServerFn } from '@tanstack/react-start'
import type { TeamPlayer } from '#/lib/types'

export const getPlayersFn = createServerFn({ method: 'GET' })
  .validator(
    (data: { seasonId: string; divisionId: string; teamId: string }) => data,
  )
  .handler(async ({ data }) => {
    const players: TeamPlayer[] = await apiService.get(
      `/competitions/238/seasons/${data.seasonId}/teams/${data.teamId}/players`,
    )
    return players
  })
