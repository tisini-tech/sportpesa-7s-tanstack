import { MapPinIcon } from 'lucide-react'

import {
  SCHEDULE_STAGES,
  type ScheduleStage,
} from '#/components/schedule/schedule-stages'
import {
  formatDivisionCardDateRange,
  formatDivisionOrder,
  formatDivisionStatusLabel,
  getDivisionStatus,
} from '#/components/landing/division-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import type { Division, Season } from '#/lib/types'

type ScheduleHeaderProps = {
  seasons: Season[]
  season?: Season
  division?: Division
  seasonId?: number
  divisionId?: number
  activeStage: ScheduleStage
  onSeasonChange: (seasonId: number) => void
  onDivisionChange: (divisionId: number) => void
  onStageChange: (stage: ScheduleStage) => void
}

function statusBadgeClass(
  status: ReturnType<typeof getDivisionStatus>,
): string {
  if (status === 'live') {
    return 'bg-secondary/15 text-secondary ring-secondary/30'
  }
  if (status === 'completed') {
    return 'bg-muted text-muted-foreground ring-border'
  }
  return 'bg-primary/15 text-primary ring-primary/30'
}

function getStageTabLabel(stage: (typeof SCHEDULE_STAGES)[number]): string {
  if (stage.id === 'semi-finals') return 'Semis'
  return stage.label
}

export function ScheduleHeader({
  seasons,
  season,
  division,
  seasonId,
  divisionId,
  activeStage,
  onSeasonChange,
  onDivisionChange,
  onStageChange,
}: ScheduleHeaderProps) {
  const status = division ? getDivisionStatus(division) : null
  const sortedDivisions = [...(season?.divisions ?? [])].sort(
    (a, b) => a.order - b.order,
  )
  const seasonItems = seasons.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }))
  const divisionItems = sortedDivisions.map((leg) => ({
    value: leg.id.toString(),
    label: leg.name,
  }))

  return (
    <section className="border-b border-border bg-card">
      <div className="sp-content-shell py-4 sm:py-6">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {division ? (
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground sm:size-20 lg:size-24"
                aria-hidden
              >
                <MapPinIcon className="size-6 sm:size-8 lg:size-9" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-md bg-muted px-2 py-1 text-[0.6rem] font-black tracking-[0.15em] text-secondary uppercase sm:text-[0.65rem]">
                    Leg {formatDivisionOrder(division.order)}
                  </span>
                  {status ? (
                    <span
                      className={cn(
                        'rounded-md px-2 py-1 text-[0.6rem] font-bold tracking-wider uppercase ring-1 sm:text-[0.65rem]',
                        statusBadgeClass(status),
                        status === 'live' && 'animate-pulse',
                      )}
                    >
                      {formatDivisionStatusLabel(status)}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-1.5 font-heading text-2xl font-black tracking-tight text-foreground uppercase sm:mt-2 sm:text-3xl lg:text-4xl">
                  {division.name}
                </h1>

                <p className="mt-1 text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
                  {division.county} · {formatDivisionCardDateRange(division)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a season and leg to view fixtures.
            </p>
          )}

          <div className="flex w-full flex-col gap-4 sm:gap-5 lg:w-auto lg:shrink-0 lg:items-end lg:gap-6 lg:pt-2">
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:justify-end">
              <Select
                value={seasonId?.toString()}
                items={seasonItems}
                onValueChange={(value) => {
                  if (value) onSeasonChange(Number(value))
                }}
              >
                <SelectTrigger className="w-full min-w-0 border-border bg-background sm:min-w-[7.5rem]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={divisionId?.toString()}
                items={divisionItems}
                onValueChange={(value) => {
                  if (value) onDivisionChange(Number(value))
                }}
              >
                <SelectTrigger className="w-full min-w-0 border-border bg-background sm:min-w-[9.5rem]">
                  <SelectValue placeholder="Select leg" />
                </SelectTrigger>
                <SelectContent>
                  {sortedDivisions.map((leg) => (
                    <SelectItem key={leg.id} value={leg.id.toString()}>
                      {leg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="grid w-full grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5 sm:grid-cols-4 lg:w-auto"
              role="tablist"
              aria-label="Tournament stage"
            >
              {SCHEDULE_STAGES.map((stage) => {
                const isActive = activeStage === stage.id

                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onStageChange(stage.id)}
                    className={cn(
                      'w-full rounded-lg px-2 py-2 text-[0.6rem] font-bold tracking-[0.1em] uppercase transition-colors sm:px-3.5 sm:text-[0.65rem] sm:tracking-[0.12em] lg:min-w-[5.25rem] lg:px-4',
                      isActive
                        ? 'bg-secondary/15 text-secondary shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <span className="sm:hidden">{getStageTabLabel(stage)}</span>
                    <span className="hidden sm:inline">{stage.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
