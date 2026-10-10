import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { DivisionStandingsTable } from '#/components/standings/division-standings-table'
import { OverallStandingsTable } from '#/components/standings/overall-standings-table'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { Loading } from '#/components/error/loading'
import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { getDivisionStandingsFn, getOverallStandingsFn } from '#/data/standings'
import type { CompetitionStanding, Standing } from '#/lib/types'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'
import { cn } from '#/lib/utils'
import { activeStatsDivision, loadStatsSeasonContext, readLeg } from '../-season'

type StandingsView = 'leg' | 'overall'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/standings/',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    leg: readLeg(search),
  }),
  loaderDeps: ({ search }) => ({ leg: search.leg }),
  beforeLoad: async ({ params }) => loadStatsSeasonContext(params),
  loader: async ({ context, deps }) => {
    const { divisionId } = activeStatsDivision(context.season, deps.leg)
    const standings = await getDivisionStandingsFn({
      data: {
        competitionId: context.competitionId,
        seasonId: context.season.id.toString(),
        divisionId: divisionId ?? '',
      },
    })

    return { standings }
  },
  component: StandingsPage,
  pendingComponent: Loading,
  head: () => ({
    meta: [
      {
        title: 'SportPesa 7s | Standings',
      },
    ],
  }),
})

function StandingsPage() {
  const { seasons, season, competitionId } = Route.useRouteContext()
  const { leg } = Route.useSearch()
  const { division, divisionId } = activeStatsDivision(season, leg)
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
  }, [season.id, division?.id])

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: ({
        leagueSlug: nextLeagueSlug,
        seasonSlug: nextSeasonSlug,
        legSlug: nextLegSlug,
      }) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/standings',
          params: {
            leagueSlug: nextLeagueSlug,
            seasonSlug: nextSeasonSlug,
          },
          search: { leg: nextLegSlug },
        })
      },
    })

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

  const stages = standings.stages ?? []

  return (
    <div>
      <TournamentPageHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        division={divisionId ? division : undefined}
        seasonId={season.id}
        divisionId={divisionId ? division?.id : undefined}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        emptyMessage="Select a season and leg to view standings."
      >
        {divisionId ? (
          <div
            className="grid w-full grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5 sm:w-fit"
            role="tablist"
            aria-label="Standings view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === 'leg'}
              onClick={() => setView('leg')}
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
        ) : null}
      </TournamentPageHeader>

      <section className="sp-content-shell space-y-6 py-8">
        {divisionId && view === 'leg' ? (
          <DivisionStandingsTable
            standings={standings.division_standings ?? []}
            matchesPlayed={standings.matches_played}
          />
        ) : divisionId && isLoadingOverall ? (
          <Loading label="Loading overall standings" />
        ) : divisionId ? (
          <OverallStandingsTable
            standings={overall?.overall_standings ?? []}
            divisions={season.divisions}
          />
        ) : stages.length > 0 ? (
          stages.map((stage) => (
            <StageTable key={stage.id} name={stage.name} rows={stage.standings} />
          ))
        ) : (
          <DivisionStandingsTable
            standings={standings.division_standings ?? []}
            matchesPlayed={standings.matches_played}
          />
        )}
      </section>
    </div>
  )
}

function StageTable({ name, rows }: { name: string; rows: Standing[] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader title={name} />
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Standings will appear once matches are complete.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                <th className="px-3 py-2.5 text-left font-semibold sm:px-4">#</th>
                <th className="px-2 py-2.5 text-left font-semibold">Team</th>
                <th className="px-2 py-2.5 text-center font-semibold">P</th>
                <th className="px-2 py-2.5 text-center font-semibold">W</th>
                <th className="px-2 py-2.5 text-center font-semibold">D</th>
                <th className="px-2 py-2.5 text-center font-semibold">L</th>
                <th className="px-2 py-2.5 text-center font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums sm:px-4">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2.5 font-medium text-foreground">
                    {row.team_name}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{row.P}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{row.W}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{row.D}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{row.L}</td>
                  <td className="px-2 py-2.5 text-center font-bold tabular-nums text-primary">
                    {row.Pts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}
