import { createFileRoute } from '@tanstack/react-router'

import { getFixtureLineupsFn } from '#/data/fixtures'
import { cn } from '#/lib/utils'
import type { FixtureLineup } from '#/lib/types'
import { Route as MatchLayoutRoute } from './route'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/schedule/$fixtureId/lineups',
)({
  loader: async ({ context, params }) => {
    const lineups = await getFixtureLineupsFn({
      data: {
        seasonId: context.season.id.toString(),
        fixtureId: params.fixtureId,
      },
    })
    return lineups
  },
  component: RouteComponent,
})

export function splitLineup(players: FixtureLineup[]) {
  const starters: FixtureLineup[] = []
  const substitutes: FixtureLineup[] = []

  for (const player of players) {
    const type = player.player_type.toLowerCase()
    if (type.includes('sub')) {
      substitutes.push(player)
    } else {
      starters.push(player)
    }
  }

  return { starters, substitutes }
}

function RouteComponent() {
  const { details } = MatchLayoutRoute.useLoaderData()
  const lineups = Route.useLoaderData()

  const home = splitLineup(lineups.home)
  const away = splitLineup(lineups.away)
  const showRatings = details.fixture.game_status !== 'notstarted'

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LineupColumn
        starters={home.starters}
        substitutes={home.substitutes}
        showRatings={showRatings}
      />
      <LineupColumn
        starters={away.starters}
        substitutes={away.substitutes}
        align="right"
        showRatings={showRatings}
      />
    </div>
  )
}

function LineupColumn({
  starters,
  substitutes,
  align = 'left',
  showRatings,
}: {
  starters: FixtureLineup[]
  substitutes: FixtureLineup[]
  align?: 'left' | 'right'
  showRatings: boolean
}) {
  return (
    <section className="bg-card/80 border-border rounded-lg border p-3 sm:p-4">
      <div className="space-y-4">
        <LineupSection
          title="Starters"
          players={starters}
          align={align}
          showRatings={showRatings}
        />
        <LineupSection
          title="Substitutes"
          players={substitutes}
          align={align}
          showRatings={showRatings}
        />
      </div>
    </section>
  )
}

function LineupSection({
  title,
  players,
  align = 'left',
  showRatings,
}: {
  title: string
  players: FixtureLineup[]
  align?: 'left' | 'right'
  showRatings: boolean
}) {
  const isRight = align === 'right'

  return (
    <div>
      <h4
        className={cn(
          'text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide',
          isRight && 'text-right',
        )}
      >
        {title} ({players.length})
      </h4>
      {players.length === 0 ? (
        <p
          className={cn(
            'text-muted-foreground text-sm',
            isRight && 'text-right',
          )}
        >
          No players listed.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              align={align}
              showRatings={showRatings}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function PlayerRow({
  player,
  align,
  showRatings,
}: {
  player: FixtureLineup
  align: 'left' | 'right'
  showRatings: boolean
}) {
  const isRight = align === 'right'
  const rating =
    showRatings && player.minutes_played > 0 ? player.rating : null

  return (
    <li
      className={cn(
        'bg-background/70 border-border/60 flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm',
        isRight && 'flex-row-reverse',
      )}
    >
      <span className="bg-muted text-muted-foreground min-w-7 shrink-0 rounded px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums">
        {player.jersey_no || '-'}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm font-normal text-foreground/75',
          isRight ? 'text-right' : 'text-left',
        )}
      >
        {player.pname}
      </span>
      {rating != null ? (
        <span className="text-secondary shrink-0 text-xs font-bold tabular-nums">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </li>
  )
}
