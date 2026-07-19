import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'

import { DivisionPools } from '#/components/landing/division-pools'
import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'
import { poolsQueryOptions } from '#/data/seasons'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'

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
  const { season, division } = legRoute.useRouteContext()
  const navigate = Route.useNavigate()

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
        divisions={season.divisions}
        activeDivisionId={division.id}
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
