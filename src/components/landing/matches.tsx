import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { fixturesQueryOptions } from '#/data/fixtures'
import type { Fixture } from '#/lib/types'
import { cn } from '#/lib/utils'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

function formatLocalYmd(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatFixtureKickoff(fixture: Fixture): string {
  if (fixture.matchtime) {
    const match = fixture.matchtime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
    return fixture.matchtime
  }

  if (!fixture.game_date) return 'TBC'

  const parsed = new Date(fixture.game_date)
  if (Number.isNaN(parsed.getTime())) return 'TBC'

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

function formatMatchDayLabel(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}

function getFixtureDateKey(fixture: Fixture): string {
  return (fixture.game_date ?? '').slice(0, 10)
}

function sortByKickoffAsc(a: Fixture, b: Fixture): number {
  const aDate = getFixtureDateKey(a)
  const bDate = getFixtureDateKey(b)
  if (aDate !== bDate) return aDate.localeCompare(bDate)
  const aTime = a.matchtime || a.game_date || ''
  const bTime = b.matchtime || b.game_date || ''
  return aTime.localeCompare(bTime)
}

function sortByKickoffDesc(a: Fixture, b: Fixture): number {
  return sortByKickoffAsc(b, a)
}

function isCompleted(fixture: Fixture): boolean {
  const status = (fixture.game_status ?? '').toLowerCase()
  return (
    status.includes('finish') ||
    status.includes('complete') ||
    status.includes('ft') ||
    status.includes('played') ||
    status.includes('ended')
  )
}

function isUpcoming(fixture: Fixture): boolean {
  const status = (fixture.game_status ?? '').toLowerCase()
  if (isCompleted(fixture)) return false
  if (
    status.includes('live') ||
    status.includes('playing') ||
    status.includes('progress')
  ) {
    return false
  }
  return true
}

function pickSnippetFixtures(
  fixtures: Fixture[],
  limit: number,
): {
  fixtures: Fixture[]
  title: string
  subtitle: string
  emptyLabel: string
} {
  const today = formatLocalYmd(new Date())
  const todayFixtures = fixtures
    .filter((fixture) => getFixtureDateKey(fixture) === today)
    .sort(sortByKickoffAsc)

  if (todayFixtures.length > 0) {
    return {
      fixtures: todayFixtures.slice(0, limit),
      title: 'Matches',
      subtitle: "Today's fixtures",
      emptyLabel: 'No matches scheduled for today',
    }
  }

  const completed = fixtures.filter(isCompleted).sort(sortByKickoffDesc)
  if (completed.length > 0) {
    const latestDay = getFixtureDateKey(completed[0]!)
    return {
      fixtures: completed.slice(0, limit),
      title: 'Matches',
      subtitle: latestDay
        ? `Latest results · ${formatMatchDayLabel(latestDay)}`
        : 'Latest results',
      emptyLabel: 'No results yet for this leg',
    }
  }

  const upcoming = fixtures.filter(isUpcoming).sort(sortByKickoffAsc)
  if (upcoming.length > 0) {
    const nextDay = getFixtureDateKey(upcoming[0]!)
    return {
      fixtures: upcoming.slice(0, limit),
      title: 'Matches',
      subtitle: nextDay
        ? `Upcoming · ${formatMatchDayLabel(nextDay)}`
        : 'Upcoming fixtures',
      emptyLabel: 'No matches scheduled for this leg',
    }
  }

  return {
    fixtures: [],
    title: 'Matches',
    subtitle: 'Fixtures',
    emptyLabel: 'No matches scheduled for this leg',
  }
}

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function MatchesToday({
  competitionId,
  seasonId,
  divisionId,
  limit = 3,
}: {
  competitionId: string
  seasonId: string
  divisionId: string
  limit?: number
}) {
  const { leagueSlug, seasonSlug, legSlug } = legRoute.useParams()
  const { data: allFixtures } = useSuspenseQuery(
    fixturesQueryOptions(competitionId, seasonId, divisionId),
  )

  const snippet = pickSnippetFixtures(allFixtures, limit)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader title={snippet.title} subtitle={snippet.subtitle} />

      {snippet.fixtures.length > 0 ? (
        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border/60">
          {snippet.fixtures.map((fixture) => (
            <li key={fixture.id} className="flex min-h-0 flex-1">
              <MatchSnippetRow
                fixture={fixture}
                leagueSlug={leagueSlug}
                seasonSlug={seasonSlug}
                legSlug={legSlug}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
          {snippet.emptyLabel}
        </div>
      )}

      <div className="mt-auto border-t border-border bg-muted/15 px-4 py-3">
        <Link
          to="/$leagueSlug/$seasonSlug/$legSlug/schedule"
          params={{ leagueSlug, seasonSlug, legSlug }}
          className={cn(
            'inline-flex rounded-full border border-primary/40 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase hover:bg-primary/5',
          )}
        >
          View more »
        </Link>
      </div>
    </article>
  )
}

function MatchSnippetRow({
  fixture,
  leagueSlug,
  seasonSlug,
  legSlug,
}: {
  fixture: Fixture
  leagueSlug: string
  seasonSlug: string
  legSlug: string
}) {
  const upcoming = isUpcoming(fixture)
  const homeScore = Number(fixture.home_score)
  const awayScore = Number(fixture.away_score)
  const hasScores =
    fixture.home_score != null &&
    fixture.home_score !== '' &&
    fixture.away_score != null &&
    fixture.away_score !== '' &&
    !Number.isNaN(homeScore) &&
    !Number.isNaN(awayScore)
  const homeWins = hasScores && homeScore > awayScore
  const awayWins = hasScores && awayScore > homeScore

  return (
    <Link
      to="/$leagueSlug/$seasonSlug/$legSlug/schedule/$fixtureId"
      params={{
        leagueSlug,
        seasonSlug,
        legSlug,
        fixtureId: fixture.id.toString(),
      }}
      className="flex h-full w-full items-center gap-2.5 px-3 py-3 transition-colors hover:bg-muted/20 sm:gap-3 sm:px-4"
    >
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-sm font-medium text-foreground/85">
          {fixture.team1_name || 'TBC'}
        </span>
        <TeamBadge name={fixture.team1_name} logo={fixture.team1_logo} />
      </div>

      <div className="flex w-16 shrink-0 flex-col items-center justify-center sm:w-20">
        {upcoming ? (
          <span className="text-sm font-bold tabular-nums text-primary">
            {formatFixtureKickoff(fixture)}
          </span>
        ) : (
          <span className="text-base font-bold tabular-nums sm:text-lg">
            <span
              className={
                homeWins ? 'text-primary' : 'text-muted-foreground'
              }
            >
              {fixture.home_score || '0'}
            </span>
            <span className="mx-1 text-muted-foreground">–</span>
            <span
              className={
                awayWins ? 'text-primary' : 'text-muted-foreground'
              }
            >
              {fixture.away_score || '0'}
            </span>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <TeamBadge name={fixture.team2_name} logo={fixture.team2_logo} />
        <span className="truncate text-sm font-medium text-foreground/85">
          {fixture.team2_name || 'TBC'}
        </span>
      </div>
    </Link>
  )
}

function TeamBadge({
  name,
  logo,
}: {
  name: string | null | undefined
  logo: string | null | undefined
}) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 sm:size-9">
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-[0.6rem] font-semibold text-muted-foreground">
          {getTeamInitials(name)}
        </span>
      )}
    </div>
  )
}
