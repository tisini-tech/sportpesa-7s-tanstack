import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import { getSeasonsFn, poolsQueryOptions } from '#/data/seasons'
import { resolveLeagueBySlug } from '#/lib/leagues'
import {
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug',
)({
  beforeLoad: async ({ params }) => {
    const league = resolveLeagueBySlug(params.leagueSlug)
    if (!league) throw notFound()

    const seasons = await getSeasonsFn({
      data: { id: String(league.id) },
    })

    const season = resolveSeasonBySlug(seasons, params.seasonSlug)
    const division = season
      ? resolveDivisionBySlug(season, params.legSlug)
      : undefined

    if (!season || !division) {
      throw notFound()
    }

    return {
      league,
      seasons,
      season,
      division,
      competitionId: String(league.id),
    }
  },
  loader: async ({ context }) => {
    // Prefetch on the same route that sets context in beforeLoad so child
    // routes don't race on undefined season/division during "/" redirects.
    await context.queryClient.prefetchQuery(
      poolsQueryOptions(
        context.competitionId,
        context.season.id.toString(),
        context.division.id.toString(),
      ),
    )
  },
  component: LegLayout,
})

function LegLayout() {
  return <Outlet />
}
