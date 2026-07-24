import { getRouteApi, Link } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'

import { FixtureSectionHeader } from '../schedule/fixture-section-header'
import { LEAGUE_TEAM_LEADERBOARD_LIMIT } from '#/lib/league-stats'
import type { TopTeamStats } from '#/lib/types'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const TeamLeaderboard = ({
  title,
  data,
  eventId,
  isPoints = false,
}: {
  title: string
  data: TopTeamStats[]
  eventId: string
  isPoints?: boolean
}) => {
  const { leagueSlug, seasonSlug, legSlug } = legRoute.useParams()
  const visible = data.slice(0, LEAGUE_TEAM_LEADERBOARD_LIMIT)
  const hasMore = data.length > LEAGUE_TEAM_LEADERBOARD_LIMIT

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader title={title} />

      {data.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No team stats available yet.
        </p>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-border/60">
            {visible.map((team, index) => (
              <li
                key={team.team_id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="w-5 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                  {index + 1}
                </span>

                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                  {team.team_logo ? (
                    <img
                      src={team.team_logo}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[0.65rem] font-bold text-muted-foreground">
                      {getTeamInitials(team.team_name)}
                    </span>
                  )}
                </div>

                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {team.team_name}
                </span>

                <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
                  {team.total}
                </span>
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="border-t border-border/60 px-4 py-3 text-center">
              <Link
                to="/$leagueSlug/$seasonSlug/$legSlug/stats/$statsId/teams"
                params={{
                  leagueSlug,
                  seasonSlug,
                  legSlug,
                  statsId: eventId,
                }}
                search={{ isPoints: isPoints ? true : undefined }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                View all
                <ChevronRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </article>
  )
}
