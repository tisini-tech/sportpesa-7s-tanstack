import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { getSeasonsFn } from '#/data/seasons'
import { resolveLeagueBySlug } from '#/lib/leagues'
import {
  getFeaturedTournamentParams,
  getLegSlug,
  getSeasonSlug,
} from '#/lib/tournament-slugs'
import type { Season } from '#/lib/types'

export type TournamentDestination = {
  leagueSlug: string
  seasonSlug: string
  legSlug: string
}

/**
 * Shared competition / season / leg change handlers for tournament headers.
 * Call `onNavigate` with the resolved slugs for the next destination.
 */
export function useTournamentNavigation({
  leagueSlug,
  seasons,
  season,
  onNavigate,
}: {
  leagueSlug: string
  seasons: Season[]
  season: Season
  onNavigate: (destination: TournamentDestination) => void
}) {
  const handleLeagueChange = async (nextLeagueSlug: string) => {
    if (nextLeagueSlug === leagueSlug) return

    const league = resolveLeagueBySlug(nextLeagueSlug)
    if (!league) return

    const nextSeasons = await getSeasonsFn({
      data: { id: String(league.id) },
    })
    const featured = getFeaturedTournamentParams(nextSeasons, league.slug)
    if (!featured) return

    onNavigate(featured)
  }

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    onNavigate({
      leagueSlug,
      seasonSlug: getSeasonSlug(nextSeason),
      legSlug: getLegSlug(featured.division),
    })
  }

  const handleDivisionChange = (nextDivisionId: number) => {
    const nextDivision = season.divisions.find(
      (item) => item.id === nextDivisionId,
    )
    if (!nextDivision) return

    onNavigate({
      leagueSlug,
      seasonSlug: getSeasonSlug(season),
      legSlug: getLegSlug(nextDivision),
    })
  }

  return { handleLeagueChange, handleSeasonChange, handleDivisionChange }
}
