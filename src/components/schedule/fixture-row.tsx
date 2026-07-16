import { cn } from '#/lib/utils'
import type { Fixture, TeamLogo } from '#/lib/types'
import { getRouteApi, Link } from '@tanstack/react-router'

const legRoute = getRouteApi('/$seasonSlug/$legSlug')

type FixtureStatus = 'live' | 'completed' | 'upcoming'
export type FixtureResult = 'W' | 'D' | 'L'

type FixtureRowProps = {
  fixture: Fixture
  interactive?: boolean
  result?: FixtureResult
  logos?: TeamLogo[]
}

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
    status.includes('played') ||
    status.includes('ended')
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

export function getResultForTeam(
  fixture: Fixture,
  teamId: number,
): FixtureResult | null {
  if (!hasScore(fixture)) return null

  const home = Number(fixture.home_score)
  const away = Number(fixture.away_score)
  if (Number.isNaN(home) || Number.isNaN(away)) return null
  if (home === away) return 'D'

  const isHomeTeam = fixture.team1_id === teamId
  if (isHomeTeam) return home > away ? 'W' : 'L'
  return away > home ? 'W' : 'L'
}

function getTeamInitials(name: string | null): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

function resolveTeamLogo(
  teamId: number,
  teamLogo: string | null | undefined,
  logos?: TeamLogo[],
): string | null {
  if (teamLogo) return teamLogo
  return logos?.find((logo) => logo.team_id === teamId)?.logo ?? null
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

function ResultBadge({ result }: { result: FixtureResult }) {
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ring-1',
        result === 'W' && 'bg-secondary/15 text-secondary ring-secondary/30',
        result === 'D' && 'bg-muted text-muted-foreground ring-border',
        result === 'L' && 'bg-destructive/15 text-destructive ring-destructive/30',
      )}
    >
      {result}
    </span>
  )
}

function FixtureRowContent({
  fixture,
  result,
  logos,
  interactive = true,
}: FixtureRowProps) {
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
  const team1Logo = resolveTeamLogo(
    fixture.team1_id,
    fixture.team1_logo,
    logos,
  )
  const team2Logo = resolveTeamLogo(
    fixture.team2_id,
    fixture.team2_logo,
    logos,
  )

  return (
    <div
      className={cn(
        'grid items-center gap-2 px-4 py-4 sm:gap-3',
        result
          ? 'grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)_auto]'
          : 'grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)]',
        interactive && 'transition-colors hover:bg-muted/20',
      )}
    >
      <p className="truncate text-right text-sm font-medium text-foreground/80">
        {homeName}
      </p>

      <TeamLogo name={fixture.team1_name} logo={team1Logo} />

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

      <TeamLogo name={fixture.team2_name} logo={team2Logo} />

      <p className="truncate text-left text-sm font-medium text-foreground/80">
        {awayName}
      </p>

      {result ? <ResultBadge result={result} /> : null}
    </div>
  )
}

export function FixtureRow({
  fixture,
  interactive = true,
  result,
  logos,
}: FixtureRowProps) {
  if (!interactive) {
    return (
      <li className="border-b border-border/70 last:border-b-0">
        <FixtureRowContent
          fixture={fixture}
          result={result}
          logos={logos}
          interactive={false}
        />
      </li>
    )
  }

  return (
    <FixtureRowLink fixture={fixture} logos={logos} result={result} />
  )
}

function FixtureRowLink({
  fixture,
  logos,
  result,
}: {
  fixture: Fixture
  logos?: TeamLogo[]
  result?: FixtureResult
}) {
  const { seasonSlug, legSlug } = legRoute.useParams()

  return (
    <li className="border-b border-border/70 last:border-b-0">
      <Link
        to="/$seasonSlug/$legSlug/schedule/$fixtureId"
        params={{ seasonSlug, legSlug, fixtureId: fixture.id.toString() }}
      >
        <FixtureRowContent
          fixture={fixture}
          logos={logos}
          result={result}
          interactive
        />
      </Link>
    </li>
  )
}
