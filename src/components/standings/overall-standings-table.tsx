import { cn } from '#/lib/utils'
import type { OverallStanding } from '#/lib/types'
import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function OverallStandingsTable({
  standings,
}: {
  standings: OverallStanding[]
}) {
  const sorted = [...standings].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position
    return b.total_points - a.total_points
  })

  const legColumns = collectLegColumns(sorted)

  if (sorted.length === 0) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader title="Overall standings" />
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Overall standings will appear once the season is underway.
        </p>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title="Overall standings"
        subtitle="Season totals across all legs"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              <th className="px-3 py-2.5 text-left font-semibold sm:px-4">#</th>
              <th className="px-2 py-2.5 text-left font-semibold">Team</th>
              {legColumns.map((leg) => (
                <th
                  key={leg.division_id}
                  className="px-2 py-2.5 text-center font-semibold"
                  title={leg.division_name}
                >
                  {shortLegLabel(leg.division_name)}
                </th>
              ))}
              <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((standing) => (
              <OverallStandingRow
                key={standing.team_id}
                standing={standing}
                legColumns={legColumns}
              />
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

type LegColumn = {
  division_id: number
  division_name: string
}

function collectLegColumns(standings: OverallStanding[]): LegColumn[] {
  const byId = new Map<number, string>()

  for (const standing of standings) {
    for (const point of standing.division_points ?? []) {
      if (!byId.has(point.division_id)) {
        byId.set(point.division_id, point.division_name)
      }
    }
  }

  return [...byId.entries()]
    .map(([division_id, division_name]) => ({ division_id, division_name }))
    .sort((a, b) => a.division_id - b.division_id)
}

function shortLegLabel(name: string): string {
  const cleaned = name.replace(/\s*7s?\s*$/i, '').trim()
  if (cleaned.length <= 8) return cleaned
  return cleaned.slice(0, 6) + '…'
}

function OverallStandingRow({
  standing,
  legColumns,
}: {
  standing: OverallStanding
  legColumns: LegColumn[]
}) {
  const isLeader = standing.position === 1
  const pointsByDivision = new Map(
    (standing.division_points ?? []).map((point) => [
      point.division_id,
      point.points,
    ]),
  )

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

      {legColumns.map((leg) => (
        <td
          key={leg.division_id}
          className="px-2 py-3 text-center tabular-nums text-foreground/75"
        >
          {pointsByDivision.get(leg.division_id) ?? '—'}
        </td>
      ))}

      <td className="px-3 py-3 text-center sm:px-4">
        <span className="text-base font-bold tabular-nums text-foreground">
          {standing.total_points}
        </span>
      </td>
    </tr>
  )
}
