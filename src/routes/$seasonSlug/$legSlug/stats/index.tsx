import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { LeagueStatsHeader } from '#/components/stats/league-stats-header'
import { LeagueTeamStats } from '#/components/stats/league-team-stats'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { Loading } from '#/components/error/loading'
import { getTeamsFn, getTopTeamStatsFn } from '#/data/teams'
import { LEAGUE_TEAM_EVENTS } from '#/lib/league-stats'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'
import type { TopTeamStats } from '#/lib/types'

const rootRoute = getRouteApi('__root__')
const legRoute = getRouteApi('/$seasonSlug/$legSlug')

export const Route = createFileRoute('/$seasonSlug/$legSlug/stats/')({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()

    const [divisionTeams, ...topTeamStats] = await Promise.all([
      getTeamsFn({ data: { seasonId, divisionId } }),
      ...LEAGUE_TEAM_EVENTS.map((event) =>
        getTopTeamStatsFn({
          data: { seasonId, eventId: event.eventId.toString() },
        }),
      ),
    ])

    const divisionTeamIds = new Set(divisionTeams.map((team) => team.team_id))

    const leaderboards = LEAGUE_TEAM_EVENTS.map((event, index) => ({
      eventId: event.eventId,
      label: event.label,
      teams: filterTeamsForDivision(topTeamStats[index], divisionTeamIds),
    }))

    return { leaderboards }
  },
  component: StatsPage,
  pendingComponent: Loading,
})

function filterTeamsForDivision(
  teams: TopTeamStats[],
  divisionTeamIds: Set<number>,
): TopTeamStats[] {
  return teams
    .filter((team) => divisionTeamIds.has(team.team_id))
    .sort((a, b) => b.total - a.total)
}

function StatsPage() {
  const { seasons } = rootRoute.useRouteContext()
  const { season, division } = legRoute.useRouteContext()
  const { leaderboards } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    navigate({
      to: '/$seasonSlug/$legSlug/stats',
      params: {
        seasonSlug: getSeasonSlug(nextSeason),
        legSlug: getLegSlug(featured.division),
      },
    })
  }

  const handleDivisionChange = (nextDivisionId: number) => {
    const nextDivision = season.divisions.find(
      (item) => item.id === nextDivisionId,
    )
    if (!nextDivision) return

    navigate({
      to: '/$seasonSlug/$legSlug/stats',
      params: {
        seasonSlug: getSeasonSlug(season),
        legSlug: getLegSlug(nextDivision),
      },
    })
  }

  return (
    <div>
      <LeagueStatsHeader
        seasons={seasons}
        season={season}
        division={division}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
      />

      <section className="sp-content-shell py-8">
        <LeagueTeamStats leaderboards={leaderboards} />
      </section>
    </div>
  )
}
