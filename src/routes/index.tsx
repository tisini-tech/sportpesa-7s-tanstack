import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { seasons } = rootRoute.useRouteContext()
  const { season: seasonId, division: divisionId } = rootRoute.useSearch()
  const navigate = Route.useNavigate()

  const season = seasons.find((item) => item.id === seasonId)

  if (!season) {
    return null
  }

  const setActiveDivisionId = (id: number) => {
    navigate({
      search: (prev) => ({ ...prev, division: id }),
      replace: true,
    })
  }

  return (
    <div>
      <HeroSection
        divisions={season.divisions}
        seasonId={season.id}
        seasonName={season.name}
        activeDivisionId={divisionId ?? null}
      />

      <LegStrip
        divisions={season.divisions}
        activeDivisionId={divisionId ?? null}
        onSelectDivision={setActiveDivisionId}
      />
    </div>
  )
}
