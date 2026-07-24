import { useEffect, useState } from 'react'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { DivisionStandingsTable } from '#/components/standings/division-standings-table'
import { OverallStandingsTable } from '#/components/standings/overall-standings-table'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { Loading } from '#/components/error/loading'
import {
  getDivisionStandingsFn,
  getOverallStandingsFn,
} from '#/data/standings'
import type { CompetitionStanding } from '#/lib/types'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'
import { cn } from '#/lib/utils'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

type StandingsView = 'leg' | 'overall'

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/$legSlug/standings/')({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const standings = await getDivisionStandingsFn({
      data: {
        competitionId: context.competitionId,
        seasonId,
        divisionId,
      },
    })

    return { standings }
  },
  component: StandingsPage,
  pendingComponent: Loading,
})

function StandingsPage() {
  const { seasons, season, division, competitionId } = legRoute.useRouteContext()
  const { standings } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { leagueSlug } = Route.useParams()

  const [view, setView] = useState<StandingsView>('leg')
  const [overall, setOverall] = useState<CompetitionStanding | null>(null)
  const [overallSeasonId, setOverallSeasonId] = useState<number | null>(null)
  const [isLoadingOverall, setIsLoadingOverall] = useState(false)

  useEffect(() => {
    setView('leg')
    setOverall(null)
    setOverallSeasonId(null)
  }, [season.id, division.id])

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: (params) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/$legSlug/standings',
          params,
        })
      },
    })

  const showLegStandings = () => {
    setView('leg')
  }

  const showOverallStandings = async () => {
    setView('overall')

    if (overall && overallSeasonId === season.id) return

    setIsLoadingOverall(true)
    try {
      const next = await getOverallStandingsFn({
        data: {
          competitionId,
          seasonId: season.id.toString(),
        },
      })
      setOverall(next)
      setOverallSeasonId(season.id)
    } finally {
      setIsLoadingOverall(false)
    }
  }

  return (
    <div>
      <TournamentPageHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        emptyMessage="Select a season and leg to view standings."
      >
        <div
          className="grid w-full grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5 sm:w-fit"
          role="tablist"
          aria-label="Standings view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'leg'}
            onClick={showLegStandings}
            className={cn(
              'rounded-lg px-4 py-2 text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors',
              view === 'leg'
                ? 'bg-secondary/15 text-secondary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            Leg
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'overall'}
            onClick={() => {
              void showOverallStandings()
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors',
              view === 'overall'
                ? 'bg-secondary/15 text-secondary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            Overall
          </button>
        </div>
      </TournamentPageHeader>

      <section className="sp-content-shell py-8">
        {view === 'leg' ? (
          <DivisionStandingsTable
            standings={standings.division_standings ?? []}
            matchesPlayed={standings.matches_played}
          />
        ) : isLoadingOverall ? (
          <Loading label="Loading overall standings" />
        ) : (
          <OverallStandingsTable
            standings={overall?.overall_standings ?? []}
          />
        )}
      </section>
    </div>
  )
}
