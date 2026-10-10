import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSeasonsFn } from '#/data/seasons'
import {
  DEFAULT_LEAGUE,
  isSyntheticDivision,
  materializeSeasons,
} from '#/lib/leagues'
import {
  getFeaturedTournamentParams,
  getLegSlug,
} from '#/lib/tournament-slugs'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const seasons = materializeSeasons(
      await getSeasonsFn({
        data: { id: String(DEFAULT_LEAGUE.id) },
      }),
      DEFAULT_LEAGUE,
    )
    const featured = getFeaturedTournamentParams(seasons, DEFAULT_LEAGUE.slug)

    if (!featured) return

    const division = seasons[0]?.divisions.find(
      (item) => getLegSlug(item) === featured.legSlug,
    )

    throw redirect({
      to: '/$leagueSlug/$seasonSlug',
      params: {
        leagueSlug: featured.leagueSlug,
        seasonSlug: featured.seasonSlug,
      },
      search: {
        leg:
          division && !isSyntheticDivision(division.id)
            ? featured.legSlug
            : undefined,
      },
      replace: true,
    })
  },
})
