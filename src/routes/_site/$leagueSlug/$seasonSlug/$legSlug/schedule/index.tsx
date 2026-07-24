import { getFixturesFn } from '#/data/fixtures'
import { getGroupStandingsFn } from '#/data/standings'
import { GroupStageTab } from '#/components/schedule/groups'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ScheduleHeader } from '#/components/schedule/schedule-header'
import {
  parseScheduleStage,
  type ScheduleStage,
} from '#/components/schedule/schedule-stages'
import { QuartersTab } from '#/components/schedule/quarters'
import { SemisTab } from '#/components/schedule/semis'
import { FinalsTab } from '#/components/schedule/finals'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

type ScheduleSearch = {
  stage?: ScheduleStage
}

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/$legSlug/schedule/')({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => ({
    stage: parseScheduleStage(search.stage),
  }),
  loaderDeps: ({ search }) => ({
    stage: search.stage,
  }),
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const competitionId = context.competitionId

    const [fixtures, standings] = await Promise.all([
      getFixturesFn({
        data: { competitionId, seasonId, divisionId },
      }),
      getGroupStandingsFn({
        data: { competitionId, seasonId, divisionId },
      }).catch(() => [] as Awaited<ReturnType<typeof getGroupStandingsFn>>),
    ])

    return { fixtures, standings }
  },
  component: ScheduleLayout,
})

function ScheduleLayout() {
  const { seasons, season, division } = legRoute.useRouteContext()
  const { stage } = Route.useSearch()
  const { fixtures, standings } = Route.useLoaderData()
  const { leagueSlug } = Route.useParams()

  const navigate = Route.useNavigate()
  const activeStage = stage ?? 'groups'

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: (params) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/$legSlug/schedule',
          params,
          search: { stage: 'groups' },
        })
      },
    })

  const handleStageChange = (nextStage: ScheduleStage) => {
    navigate({
      search: { stage: nextStage },
    })
  }

  return (
    <div>
      <ScheduleHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
        activeStage={activeStage}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        onStageChange={handleStageChange}
      />

      <section className="sp-content-shell py-8">
        {activeStage === 'groups' ? (
          <GroupStageTab fixtures={fixtures} standings={standings} />
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
