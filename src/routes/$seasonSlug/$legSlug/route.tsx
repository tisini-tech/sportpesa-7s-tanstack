import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import {
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

export const Route = createFileRoute('/$seasonSlug/$legSlug')({
  beforeLoad: ({ context, params }) => {
    const season = resolveSeasonBySlug(context.seasons, params.seasonSlug)
    const division = season
      ? resolveDivisionBySlug(season, params.legSlug)
      : undefined

    if (!season || !division) {
      throw notFound()
    }

    return { season, division }
  },
  component: LegLayout,
})

function LegLayout() {
  return <Outlet />
}
