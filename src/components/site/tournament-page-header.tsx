import type { ReactNode } from 'react'
import { MapPinIcon } from 'lucide-react'

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

export type TournamentPageHeaderProps = {
  seasons: Season[]
  season?: Season
  division?: Division
  seasonId?: number
  divisionId?: number
  onSeasonChange: (seasonId: number) => void
  onDivisionChange: (divisionId: number) => void
  emptyMessage?: string
  children?: ReactNode
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

export function TournamentPageHeader({
  seasons,
  season,
  division,
  seasonId,
  divisionId,
  onSeasonChange,
  onDivisionChange,
  emptyMessage = 'Select a season and leg to continue.',
  children,
}: TournamentPageHeaderProps) {
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

                <h1 className="mt-1.5 font-heading text-2xl font-black tracking-tight text-primary uppercase sm:mt-2 sm:text-3xl lg:text-4xl">
                  {division.name}
                </h1>

                <p className="mt-1 text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
                  {division.county} · {formatDivisionCardDateRange(division)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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

            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
