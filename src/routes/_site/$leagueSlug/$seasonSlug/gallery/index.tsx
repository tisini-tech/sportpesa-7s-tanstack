import { createFileRoute, redirect } from '@tanstack/react-router'

import { pickGalleryDivision } from '#/components/landing/division-utils'
import { getSeasonsFn } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
import {
  getLegSlug,
  getSeasonSlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

/** Old season-scoped gallery URLs → shared /gallery hub. */
export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/gallery/',
)({
  beforeLoad: async ({ params }) => {
    const seasons = await getSeasonsFn({
      data: { id: String(DEFAULT_LEAGUE.id) },
    })
    const season =
      resolveSeasonBySlug(seasons, params.seasonSlug) ?? seasons[0]
    const featured = season
      ? pickGalleryDivision(season.divisions)
      : null

    throw redirect({
      to: '/gallery',
      search: season
        ? {
            season: getSeasonSlug(season),
            leg: featured
              ? getLegSlug(featured.division)
              : undefined,
          }
        : undefined,
      replace: true,
    })
  },
})
