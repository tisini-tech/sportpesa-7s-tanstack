import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSeasonsFn } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
import { getFeaturedTournamentParams } from '#/lib/tournament-slugs'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const seasons = await getSeasonsFn({
      data: { id: String(DEFAULT_LEAGUE.id) },
    })
    const featured = getFeaturedTournamentParams(seasons, DEFAULT_LEAGUE.slug)

    if (!featured) return

    throw redirect({
      to: '/$leagueSlug/$seasonSlug/$legSlug',
      params: featured,
      replace: true,
    })
  },
})
