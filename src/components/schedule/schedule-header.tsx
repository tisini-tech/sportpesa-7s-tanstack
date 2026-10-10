import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { isSafariLeague, resolveLeagueBySlug } from '#/lib/leagues'
import type { Division, Season } from '#/lib/types'
import type { ScheduleStage } from '#/components/schedule/schedule-stages'

type ScheduleHeaderProps = {
  leagueSlug: string
  seasons: Season[]
  season?: Season
  seasonId?: number
  division?: Division
  divisionId?: number
  onLeagueChange: (leagueSlug: string) => void
  onSeasonChange: (seasonId: number) => void
  onDivisionChange?: (divisionId: number) => void
}

export function ScheduleHeader({
  leagueSlug,
  seasons,
  season,
  seasonId,
  division,
  divisionId,
  onLeagueChange,
  onSeasonChange,
  onDivisionChange,
}: ScheduleHeaderProps) {
  const league = resolveLeagueBySlug(leagueSlug)
  const safari = league ? isSafariLeague(league) : false

  return (
    <TournamentPageHeader
      leagueSlug={leagueSlug}
      seasons={seasons}
      season={season}
      seasonId={seasonId}
      division={safari ? undefined : division}
      divisionId={safari ? undefined : divisionId}
      onLeagueChange={onLeagueChange}
      onSeasonChange={onSeasonChange}
      onDivisionChange={onDivisionChange}
      showDivisionSelect={!safari}
      banded
      title={safari ? undefined : 'Schedule'}
      subtitle={
        safari || !season
          ? undefined
          : `${season.name} · ${season.divisions.length} ${season.divisions.length === 1 ? 'leg' : 'legs'}`
      }
      emptyMessage="Select a season to view fixtures."
    />
  )
}

export type { ScheduleStage }
