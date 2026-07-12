import { Loader2Icon } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { Fixture } from '#/lib/types'

function formatGameDate(gameDate?: string | null): string {
  if (!gameDate) return 'TBC'

  if (gameDate.includes(' ')) {
    return gameDate.split(' ')[0]
  }

  const parsed = new Date(gameDate)
  if (Number.isNaN(parsed.getTime())) return 'TBC'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function getTeamInitials(name?: string | null): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

const FixtureHeader = ({ details }: { details: Fixture }) => {
  const homeScore = Number(details.home_score)
  const awayScore = Number(details.away_score)
  const homeWin = homeScore > awayScore
  const awayWin = awayScore > homeScore

  const scoreStatus =
    details.game_status === 'ended' || details.game_status === 'FT'
      ? 'FT'
      : (details.minute === 45 || details.minute === 46) &&
          details.game_moment === 'secondhalf'
        ? 'HT'
        : `${details.minute}'`

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/15 px-3 py-2 sm:px-4">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="justify-self-start rounded-md bg-muted/40 px-2 py-1 text-xs font-semibold text-muted-foreground sm:text-sm">
            {details.matchday || details.stage_name || 'Matchday'}
          </div>

          <div className="justify-self-end rounded-md bg-muted/40 px-2 py-1 text-xs font-semibold text-muted-foreground sm:text-sm">
            {formatGameDate(details.game_date)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-4 sm:gap-6 sm:px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 p-1.5 shadow-sm sm:h-16 sm:w-16">
            {details.team1_logo ? (
              <img
                className="h-full w-full object-contain"
                src={details.team1_logo}
                alt={`${details.team1_name} logo`}
              />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {getTeamInitials(details.team1_name)}
              </span>
            )}
          </div>
          <div className="max-w-[12rem] text-center text-sm font-semibold text-foreground sm:text-lg">
            {details.team1_name || 'TBC'}
          </div>
        </div>

        <div className="min-w-[6rem] rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center shadow-sm sm:min-w-[7.5rem] sm:px-4 sm:py-2.5">
          {details.game_status === 'notstarted' ? (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              {details.matchtime || 'Pending'}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1 font-bold tabular-nums text-foreground sm:text-3xl">
                <span
                  className={cn(
                    homeWin ? 'text-secondary' : 'text-muted-foreground',
                  )}
                >
                  {details.home_score}
                </span>
                <span className="font-normal text-muted-foreground">
                  &ndash;
                </span>
                <span
                  className={cn(
                    awayWin ? 'text-secondary' : 'text-muted-foreground',
                  )}
                >
                  {details.away_score}
                </span>
              </div>
              <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
                {scoreStatus}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 p-1.5 shadow-sm sm:h-16 sm:w-16">
            {details.team2_logo ? (
              <img
                className="h-full w-full object-contain"
                src={details.team2_logo}
                alt={`${details.team2_name} logo`}
              />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {getTeamInitials(details.team2_name)}
              </span>
            )}
          </div>
          <div className="max-w-[12rem] text-center text-sm font-semibold text-foreground sm:text-lg">
            {details.team2_name || 'TBC'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FixtureHeader
