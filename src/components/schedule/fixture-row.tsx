import { cn } from '#/lib/utils'
import type { Fixture } from '#/lib/types'

type FixtureStatus = 'live' | 'completed' | 'upcoming'

function getFixtureStatus(fixture: Fixture): FixtureStatus {
  const status = (fixture.game_status ?? '').toLowerCase()

  if (
    status.includes('live') ||
    status.includes('playing') ||
    status.includes('progress')
  ) {
    return 'live'
  }

  if (
    status.includes('finish') ||
    status.includes('complete') ||
    status.includes('ft') ||
    status.includes('played')
  ) {
    return 'completed'
  }

  return 'upcoming'
}

function formatFixtureStatusLabel(status: FixtureStatus): string {
  if (status === 'live') return 'Live'
  if (status === 'completed') return 'FT'
  return 'Upcoming'
}

function formatFixtureKickoff(fixture: Fixture): string {
  if (fixture.matchtime) return fixture.matchtime

  if (!fixture.game_date) return 'TBC'

  const parsed = new Date(fixture.game_date)
  if (Number.isNaN(parsed.getTime())) return 'TBC'

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

function hasScore(fixture: Fixture): boolean {
  return Boolean(fixture.home_score) && Boolean(fixture.away_score)
}

function getTeamInitials(name: string | null): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

function TeamLogo({
  name,
  logo,
}: {
  name: string | null
  logo: string | null
}) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 sm:size-10">
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-[0.65rem] font-bold text-muted-foreground">
          {getTeamInitials(name)}
        </span>
      )}
    </div>
  )
}

function parseScore(value: string | null | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function scoreClass(isLeader: boolean): string {
  return isLeader ? 'text-secondary' : 'text-muted-foreground'
}

export function FixtureRow({ fixture }: { fixture: Fixture }) {
  const status = getFixtureStatus(fixture)
  const showScore = hasScore(fixture)
  const homeName = fixture.team1_name || 'TBC'
  const awayName = fixture.team2_name || 'TBC'
  const homeScore = parseScore(fixture.home_score)
  const awayScore = parseScore(fixture.away_score)
  const homeLeads =
    homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayLeads =
    homeScore !== null && awayScore !== null && awayScore > homeScore

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] items-center gap-2 border-b border-border/70 px-4 py-4 last:border-b-0 sm:gap-3">
      <p className="truncate text-right text-sm font-medium text-foreground/80">
        {homeName}
      </p>

      <TeamLogo name={fixture.team1_name} logo={fixture.team1_logo} />

      <div className="flex w-20 shrink-0 flex-col items-center justify-center sm:w-24">
        {showScore ? (
          <p className="text-lg font-black tabular-nums sm:text-xl">
            <span className={scoreClass(homeLeads)}>{fixture.home_score}</span>
            <span className="mx-1 text-muted-foreground">-</span>
            <span className={scoreClass(awayLeads)}>{fixture.away_score}</span>
          </p>
        ) : (
          <p className="text-base font-bold tabular-nums text-primary sm:text-lg">
            {formatFixtureKickoff(fixture)}
          </p>
        )}
        <p
          className={cn(
            'mt-0.5 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase',
            status === 'live' && 'animate-pulse text-secondary',
          )}
        >
          {formatFixtureStatusLabel(status)}
        </p>
      </div>

      <TeamLogo name={fixture.team2_name} logo={fixture.team2_logo} />

      <p className="truncate text-left text-sm font-medium text-foreground/80">
        {awayName}
      </p>
    </li>
  )
}
