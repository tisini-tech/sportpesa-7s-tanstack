import { useEffect, useState } from 'react'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { DivisionStandingsTable } from '#/components/standings/division-standings-table'
import { OverallStandingsTable } from '#/components/standings/overall-standings-table'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { Loading } from '#/components/error/loading'
import {
  getDivisionStandingsFn,
  getOverallStandingsFn,
} from '#/data/standings'
import type { CompetitionStanding } from '#/lib/types'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'

const rootRoute = getRouteApi('__root__')
const legRoute = getRouteApi('/$seasonSlug/$legSlug')

type StandingsView = 'leg' | 'overall'

export const Route = createFileRoute('/$seasonSlug/$legSlug/standings/')({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const standings = await getDivisionStandingsFn({
      data: { seasonId, divisionId },
    })

    return { standings }
  },
  component: StandingsPage,
  pendingComponent: Loading,
})

function StandingsPage() {
  const { seasons } = rootRoute.useRouteContext()
  const { season, division } = legRoute.useRouteContext()
  const { standings } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const [view, setView] = useState<StandingsView>('leg')
  const [overall, setOverall] = useState<CompetitionStanding | null>(null)
  const [overallSeasonId, setOverallSeasonId] = useState<number | null>(null)
  const [isLoadingOverall, setIsLoadingOverall] = useState(false)

  useEffect(() => {
    setView('leg')
    setOverall(null)
    setOverallSeasonId(null)
  }, [season.id, division.id])

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    navigate({
      to: '/$seasonSlug/$legSlug/standings',
      params: {
        seasonSlug: getSeasonSlug(nextSeason),
        legSlug: getLegSlug(featured.division),
      },
    })
  }

  const handleDivisionChange = (nextDivisionId: number) => {
    const nextDivision = season.divisions.find(
      (item) => item.id === nextDivisionId,
    )
    if (!nextDivision) return

    navigate({
      to: '/$seasonSlug/$legSlug/standings',
      params: {
        seasonSlug: getSeasonSlug(season),
        legSlug: getLegSlug(nextDivision),
      },
    })
  }

  const showLegStandings = () => {
    setView('leg')
  }

  const showOverallStandings = async () => {
    setView('overall')

    if (overall && overallSeasonId === season.id) return

    setIsLoadingOverall(true)
    try {
      const next = await getOverallStandingsFn({
        data: { seasonId: season.id.toString() },
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
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
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
