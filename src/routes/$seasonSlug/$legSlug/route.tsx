import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import {
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'
import { SiteHeader } from '#/components/site/header'
import SiteFooter from '#/components/site/footer'

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
  return (
    <main className="flex min-h-screen w-full flex-col">
      <SiteHeader />

      <div className="w-full min-w-0 flex-1">
        <Outlet />
      </div>

      <SiteFooter />
    </main>
  )
}
