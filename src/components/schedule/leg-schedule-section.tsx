import { useState } from 'react'
import { MapPinIcon } from 'lucide-react'

import {
  SCHEDULE_STAGES,
  type ScheduleStage,
} from '#/components/schedule/schedule-stages'
import { ScheduleLegProvider } from '#/components/schedule/schedule-leg-context'
import { GroupStageTab } from '#/components/schedule/groups'
import { QuartersTab } from '#/components/schedule/quarters'
import { SemisTab } from '#/components/schedule/semis'
import { FinalsTab } from '#/components/schedule/finals'
import {
  formatDivisionCardDateRange,
  formatDivisionStatusLabel,
  getDivisionStatus,
} from '#/components/landing/division-utils'
import { getLegSlug } from '#/lib/tournament-slugs'
import type { Division, Fixture, StageStanding } from '#/lib/types'
import { cn } from '#/lib/utils'

function getStageTabLabel(stage: (typeof SCHEDULE_STAGES)[number]): string {
  if (stage.id === 'semi-finals') return 'Semis'
  return stage.label
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

export type LegScheduleData = {
  division: Division
  fixtures: Fixture[]
  standings: StageStanding[]
}

export function LegScheduleSection({
  leg,
  legNumber,
  defaultStage = 'groups',
}: {
  leg: LegScheduleData
  legNumber: number
  defaultStage?: ScheduleStage
}) {
  const [activeStage, setActiveStage] = useState<ScheduleStage>(defaultStage)
  const { division, fixtures, standings } = leg
  const status = getDivisionStatus(division)
  const legSlug = getLegSlug(division)

  return (
    <ScheduleLegProvider legSlug={legSlug}>
      <section id={`leg-${legSlug}`} className="scroll-mt-24">
        <div className="border-b border-border bg-card">
          <div className="sp-content-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:py-5">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground sm:size-12"
                aria-hidden
              >
                <MapPinIcon className="size-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-1 text-[0.6rem] font-black tracking-[0.15em] text-secondary uppercase">
                    Leg {legNumber}
                  </span>
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 text-[0.6rem] font-bold tracking-wider uppercase ring-1',
                      statusBadgeClass(status),
                      status === 'live' && 'animate-pulse',
                    )}
                  >
                    {formatDivisionStatusLabel(status)}
                  </span>
                </div>

                <h2 className="mt-1.5 font-heading text-xl font-black tracking-tight text-primary uppercase sm:text-2xl">
                  {division.name}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {division.county} · {formatDivisionCardDateRange(division)}
                </p>
              </div>
            </div>

            <div
              className="grid w-full grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5 sm:w-auto sm:grid-cols-4"
              role="tablist"
              aria-label={`${division.name} tournament stage`}
            >
              {SCHEDULE_STAGES.map((stage) => {
                const isActive = activeStage === stage.id

                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveStage(stage.id)}
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

        <div className="sp-content-shell py-8">
          {activeStage === 'groups' ? (
            <GroupStageTab fixtures={fixtures} standings={standings} />
          ) : activeStage === 'quarters' ? (
            <QuartersTab fixtures={fixtures} />
          ) : activeStage === 'semi-finals' ? (
            <SemisTab fixtures={fixtures} />
          ) : activeStage === 'finals' ? (
            <FinalsTab fixtures={fixtures} />
          ) : null}
        </div>
      </section>
    </ScheduleLegProvider>
  )
}
