import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MegaJackpotBanner } from '#/components/landing/mega-jackpot-banner'
import { SiteHeader } from '#/components/site/header'
import SiteFooter from '#/components/site/footer'
import { getOptionalUserFn } from '#/data/auth'
import { getSeasonsFn } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'

export const Route = createFileRoute('/_site')({
  beforeLoad: async () => {
    const [seasons, user] = await Promise.all([
      getSeasonsFn({
        data: { id: String(DEFAULT_LEAGUE.id) },
      }),
      getOptionalUserFn(),
    ])

    return {
      defaultLeague: DEFAULT_LEAGUE,
      defaultSeasons: seasons,
      user,
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

      <MegaJackpotBanner />
      <SiteFooter />
    </main>
  )
}
