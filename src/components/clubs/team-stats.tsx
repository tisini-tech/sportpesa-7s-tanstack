import type { EventStat, SubEvent, TeamStats as TeamStatsData } from '#/lib/types'
import { cn } from '#/lib/utils'

const HIGHLIGHTED_STATS = [
  { eventId: 33, label: 'Score' },
  { eventId: 60, label: 'Penalties conceded', topSubEvents: 3 },
  { eventId: 58, label: 'Carries' },
  { eventId: 37, label: 'Linebreaks' },
] as const

function findStat(
  stats: EventStat[],
  eventId: number,
): EventStat | undefined {
  return stats.find((stat) => stat.event_id === eventId)
}

function getSubEventBreakdown(
  subEvents: SubEvent[] | undefined,
  limit?: number,
): SubEvent[] {
  const sorted = [...(subEvents ?? [])]
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)

  return limit != null ? sorted.slice(0, limit) : sorted
}

function StatBreakdown({
  items,
  className,
}: {
  items: SubEvent[]
  className?: string
}) {
  if (items.length === 0) return null

  const max = Math.max(...items.map((item) => item.total))

  return (
    <ul className={cn('mt-3 space-y-2 border-t border-border/60 pt-3', className)}>
      {items.map((item) => {
        const width = max > 0 ? (item.total / max) * 100 : 0

        return (
          <li key={item.sub_event_id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="min-w-0 truncate text-muted-foreground">
                {item.sub_event_name}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {item.total}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function TeamStatsCards({ data }: { data: TeamStatsData }) {
  if (!data.stats?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-foreground">No stats yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Team stats will appear here once matches have been played.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {HIGHLIGHTED_STATS.map((item) => {
        const stat = findStat(data.stats, item.eventId)
        const breakdown = getSubEventBreakdown(
          stat?.sub_events,
          'topSubEvents' in item ? item.topSubEvents : undefined,
        )

        return (
          <li
            key={item.eventId}
            className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                {stat?.event_name || item.label}
              </p>
              <p className="font-heading text-2xl font-black tabular-nums text-secondary sm:text-3xl">
                {stat?.total ?? 0}
              </p>
            </div>

            <StatBreakdown items={breakdown} />

            {'topSubEvents' in item && breakdown.length > 0 ? (
              <p className="mt-2 text-[0.6rem] text-muted-foreground/80">
                Top {item.topSubEvents} by count
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
