import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'

import { DivisionPools } from '#/components/landing/division-pools'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'
import { poolsQueryOptions } from '#/data/seasons'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'

const rootRoute = getRouteApi('__root__')
const legRoute = getRouteApi('/$seasonSlug/$legSlug')

export const Route = createFileRoute('/$seasonSlug/$legSlug/')({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      poolsQueryOptions(
        context.season.id.toString(),
        context.division.id.toString(),
      ),
    )
  },
  component: Home,
})

function Home() {
  const { seasons } = rootRoute.useRouteContext()
  const { season, division } = legRoute.useRouteContext()
  const navigate = Route.useNavigate()

  const setActiveSeason = (seasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === seasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    navigate({
      to: '/$seasonSlug/$legSlug',
      params: {
        seasonSlug: getSeasonSlug(nextSeason),
        legSlug: getLegSlug(featured.division),
      },
    })
  }

  const setActiveDivision = (divisionId: number) => {
    const nextDivision = season.divisions.find((item) => item.id === divisionId)
    if (!nextDivision) return

    navigate({
      to: '/$seasonSlug/$legSlug',
      params: {
        seasonSlug: getSeasonSlug(season),
        legSlug: getLegSlug(nextDivision),
      },
    })
  }

  return (
    <div>
      <HeroSection
        divisions={season.divisions}
        season={season}
        seasonName={season.name}
        activeDivisionId={division.id}
      />

      <LegStrip
        seasons={seasons}
        season={season}
        divisions={season.divisions}
        activeDivisionId={division.id}
        onSelectSeason={setActiveSeason}
        onSelectDivision={setActiveDivision}
      />

      <Suspense
        fallback={
          <section className="sp-content-shell py-8">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">Loading pools…</p>
            </div>
          </section>
        }
      >
        <DivisionPools
          seasonId={season.id.toString()}
          divisionId={division.id.toString()}
        />
      </Suspense>
    </div>
  )
}
