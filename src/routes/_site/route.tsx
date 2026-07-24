import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SiteHeader } from '#/components/site/header'
import SiteFooter from '#/components/site/footer'
import { getSeasonsFn } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'

export const Route = createFileRoute('/_site')({
  beforeLoad: async () => {
    const seasons = await getSeasonsFn({
      data: { id: String(DEFAULT_LEAGUE.id) },
    })

    return {
      defaultLeague: DEFAULT_LEAGUE,
      defaultSeasons: seasons,
    }
  },
  component: SiteLayout,
})

function SiteLayout() {
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
