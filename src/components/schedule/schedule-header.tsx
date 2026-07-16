import {
  SCHEDULE_STAGES,
  type ScheduleStage,
} from '#/components/schedule/schedule-stages'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
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
  return (
    <TournamentPageHeader
      seasons={seasons}
      season={season}
      division={division}
      seasonId={seasonId}
      divisionId={divisionId}
      onSeasonChange={onSeasonChange}
      onDivisionChange={onDivisionChange}
      emptyMessage="Select a season and leg to view fixtures."
    >
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
    </TournamentPageHeader>
  )
}
