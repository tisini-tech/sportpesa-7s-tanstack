import { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { LEAGUE_TEAM_LEADERBOARD_LIMIT } from '#/lib/league-stats'
import type { TopTeamStats } from '#/lib/types'
import { cn } from '#/lib/utils'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function LeagueTeamLeaderboard({
  title,
  teams,
}: {
  title: string
  teams: TopTeamStats[]
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleTeams = expanded
    ? teams
    : teams.slice(0, LEAGUE_TEAM_LEADERBOARD_LIMIT)
  const hasMore = teams.length > LEAGUE_TEAM_LEADERBOARD_LIMIT

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader title={title} />

      {teams.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No team stats available yet.
        </p>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-border/60">
            {visibleTeams.map((team, index) => (
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
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80',
                )}
              >
                {expanded ? 'Show less' : 'View all'}
                <ChevronRightIcon
                  className={cn('size-4 transition-transform', expanded && 'rotate-90')}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </>
      )}
    </article>
  )
}
