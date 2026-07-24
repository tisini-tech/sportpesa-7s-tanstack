import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'

import { getInitials } from '#/lib/utils'
import { getTopPlayerStatsFn } from '#/data/teams'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  LEAGUE_PLAYER_METRICS,
  resolveLeaguePlayerMetric,
  resolveMetricEventId,
  type LeaguePlayerMetricKey,
} from '#/lib/league-stats'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

function parsePage(value: unknown): number | undefined {
  const raw =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN
  if (!Number.isFinite(raw) || raw < 2) return undefined
  return Math.floor(raw)
}

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/stats/$statsId/players',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    isPoints:
      search.isPoints === true || search.isPoints === 'true' ? true : undefined,
    page: parsePage(search.page),
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, params, deps }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const statsId = params.statsId

    const stats = await getTopPlayerStatsFn({
      data: {
        competitionId: context.competitionId,
        seasonId,
        divisionId,
        eventId: statsId,
        isPoints: deps.search.isPoints ?? false,
        page: deps.search.page,
      },
    })

    return { stats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { seasons, season, division } = legRoute.useRouteContext()
  const { leagueSlug, seasonSlug, legSlug, statsId } = Route.useParams()
  const { isPoints, page } = Route.useSearch()
  const { stats } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const players = stats.items
  const currentPage = page ?? stats.page ?? 1
  const rankOffset = (currentPage - 1) * (stats.page_size || players.length)
  const activeMetric = resolveLeaguePlayerMetric(seasonSlug, statsId, isPoints)
  const metricItems = LEAGUE_PLAYER_METRICS.map((metric) => ({
    value: metric.key,
    label: metric.label,
  }))

  const navigateToMetric = (
    nextLeagueSlug: string,
    nextSeasonSlug: string,
    nextLegSlug: string,
    metricKey: LeaguePlayerMetricKey,
  ) => {
    const metric =
      LEAGUE_PLAYER_METRICS.find((item) => item.key === metricKey) ??
      LEAGUE_PLAYER_METRICS[0]

    navigate({
      to: '/$leagueSlug/$seasonSlug/$legSlug/stats/$statsId/players',
      params: {
        leagueSlug: nextLeagueSlug,
        seasonSlug: nextSeasonSlug,
        legSlug: nextLegSlug,
        statsId: resolveMetricEventId(metric, nextSeasonSlug),
      },
      search: {
        isPoints: metric.isPoints ? true : undefined,
        page: undefined,
      },
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
      value as LeaguePlayerMetricKey,
    )
  }

  const goToPage = (nextPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: nextPage > 1 ? nextPage : undefined,
      }),
    })
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
        emptyMessage="Select a season and leg to view player stats."
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
            {LEAGUE_PLAYER_METRICS.map((metric) => (
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
            {stats.total} {stats.total === 1 ? 'player' : 'players'} ·{' '}
            {division.name}
          </span>
        </div>

        {players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              No player stats yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Leaders for this metric will appear once matches are recorded.
            </p>
          </div>
        ) : (
          <>
            <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <ul className="divide-y divide-border/60">
                {players.map((player, index) => (
                  <li
                    key={player.player_id}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/15 sm:gap-4 sm:px-5"
                  >
                    <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                      {rankOffset + index + 1}
                    </span>

                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                      {player.passportphoto ? (
                        <img
                          src={player.passportphoto}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-[0.65rem] font-bold text-muted-foreground">
                          {getInitials(player.name)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {player.name}
                      </p>
                      {player.team_name ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {player.team_name}
                        </p>
                      ) : null}
                    </div>

                    <span className="shrink-0 text-xl font-bold tabular-nums text-primary sm:text-2xl">
                      {player.total}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {(stats.has_previous || stats.has_next) && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage}
                  {stats.total_pages ? ` of ${stats.total_pages}` : ''}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!stats.has_previous}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeftIcon className="size-4" aria-hidden />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!stats.has_next}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                    <ChevronRightIcon className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
