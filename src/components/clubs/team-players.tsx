import type { TeamPlayer } from '#/lib/types'
import { cn } from '#/lib/utils'

const POSITION_ORDER = [
  'Prop',
  'Hooker',
  'Lock',
  'Flanker',
  'Number 8',
  'Scrum-half',
  'Fly-half',
  'Centre',
  'Wing',
  'Fullback',
  'Forward',
  'Back',
]

function normalizePosition(position: string | null | undefined): string {
  const value = position?.trim()
  return value ? value : 'Unlisted'
}

function positionSortKey(position: string): number {
  const index = POSITION_ORDER.findIndex(
    (item) => item.toLowerCase() === position.toLowerCase(),
  )
  return index === -1 ? POSITION_ORDER.length : index
}

export function groupPlayersByPosition(
  players: TeamPlayer[],
): Array<{ position: string; players: TeamPlayer[] }> {
  const groups = new Map<string, TeamPlayer[]>()

  for (const teamPlayer of players) {
    const position = normalizePosition(teamPlayer.player.current_position)
    const existing = groups.get(position)
    if (existing) {
      existing.push(teamPlayer)
    } else {
      groups.set(position, [teamPlayer])
    }
  }

  for (const group of groups.values()) {
    group.sort((a, b) => {
      const jerseyA = a.current_jersey_no || a.player.jersey_no || 0
      const jerseyB = b.current_jersey_no || b.player.jersey_no || 0
      if (jerseyA !== jerseyB) return jerseyA - jerseyB
      return a.player.name.localeCompare(b.player.name)
    })
  }

  return [...groups.entries()]
    .map(([position, groupPlayers]) => ({
      position,
      players: groupPlayers,
    }))
    .sort((a, b) => {
      const orderDiff =
        positionSortKey(a.position) - positionSortKey(b.position)
      if (orderDiff !== 0) return orderDiff
      return a.position.localeCompare(b.position)
    })
}

export function TeamPlayers({ players }: { players: TeamPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-foreground">No players yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This squad will appear here once the roster is published.
        </p>
      </div>
    )
  }

  const groups = groupPlayersByPosition(players)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.position} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-bold tracking-[0.12em] text-secondary uppercase">
              {group.position}
            </h2>
            <span className="text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
              {group.players.length}
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {group.players.map((teamPlayer) => (
              <PlayerCard key={teamPlayer.id} teamPlayer={teamPlayer} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function PlayerCard({ teamPlayer }: { teamPlayer: TeamPlayer }) {
  const { player } = teamPlayer
  const jersey = teamPlayer.current_jersey_no || player.jersey_no || null
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <li
      className={cn(
        'flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center shadow-sm',
      )}
    >
      <div className="relative">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 sm:size-20">
          {player.passportphoto ? (
            <img
              src={player.passportphoto}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold tracking-wide text-muted-foreground">
              {initials || '—'}
            </span>
          )}
        </div>
        {jersey != null ? (
          <span className="absolute -right-1 -bottom-1 min-w-7 rounded-md border border-border bg-background px-1.5 py-0.5 text-center text-[0.65rem] font-bold tabular-nums text-secondary shadow-sm">
            {jersey}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 w-full">
        <p className="truncate text-sm font-medium text-foreground">
          {player.name}
        </p>
        {player.nationality ? (
          <p className="mt-0.5 truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            {player.nationality}
          </p>
        ) : null}
      </div>
    </li>
  )
}
