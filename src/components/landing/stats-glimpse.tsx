import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'

import { PlayerLeaderBoard } from '#/components/stats/player-board'
import { TeamLeaderboard } from '#/components/stats/team-board'
import { leagueStatsGlimpseQueryOptions } from '#/data/teams'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

const GLIMPSE_LIMIT = 5

export function StatsGlimpse({
  competitionId,
  seasonId,
  seasonSlug,
}: {
  competitionId: string
  seasonId: string
  seasonSlug: string
}) {
  const { leagueSlug, legSlug } = legRoute.useParams()
  const { data } = useSuspenseQuery(
    leagueStatsGlimpseQueryOptions(competitionId, seasonId, seasonSlug),
  )

  const {
    events,
    topTeamTries,
    topTeamPoints,
    topTeamVisits,
    topPlayerTries,
    topPlayerPoints,
    topPlayersCarries,
  } = data

  return (
    <section className="sp-content-shell space-y-8 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Stats
          </h2>
          <p className="mt-1 text-sm text-foreground/90">
            Top teams and players across the season.
          </p>
        </div>
        <Link
          to="/$leagueSlug/$seasonSlug/$legSlug/stats"
          params={{ leagueSlug, seasonSlug, legSlug }}
          className="shrink-0 text-xs font-bold tracking-wider text-primary uppercase hover:underline"
        >
          All stats →
        </Link>
      </div>

      <StatsSection title="Team stats">
        <TeamLeaderboard
          title="Points"
          data={topTeamPoints}
          eventId={events.score}
          isPoints
          limit={GLIMPSE_LIMIT}
        />
        <TeamLeaderboard
          title="Tries"
          data={topTeamTries}
          eventId={events.score}
          limit={GLIMPSE_LIMIT}
        />
        <TeamLeaderboard
          title="Visits in opp 22"
          data={topTeamVisits}
          eventId={events.visits}
          limit={GLIMPSE_LIMIT}
        />
      </StatsSection>

      <StatsSection title="Player stats">
        <PlayerLeaderBoard
          title="Points"
          data={topPlayerPoints}
          eventId={events.score}
          isPoints
          limit={GLIMPSE_LIMIT}
        />
        <PlayerLeaderBoard
          title="Tries"
          data={topPlayerTries}
          eventId={events.score}
          limit={GLIMPSE_LIMIT}
        />
        <PlayerLeaderBoard
          title="Carries"
          data={topPlayersCarries}
          eventId={events.carries}
          limit={GLIMPSE_LIMIT}
        />
      </StatsSection>
    </section>
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
      <h3 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  )
}
