import { CalendarOffIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { ScheduleStage } from '#/components/schedule/schedule-stages'

const EMPTY_STATE_COPY: Record<
  ScheduleStage,
  { title: string; description: string }
> = {
  groups: {
    title: 'No group fixtures yet',
    description:
      'Pool matches will appear here once the schedule is published.',
  },
  quarters: {
    title: 'No quarter-finals yet',
    description:
      'Knockout fixtures will appear here once the group stage is complete.',
  },
  'semi-finals': {
    title: 'No semi-finals yet',
    description:
      'Semi-final matches will appear here once the quarter-finals are done.',
  },
  finals: {
    title: 'No finals yet',
    description:
      'Cup and placement finals will appear here on finals day.',
  },
}

type ScheduleEmptyStateProps = {
  stage: ScheduleStage
  className?: string
}

export function ScheduleEmptyState({ stage, className }: ScheduleEmptyStateProps) {
  const copy = EMPTY_STATE_COPY[stage]

  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        <CalendarOffIcon className="size-6" aria-hidden />
      </div>

      <p className="mt-4 text-sm font-semibold text-foreground">{copy.title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {copy.description}
      </p>
    </div>
  )
}
