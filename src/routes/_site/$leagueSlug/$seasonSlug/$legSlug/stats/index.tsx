import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { Loading } from '#/components/error/loading'
import { getTopPlayerStatsFn, getTopTeamStatsFn } from '#/data/teams'
import { getLeagueStatsEvents } from '#/lib/league-stats'
import { TeamLeaderboard } from '#/components/stats/team-board'
import { PlayerLeaderBoard } from '#/components/stats/player-board'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/$legSlug/stats/')({
  loader: async ({ context, params }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const competitionId = context.competitionId
    const events = getLeagueStatsEvents(params.seasonSlug)

    const [
      topTeamTries,
      topTeamVisits,
      topTeamPoints,
      topPlayerTries,
      topPlayerPoints,
      topPlayersCarries,
    ] = await Promise.all([
      getTopTeamStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.score,
          divisionId,
        },
      }),
      getTopTeamStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.visits,
          divisionId,
        },
      }),
      getTopTeamStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.score,
          divisionId,
          isPoints: true,
        },
      }),
      getTopPlayerStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.score,
          divisionId,
        },
      }),
      getTopPlayerStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.score,
          divisionId,
          isPoints: true,
        },
      }),
      getTopPlayerStatsFn({
        data: {
          competitionId,
          seasonId,
          eventId: events.carries,
          divisionId,
        },
      }),
    ])

    return {
      events,
      topTeamTries,
      topTeamPoints,
      topTeamVisits,
      topPlayersCarries,
      topPlayerTries,
      topPlayerPoints,
    }
  },
  component: StatsPage,
  pendingComponent: Loading,
})

function StatsPage() {
  const { seasons, season, division } = legRoute.useRouteContext()
  const {
    events,
    topTeamTries,
    topTeamPoints,
    topTeamVisits,
    topPlayersCarries,
    topPlayerTries,
    topPlayerPoints,
  } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { leagueSlug } = Route.useParams()

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: (params) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/$legSlug/stats',
          params,
        })
      },
    })

  return (
    <div>
      <TournamentPageHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        emptyMessage="Select a season and leg to view stats."
      />

      <section className="sp-content-shell space-y-10 py-8">
        <StatsSection title="Team stats">
          <TeamLeaderboard
            title="Points"
            data={topTeamPoints}
            eventId={events.score}
            isPoints
          />
          <TeamLeaderboard
            title="Tries"
            data={topTeamTries}
            eventId={events.score}
          />
          <TeamLeaderboard
            title="Visits in opp 22"
            data={topTeamVisits}
            eventId={events.visits}
          />
        </StatsSection>

        <StatsSection title="Player stats">
          <PlayerLeaderBoard
            title="Points"
            data={topPlayerPoints.items}
            eventId={events.score}
            isPoints
          />
          <PlayerLeaderBoard
            title="Tries"
            data={topPlayerTries.items}
            eventId={events.score}
          />
          <PlayerLeaderBoard
            title="Carries"
            data={topPlayersCarries.items}
            eventId={events.carries}
          />
        </StatsSection>
      </section>
    </div>
  )
}

function StatsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  )
}
