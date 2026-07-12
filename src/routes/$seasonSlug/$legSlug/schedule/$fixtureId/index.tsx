import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRightLeftIcon,
  CircleDotIcon,
  FlagIcon,
  GoalIcon,
  RectangleVerticalIcon,
  ShieldAlertIcon,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import type { Highlight } from '#/lib/types'
import { Route as MatchLayoutRoute } from './route'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/schedule/$fixtureId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { details } = MatchLayoutRoute.useLoaderData()

  const fixture = details.fixture
  const highlights = details.highlights

  const isHomeTeam = (teamId: number) => teamId === fixture.team1_id

  return (
    <>
      {highlights.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            No events yet! This match hasn't started yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {highlights.map((highlight) => {
            const Icon = getEventIcon(highlight)
            const isHome = isHomeTeam(highlight.team)

            return (
              <div
                key={highlight.id}
                className={cn(
                  'bg-background/75 border-border/70 flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  isHome ? 'justify-start' : 'justify-end',
                )}
              >
                {isHome ? (
                  <>
                    <span className="bg-muted text-muted-foreground min-w-10 rounded px-2 py-0.5 text-center text-xs font-semibold tabular-nums">
                      {highlight.game_minute || '-'}
                    </span>
                    <Icon className="text-primary size-4 shrink-0" />
                    <span className="text-foreground/75 font-normal">
                      {highlight.pname || 'Unknown player'}
                    </span>
                    <span className="text-[0.65rem] font-normal tracking-wide text-muted-foreground/65 uppercase">
                      {highlight.event_name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[0.65rem] font-normal tracking-wide text-muted-foreground/65 uppercase">
                      {highlight.event_name}
                    </span>
                    <span className="text-foreground/75 font-normal">
                      {highlight.pname || 'Unknown player'}
                    </span>
                    <Icon className="text-primary size-4 shrink-0" />
                    <span className="bg-muted text-muted-foreground min-w-10 rounded px-2 py-0.5 text-center text-xs font-semibold tabular-nums">
                      {highlight.game_minute || '-'}
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

type EventIcon = typeof CircleDotIcon

const EVENT_ICON_BY_ID: Record<number, EventIcon> = {
  5: GoalIcon,
  18: RectangleVerticalIcon,
  65: ArrowRightLeftIcon,
  71: ArrowRightLeftIcon,
  80: RectangleVerticalIcon,
  81: RectangleVerticalIcon,
  82: ArrowRightLeftIcon,
}

function getEventIcon(event: Highlight): EventIcon {
  const mapped = EVENT_ICON_BY_ID[event.event_id]
  if (mapped) return mapped

  const name = event.event_name.toLowerCase()
  if (name.includes('goal')) return GoalIcon
  if (name.includes('card')) return RectangleVerticalIcon
  if (name.includes('sub')) return ArrowRightLeftIcon
  if (name.includes('offside')) return FlagIcon
  if (name.includes('pen')) return ShieldAlertIcon
  return CircleDotIcon
}
