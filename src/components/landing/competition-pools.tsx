import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { competitionPoolsQueryOptions } from '#/data/competition-pools'
import type { DivisionPool, Stage, TeamPool } from '#/lib/types'
import { slugify } from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function CompetitionPools({
  competitionId,
  seasonId,
  divisionId,
  leagueSlug,
  seasonSlug,
  legSlug,
  stages = [],
}: {
  competitionId: string
  seasonId: string
  divisionId?: string
  leagueSlug: string
  seasonSlug: string
  legSlug?: string
  stages?: Stage[]
}) {
  const { data } = useSuspenseQuery(
    competitionPoolsQueryOptions({
      competitionId,
      seasonId,
      divisionId,
      stages,
    }),
  )
  const pools = data.pools
  const isStagePools = data.source === 'stage'

  if (pools.length === 0) {
    return (
      <section className="sp-content-shell py-8">
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            {isStagePools ? 'No stage pools yet' : 'No pools yet'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStagePools
              ? 'Stage pools will appear here once the groups are published.'
              : 'Pool draw for this leg will appear here once it is published.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="sp-content-shell py-8">
      <div className="mb-5">
        <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {isStagePools ? 'Stage pools' : 'Pools'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isStagePools
            ? 'Group stage draw for this tournament'
            : 'Group stage draw for this leg'}
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
              leagueSlug={leagueSlug}
              seasonSlug={seasonSlug}
              legSlug={isStagePools ? undefined : legSlug}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function PoolCard({
  pool,
  leagueSlug,
  seasonSlug,
  legSlug,
}: {
  pool: DivisionPool
  leagueSlug: string
  seasonSlug: string
  legSlug?: string
}) {
  const teams = pool.teams

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
              leagueSlug={leagueSlug}
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
  leagueSlug,
  seasonSlug,
  legSlug,
}: {
  team: TeamPool
  leagueSlug: string
  seasonSlug: string
  legSlug?: string
}) {
  const body = (
    <>
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
        {team.team_logo ? (
          <img src={team.team_logo} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[0.65rem] font-bold text-muted-foreground">
            {getTeamInitials(team.team_name)}
          </span>
        )}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {team.team_name}
      </span>
    </>
  )

  if (!legSlug) {
    return <li className="flex items-center gap-3 px-4 py-3">{body}</li>
  }

  return (
    <li>
      <Link
        to="/$leagueSlug/$seasonSlug/clubs/$clubSlug"
        params={{
          leagueSlug,
          seasonSlug,
          clubSlug: slugify(team.team_name),
        }}
        search={{ leg: legSlug, teamId: team.team_id }}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20"
      >
        {body}
      </Link>
    </li>
  )
}
