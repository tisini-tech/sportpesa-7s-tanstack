import { getFixturesFn } from '#/data/fixtures'
import { GroupStageTab } from '#/components/schedule/groups'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ScheduleHeader } from '#/components/schedule/schedule-header'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import {
  parseScheduleStage,
  type ScheduleStage,
} from '#/components/schedule/schedule-stages'
import { QuartersTab } from '#/components/schedule/quarters'
import { SemisTab } from '#/components/schedule/semis'
import { FinalsTab } from '#/components/schedule/finals'

const rootRoute = getRouteApi('__root__')
const legRoute = getRouteApi('/$seasonSlug/$legSlug')

type ScheduleSearch = {
  stage?: ScheduleStage
}

export const Route = createFileRoute('/$seasonSlug/$legSlug/schedule/')({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => ({
    stage: parseScheduleStage(search.stage),
  }),
  loaderDeps: ({ search }) => ({
    stage: search.stage,
  }),
  loader: async ({ context }) => {
    const fixtures = await getFixturesFn({
      data: {
        seasonId: context.season.id,
        divisionId: context.division.id,
      },
    })

    return { fixtures }
  },
  component: ScheduleLayout,
})

function ScheduleLayout() {
  const { seasons } = rootRoute.useRouteContext()
  const { season, division } = legRoute.useRouteContext()
  const { stage } = Route.useSearch()
  const { fixtures } = Route.useLoaderData()

  const navigate = Route.useNavigate()
  const activeStage = stage ?? 'groups'

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    navigate({
      to: '/$seasonSlug/$legSlug/schedule',
      params: {
        seasonSlug: getSeasonSlug(nextSeason),
        legSlug: getLegSlug(featured.division),
      },
      search: { stage: 'groups' },
    })
  }

  const handleDivisionChange = (nextDivisionId: number) => {
    const nextDivision = season.divisions.find(
      (item) => item.id === nextDivisionId,
    )
    if (!nextDivision) return

    navigate({
      to: '/$seasonSlug/$legSlug/schedule',
      params: {
        seasonSlug: getSeasonSlug(season),
        legSlug: getLegSlug(nextDivision),
      },
      search: { stage: 'groups' },
    })
  }

  const handleStageChange = (nextStage: ScheduleStage) => {
    navigate({
      search: { stage: nextStage },
    })
  }

  return (
    <div>
      <ScheduleHeader
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
        activeStage={activeStage}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        onStageChange={handleStageChange}
      />

      <section className="sp-content-shell py-8">
        {activeStage === 'groups' ? (
          <GroupStageTab fixtures={fixtures} />
        ) : activeStage === 'quarters' ? (
          <QuartersTab fixtures={fixtures} />
        ) : activeStage === 'semi-finals' ? (
          <SemisTab fixtures={fixtures} />
        ) : activeStage === 'finals' ? (
          <FinalsTab fixtures={fixtures} />
        ) : (
          <div>Other stage</div>
        )}
      </section>
    </div>
  )
}
