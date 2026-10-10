import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  CompetitionStanding,
  DivisionPool,
  Stage,
  StageStanding,
} from '#/lib/types'

export type CompetitionPoolSource = 'division' | 'stage'

export type CompetitionPoolsResult = {
  source: CompetitionPoolSource
  pools: DivisionPool[]
}

function poolLabel(name: string): string {
  const match = name.match(/(?:pool|poo|group)\s*([a-z])/i)
  if (match) return `Pool ${match[1].toUpperCase()}`
  return name
}

function stagesForPools(stages: Stage[]): Stage[] {
  const groups = stages.filter((stage) => stage.kind === 'group')
  const pools = groups.filter((stage) =>
    /^(pool|poo|group)\b/i.test(stage.name),
  )
  if (pools.length > 0) {
    return [...pools].sort((a, b) =>
      poolLabel(a.name).localeCompare(poolLabel(b.name)),
    )
  }

  const firstRound = groups
    .filter((stage) => /^round\b/i.test(stage.name))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )[0]

  return firstRound ? [{ ...firstRound, name: 'Group' }] : []
}

function stagePools(
  stages: Stage[],
  standings: StageStanding[],
): DivisionPool[] {
  return stagesForPools(stages).flatMap((stage) => {
    const table =
      standings.find((item) => item.id === stage.id) ??
      standings.find((item) => item.name === stage.name)
    if (!table || table.standings.length === 0) return []

    const rows = [...table.standings].sort(
      (a, b) => b.Pts - a.Pts || b.GD - a.GD,
    )

    return [
      {
        id: stage.id,
        name: stage.name === 'Group' ? 'Group' : poolLabel(stage.name),
        teams: rows.map((row) => ({
          team_id: row.id,
          team_name: row.team_name,
          team_logo: row.logo,
        })),
      },
    ]
  })
}

export const getCompetitionPoolsFn = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      competitionId: string
      seasonId: string
      divisionId?: string
      stages?: Stage[]
    }) => data,
  )
  .handler(async ({ data }): Promise<CompetitionPoolsResult> => {
    const divisionId = Number(data.divisionId)
    if (data.divisionId && Number.isFinite(divisionId) && divisionId > 0) {
      try {
        const pools = await apiService.get<DivisionPool[]>(
          `/competitions/${data.competitionId}/seasons/${data.seasonId}/pools?division_id=${data.divisionId}`,
        )
        return {
          source: 'division',
          pools: [...pools].sort((a, b) => a.name.localeCompare(b.name)),
        }
      } catch {
        return { source: 'division', pools: [] }
      }
    }

    try {
      const standings = await apiService.get<CompetitionStanding>(
        `/competitions/${data.competitionId}/seasons/${data.seasonId}/standings`,
      )
      return {
        source: 'stage',
        pools: stagePools(data.stages ?? [], standings.stages ?? []),
      }
    } catch {
      return { source: 'stage', pools: [] }
    }
  })

export const competitionPoolsQueryOptions = (data: {
  competitionId: string
  seasonId: string
  divisionId?: string
  stages?: Stage[]
}) =>
  queryOptions({
    queryKey: [
      'competition-pools',
      data.competitionId,
      data.seasonId,
      data.divisionId ?? 'stages',
      (data.stages ?? []).map((stage) => stage.id).join(','),
    ],
    queryFn: () => getCompetitionPoolsFn({ data }),
  })
