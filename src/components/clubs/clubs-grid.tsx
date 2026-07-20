import { Link } from '@tanstack/react-router'
import { UsersIcon } from 'lucide-react'

import type { Team } from '#/lib/types'
import { slugify } from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'

export function getClubSlug(team: Pick<Team, 'team_name' | 'short_name'>): string {
  return slugify(team.short_name || team.team_name)
}

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function ClubsGrid({
  teams,
  seasonSlug,
  legSlug,
}: {
  teams: Team[]
  seasonSlug: string
  legSlug: string
}) {
  const sorted = [...teams].sort((a, b) =>
    a.team_name.localeCompare(b.team_name),
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">No clubs yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Clubs for this leg will appear here once the roster is published.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {sorted.map((team) => (
        <li key={team.team_id}>
          <Link
            to="/$seasonSlug/$legSlug/clubs/$clubSlug"
            params={{
              seasonSlug,
              legSlug,
              clubSlug: getClubSlug(team),
            }}
            search={{ teamId: team.team_id }}
            className={cn(
              'group flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-colors',
              'hover:border-secondary/40 hover:bg-muted/20',
            )}
          >
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 sm:size-20">
              {team.team_logo ? (
                <img
                  src={team.team_logo}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <UsersIcon className="size-5 sm:size-6" aria-hidden />
                  <span className="text-[0.65rem] font-bold tracking-wide">
                    {getTeamInitials(team.short_name || team.team_name)}
                  </span>
                </span>
              )}
            </div>

            <div className="min-w-0 w-full">
              <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground">
                {team.team_name}
              </p>
              {team.short_name ? (
                <p className="mt-0.5 truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  {team.short_name}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
