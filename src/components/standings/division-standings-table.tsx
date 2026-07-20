import { cn } from '#/lib/utils'
import type { DivisionStanding } from '#/lib/types'
import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function DivisionStandingsTable({
  standings,
  matchesPlayed,
}: {
  standings: DivisionStanding[]
  matchesPlayed?: number
}) {
  const sorted = [...standings].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position
    return b.points - a.points
  })

  if (sorted.length === 0) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader title="Leg standings" />
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Standings will appear once matches are complete.
        </p>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title="Leg standings"
        subtitle={
          matchesPlayed != null ? `${matchesPlayed} matches played` : undefined
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              <th className="px-3 py-2.5 text-left font-semibold sm:px-4">#</th>
              <th className="px-2 py-2.5 text-left font-semibold">Team</th>
              <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((standing) => (
              <DivisionStandingRow key={standing.team_id} standing={standing} />
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function DivisionStandingRow({ standing }: { standing: DivisionStanding }) {
  const isLeader = standing.position === 1

  return (
    <tr
      className={cn(
        'border-b border-border/60 last:border-b-0',
        isLeader && 'bg-secondary/[0.04]',
      )}
    >
      <td className="px-3 py-3 sm:px-4">
        <span
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-md text-xs font-bold tabular-nums',
            isLeader
              ? 'bg-secondary/15 text-secondary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {standing.position}
        </span>
      </td>

      <td className="px-2 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
            {standing.team_logo ? (
              <img
                src={standing.team_logo}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-[0.6rem] font-bold text-muted-foreground">
                {getTeamInitials(
                  standing.team_short_name || standing.team_name,
                )}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground/85">
              {standing.team_name}
            </p>
            {standing.team_short_name ? (
              <p className="truncate text-[0.65rem] text-muted-foreground/75">
                {standing.team_short_name}
              </p>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-3 py-3 text-center sm:px-4">
        <span className="text-base font-bold tabular-nums text-primary">
          {standing.points}
        </span>
      </td>
    </tr>
  )
}
