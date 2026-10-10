import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { isSyntheticDivision } from '#/lib/leagues'
import {
  getLegSlug,
  resolveDivisionBySlug,
} from '#/lib/tournament-slugs'
import type { Division, Season } from '#/lib/types'
import { loadScheduleSeasonContext } from './schedule/load-context'

export { loadScheduleSeasonContext as loadStatsSeasonContext }

export function readLeg(search: Record<string, unknown>): string | undefined {
  return typeof search.leg === 'string' ? search.leg : undefined
}

export function activeStatsDivision(
  season: Season,
  leg?: string,
): { division?: Division; divisionId?: string; legSlug?: string } {
  const fromUrl = leg ? resolveDivisionBySlug(season, leg) : undefined
  const division =
    fromUrl ?? pickFeaturedDivision(season.divisions)?.division

  if (!division || isSyntheticDivision(division.id)) {
    return { division }
  }

  return {
    division,
    divisionId: String(division.id),
    legSlug: getLegSlug(division),
  }
}
