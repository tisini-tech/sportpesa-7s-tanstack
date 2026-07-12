import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'

const legRoute = getRouteApi('/$seasonSlug/$legSlug')

export const Route = createFileRoute('/$seasonSlug/$legSlug/')({
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
    </div>
  )
}
