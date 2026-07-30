import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { divisionStandingsQueryOptions } from '#/data/standings'
import type { DivisionStanding } from '#/lib/types'
import { cn } from '#/lib/utils'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function StandingsSnippet({
  competitionId,
  seasonId,
  divisionId,
  limit = 5,
}: {
  competitionId: string
  seasonId: string
  divisionId: string
  limit?: number
}) {
  const { leagueSlug, seasonSlug, legSlug } = legRoute.useParams()
  const { data } = useSuspenseQuery(
    divisionStandingsQueryOptions(competitionId, seasonId, divisionId),
  )

  const rows = [...(data.division_standings ?? [])]
    .sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position
      return b.points - a.points
    })
    .slice(0, limit)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title="Table"
        subtitle={
          data.matches_played
            ? `Leg standings · ${data.matches_played} matches played`
            : 'Leg standings'
        }
      />

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
          Standings will appear once matches are complete.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-2 border-b border-border/60 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:px-4">
            <span>#</span>
            <span>Team</span>
            <span className="text-center">Pts</span>
          </div>

          <ul className="flex-1 divide-y divide-border/60">
            {rows.map((team) => (
              <StandingRow key={team.team_id} team={team} />
            ))}
          </ul>
        </>
      )}

      <div className="mt-auto border-t border-border bg-muted/15 px-4 py-3">
        <Link
          to="/$leagueSlug/$seasonSlug/$legSlug/standings"
          params={{ leagueSlug, seasonSlug, legSlug }}
          className="text-xs font-bold tracking-wider text-primary uppercase hover:underline"
        >
          Full standings →
        </Link>
      </div>
    </article>
  )
}

function StandingRow({ team }: { team: DivisionStanding }) {
  const isLeader = team.position === 1

  return (
    <li
      className={cn(
        'grid grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-2 px-3 py-2.5 sm:px-4',
        isLeader && 'bg-secondary/[0.04]',
      )}
    >
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md text-xs font-bold tabular-nums',
          isLeader
            ? 'bg-secondary/15 text-secondary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {team.position}
      </span>

      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
          {team.team_logo ? (
            <img
              src={team.team_logo}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="text-[0.6rem] font-bold text-muted-foreground">
              {getTeamInitials(team.team_short_name || team.team_name)}
            </span>
          )}
        </div>
        <span className="truncate text-sm font-medium text-foreground/85">
          {team.team_name}
        </span>
      </div>

      <span className="text-center text-base font-bold tabular-nums text-primary">
        {team.points}
      </span>
    </li>
  )
}
