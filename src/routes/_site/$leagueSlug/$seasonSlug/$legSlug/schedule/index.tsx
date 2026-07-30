import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { getFixturesFn } from '#/data/fixtures'
import { getGroupStandingsFn } from '#/data/standings'
import { ScheduleHeader } from '#/components/schedule/schedule-header'
import { LegScheduleSection } from '#/components/schedule/leg-schedule-section'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'
import type { Fixture, StageStanding } from '#/lib/types'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/schedule/',
)({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const competitionId = context.competitionId
    const divisions = [...context.season.divisions]

    const legs = await Promise.all(
      divisions.map(async (division) => {
        const divisionId = division.id.toString()
        const [fixtures, standings] = await Promise.all([
          getFixturesFn({
            data: { competitionId, seasonId, divisionId },
          }).catch(() => [] as Fixture[]),
          getGroupStandingsFn({
            data: { competitionId, seasonId, divisionId },
          }).catch(() => [] as StageStanding[]),
        ])

        return { division, fixtures, standings }
      }),
    )

    return { legs }
  },
  component: ScheduleLayout,
})

function ScheduleLayout() {
  const { seasons, season } = legRoute.useRouteContext()
  const { legs } = Route.useLoaderData()
  const { leagueSlug } = Route.useParams()
  const navigate = Route.useNavigate()

  const { handleLeagueChange, handleSeasonChange } = useTournamentNavigation({
    leagueSlug,
    seasons,
    season,
    onNavigate: (params) => {
      navigate({
        to: '/$leagueSlug/$seasonSlug/$legSlug/schedule',
        params,
      })
    },
  })

  return (
    <div>
      <ScheduleHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        seasonId={season.id}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
      />

      {legs.length === 0 ? (
        <section className="sp-content-shell py-8">
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No legs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule sections will appear once legs are published for this
              season.
            </p>
          </div>
        </section>
      ) : (
        legs.map((leg, index) => (
          <LegScheduleSection
            key={leg.division.id}
            leg={leg}
            legNumber={index + 1}
          />
        ))
      )}
    </div>
  )
}
