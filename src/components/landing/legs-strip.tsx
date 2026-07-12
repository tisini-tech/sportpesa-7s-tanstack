import {
  formatDivisionCardDateRange,
  formatDivisionStatusLabel,
  getDivisionStatus,
} from '#/components/landing/division-utils'
import { cn } from '#/lib/utils'
import type { Division } from '#/lib/types'

type LegStripProps = {
  divisions: Division[]
  activeDivisionId: number | null
  onSelectDivision: (id: number) => void
}

export function LegStrip({
  divisions,
  activeDivisionId,
  onSelectDivision,
}: LegStripProps) {
  if (!divisions.length) return null

  const sortedDivisions = [...divisions].sort((a, b) => a.order - b.order)

  return (
    <section className="border-y border-border bg-card py-4">
      <div className="sp-shell-wide">
        <div className="-mx-4 sm:mx-0">
          <div
            className="flex w-full min-w-0 snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6"
            role="list"
            aria-label="Tournament legs"
          >
            {sortedDivisions.map((division) => {
              const isActive = division.id === activeDivisionId
              const status = getDivisionStatus(division)

              return (
                <button
                  key={division.id}
                  type="button"
                  onClick={() => onSelectDivision(division.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'w-[10.5rem] shrink-0 snap-start rounded-xl border px-3 py-3 text-left transition-all md:w-auto md:px-4',
                    isActive
                      ? 'border-secondary bg-secondary/10 text-foreground shadow-md ring-1 ring-secondary/30'
                      : 'border-border bg-muted/40 text-foreground hover:border-secondary/40 hover:bg-accent',
                  )}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <p
                      className={cn(
                        'text-[0.65rem] font-black tracking-[0.15em] uppercase',
                        isActive ? 'text-secondary' : 'text-muted-foreground',
                      )}
                    >
                      Leg {division.order}
                    </p>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider uppercase',
                        status === 'live' &&
                          'bg-secondary text-secondary-foreground',
                        status === 'upcoming' &&
                          (isActive ? 'bg-secondary/20 text-secondary' : 'text-primary'),
                        status === 'completed' &&
                          (isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'),
                      )}
                    >
                      {formatDivisionStatusLabel(status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold">{division.name}</p>
                  <p
                    className={cn(
                      'mt-1 truncate text-xs',
                      isActive ? 'text-foreground/80' : 'text-muted-foreground',
                    )}
                  >
                    {division.county}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {formatDivisionCardDateRange(division)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
