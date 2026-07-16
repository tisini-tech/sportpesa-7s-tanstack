import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, UsersIcon } from 'lucide-react'

import type { Team } from '#/lib/types'
import { cn } from '#/lib/utils'

const tabs = [
  {
    label: 'Players',
    to: '/$seasonSlug/$legSlug/clubs/$clubSlug' as const,
    exact: true,
  },
  {
    label: 'Fixtures',
    to: '/$seasonSlug/$legSlug/clubs/$clubSlug/fixtures' as const,
    exact: false,
  },
  {
    label: 'Stats',
    to: '/$seasonSlug/$legSlug/clubs/$clubSlug/stats' as const,
    exact: false,
  },
]

const tabLinkClass =
  'rounded-lg px-3 py-2.5 text-center text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors text-muted-foreground hover:bg-accent hover:text-foreground'

const tabLinkActiveClass = 'bg-secondary/15 text-secondary shadow-sm'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function TeamHeader({
  team,
  teamId,
  seasonSlug,
  legSlug,
  clubSlug,
}: {
  team: Team
  teamId: number
  seasonSlug: string
  legSlug: string
  clubSlug: string
}) {
  const displayName = team.team_name || clubSlug
  const shortName = team.short_name

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/15 px-3 py-2 sm:px-4">
          <Link
            to="/$seasonSlug/$legSlug/clubs"
            params={{ seasonSlug, legSlug }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            All clubs
          </Link>
        </div>

        <div className="flex items-center gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-6">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 p-1.5 shadow-sm sm:size-20">
            {team.team_logo ? (
              <img
                className="h-full w-full object-contain"
                src={team.team_logo}
                alt={`${displayName} logo`}
              />
            ) : (
              <span className="flex size-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
                <UsersIcon className="size-5 sm:size-6" aria-hidden />
                <span className="text-[0.65rem] font-bold tracking-wide">
                  {getTeamInitials(shortName || displayName)}
                </span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {shortName ? (
              <p className="text-[0.65rem] font-bold tracking-[0.15em] text-secondary uppercase">
                {shortName}
              </p>
            ) : null}
            <h1 className="font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl lg:text-3xl">
              {displayName}
            </h1>
            {team.games_played > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {team.games_played}{' '}
                {team.games_played === 1 ? 'game' : 'games'} played
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="grid grid-cols-3 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            params={{ seasonSlug, legSlug, clubSlug }}
            search={{ teamId }}
            className={tabLinkClass}
            activeProps={{ className: cn(tabLinkClass, tabLinkActiveClass) }}
            activeOptions={{ exact: tab.exact }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
