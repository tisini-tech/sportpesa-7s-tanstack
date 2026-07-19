import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { poolsQueryOptions } from '#/data/seasons'
import type { DivisionPool, TeamPool } from '#/lib/types'
import { slugify } from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'

const legRoute = getRouteApi('/$seasonSlug/$legSlug')

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

function sortPools(pools: DivisionPool[]): DivisionPool[] {
  return [...pools].sort((a, b) => a.name.localeCompare(b.name))
}

export function DivisionPools({
  seasonId,
  divisionId,
}: {
  seasonId: string
  divisionId: string
}) {
  const { seasonSlug, legSlug } = legRoute.useParams()
  const { data: divisionPools } = useSuspenseQuery(
    poolsQueryOptions(seasonId, divisionId),
  )

  const pools = sortPools(divisionPools)

  if (pools.length === 0) {
    return (
      <section className="sp-content-shell py-8">
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No pools yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pool draw for this leg will appear here once it is published.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="sp-content-shell py-8">
      <div className="mb-5">
        <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Pools
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Group stage draw for this leg
        </p>
      </div>

      <ul
        className={cn(
          'grid gap-4',
          pools.length === 1 && 'grid-cols-1',
          pools.length === 2 && 'grid-cols-1 sm:grid-cols-2',
          pools.length === 3 && 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
          pools.length >= 4 && 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
        )}
      >
        {pools.map((pool) => (
          <li key={pool.id}>
            <PoolCard
              pool={pool}
              seasonSlug={seasonSlug}
              legSlug={legSlug}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PoolCard({
  pool,
  seasonSlug,
  legSlug,
}: {
  pool: DivisionPool
  seasonSlug: string
  legSlug: string
}) {
  const teams = [...pool.teams].sort((a, b) =>
    a.team_name.localeCompare(b.team_name),
  )

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title={pool.name}
        subtitle={
          teams.length > 0
            ? `${teams.length} ${teams.length === 1 ? 'team' : 'teams'}`
            : undefined
        }
      />

      {teams.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Teams coming soon.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-border/60">
          {teams.map((team) => (
            <PoolTeamRow
              key={team.team_id}
              team={team}
              seasonSlug={seasonSlug}
              legSlug={legSlug}
            />
          ))}
        </ul>
      )}
    </article>
  )
}

function PoolTeamRow({
  team,
  seasonSlug,
  legSlug,
}: {
  team: TeamPool
  seasonSlug: string
  legSlug: string
}) {
  return (
    <li>
      <Link
        to="/$seasonSlug/$legSlug/clubs/$clubSlug"
        params={{
          seasonSlug,
          legSlug,
          clubSlug: slugify(team.team_name),
        }}
        search={{ teamId: team.team_id }}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20"
      >
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
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
      </Link>
    </li>
  )
}
