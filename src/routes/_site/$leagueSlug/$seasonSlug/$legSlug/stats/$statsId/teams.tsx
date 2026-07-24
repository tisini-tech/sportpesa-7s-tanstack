import { ArrowLeftIcon } from 'lucide-react'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'

import { getInitials } from '#/lib/utils'
import { getTopTeamStatsFn } from '#/data/teams'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  LEAGUE_TEAM_METRICS,
  resolveLeagueTeamMetric,
  resolveMetricEventId,
  type LeagueTeamMetricKey,
} from '#/lib/league-stats'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/stats/$statsId/teams',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    isPoints:
      search.isPoints === true || search.isPoints === 'true' ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, params, deps }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const statsId = params.statsId

    const stats = await getTopTeamStatsFn({
      data: {
        competitionId: context.competitionId,
        seasonId,
        divisionId,
        eventId: statsId,
        isPoints: deps.search.isPoints ?? false,
      },
    })

    return { stats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { seasons, season, division } = legRoute.useRouteContext()
  const { leagueSlug, seasonSlug, legSlug, statsId } = Route.useParams()
  const { isPoints } = Route.useSearch()
  const { stats } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const activeMetric = resolveLeagueTeamMetric(seasonSlug, statsId, isPoints)
  const metricItems = LEAGUE_TEAM_METRICS.map((metric) => ({
    value: metric.key,
    label: metric.label,
  }))

  const navigateToMetric = (
    nextLeagueSlug: string,
    nextSeasonSlug: string,
    nextLegSlug: string,
    metricKey: LeagueTeamMetricKey,
  ) => {
    const metric =
      LEAGUE_TEAM_METRICS.find((item) => item.key === metricKey) ??
      LEAGUE_TEAM_METRICS[0]

    navigate({
      to: '/$leagueSlug/$seasonSlug/$legSlug/stats/$statsId/teams',
      params: {
        leagueSlug: nextLeagueSlug,
        seasonSlug: nextSeasonSlug,
        legSlug: nextLegSlug,
        statsId: resolveMetricEventId(metric, nextSeasonSlug),
      },
      search: { isPoints: metric.isPoints ? true : undefined },
    })
  }

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
        navigateToMetric(
          nextLeagueSlug,
          nextSeasonSlug,
          nextLegSlug,
          activeMetric.key,
        )
      },
    })

  const handleMetricChange = (value: string | null) => {
    if (!value) return
    navigateToMetric(
      leagueSlug,
      seasonSlug,
      legSlug,
      value as LeagueTeamMetricKey,
    )
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
        emptyMessage="Select a season and leg to view teams stats."
      >
        <Select
          value={activeMetric.key}
          items={metricItems}
          onValueChange={handleMetricChange}
        >
          <SelectTrigger className="w-full min-w-0 border-border bg-background sm:min-w-[12rem]">
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            {LEAGUE_TEAM_METRICS.map((metric) => (
              <SelectItem key={metric.key} value={metric.key}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TournamentPageHeader>

      <section className="sp-content-shell py-8">
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Link
            to="/$leagueSlug/$seasonSlug/$legSlug/stats"
            params={{ leagueSlug, seasonSlug, legSlug }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            All stats
          </Link>

          <span className="hidden text-border sm:inline" aria-hidden>
            |
          </span>

          <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            {activeMetric.label}
          </h1>

          <span className="text-xs text-muted-foreground">
            {stats.length} {stats.length === 1 ? 'team' : 'teams'} ·{' '}
            {division.name}
          </span>
        </div>

        {stats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              No team stats yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Leaders for this metric will appear once matches are recorded.
            </p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <ul className="divide-y divide-border/60">
              {stats.map((team, index) => (
                <li
                  key={team.team_id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/15 sm:gap-4 sm:px-5"
                >
                  <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>

                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                    {team.team_logo ? (
                      <img
                        src={team.team_logo}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-[0.65rem] font-bold text-muted-foreground">
                        {getInitials(team.team_name)}
                      </span>
                    )}
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground sm:text-base">
                    {team.team_name}
                  </span>

                  <span className="shrink-0 text-xl font-bold tabular-nums text-primary sm:text-2xl">
                    {team.total}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </div>
  )
}
