import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import type { Season } from '#/lib/types'
import type { ScheduleStage } from '#/components/schedule/schedule-stages'

type ScheduleHeaderProps = {
  leagueSlug: string
  seasons: Season[]
  season?: Season
  seasonId?: number
  onLeagueChange: (leagueSlug: string) => void
  onSeasonChange: (seasonId: number) => void
}

export function ScheduleHeader({
  leagueSlug,
  seasons,
  season,
  seasonId,
  onLeagueChange,
  onSeasonChange,
}: ScheduleHeaderProps) {
  return (
    <TournamentPageHeader
      leagueSlug={leagueSlug}
      seasons={seasons}
      season={season}
      seasonId={seasonId}
      onLeagueChange={onLeagueChange}
      onSeasonChange={onSeasonChange}
      showDivisionSelect={false}
      banded
      title="Schedule"
      subtitle={
        season
          ? `${season.name} · ${season.divisions.length} legs`
          : undefined
      }
      emptyMessage="Select a season to view fixtures."
    />
  )
}

export type { ScheduleStage }
