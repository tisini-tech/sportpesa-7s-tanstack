import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense } from 'react'

import { CompetitionPools } from '#/components/landing/competition-pools'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { LegStrip } from '#/components/landing/legs-strip'
import { MatchesToday } from '#/components/landing/matches'
import NewHero from '#/components/landing/new-hero'
import { StatsGlimpse } from '#/components/landing/stats-glimpse'
import { StandingsSnippet } from '#/components/landing/standings'
import { VideosSection } from '#/components/landing/videos'
import { competitionPoolsQueryOptions } from '#/data/competition-pools'
import { fixturesQueryOptions } from '#/data/fixtures'
import { getSeasonsFn } from '#/data/seasons'
import { divisionStandingsQueryOptions } from '#/data/standings'
import { leagueStatsGlimpseQueryOptions } from '#/data/teams'
import {
  isSafariLeague,
  isSyntheticDivision,
  materializeSeasons,
  resolveLeagueBySlug,
} from '#/lib/leagues'
import {
  getLegSlug,
  getSeasonSlug,
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

type SeasonSearch = {
  leg?: string
}

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/')({
  validateSearch: (search: Record<string, unknown>): SeasonSearch => ({
    leg: typeof search.leg === 'string' ? search.leg : undefined,
  }),
  loaderDeps: ({ search }) => ({ leg: search.leg }),
  loader: async ({ context, params, deps }) => {
    const league = resolveLeagueBySlug(params.leagueSlug)
    if (!league) return

    let rawSeasons
    try {
      rawSeasons = await getSeasonsFn({
        data: { id: String(league.id) },
      })
    } catch {
      return
    }

    context.queryClient.setQueryData(['league-seasons', league.id], rawSeasons)

    const seasons = materializeSeasons(rawSeasons, league)
    const season = resolveSeasonBySlug(seasons, params.seasonSlug)
    if (!season) return

    const division =
      (deps.leg ? resolveDivisionBySlug(season, deps.leg) : undefined) ??
      pickFeaturedDivision(season.divisions)?.division
    const competitionId = String(league.id)
    const seasonId = String(season.id)
    const divisionId =
      division && !isSyntheticDivision(division.id) ? String(division.id) : ''

    void context.queryClient.prefetchQuery(
      competitionPoolsQueryOptions({
        competitionId,
        seasonId,
        divisionId: divisionId || undefined,
        stages: isSafariLeague(league) ? (season.stages ?? []) : [],
      }),
    )
    void context.queryClient.prefetchQuery(
      fixturesQueryOptions(competitionId, seasonId, divisionId),
    )
    void context.queryClient.prefetchQuery(
      divisionStandingsQueryOptions(competitionId, seasonId, divisionId),
    )
    void context.queryClient.prefetchQuery(
      leagueStatsGlimpseQueryOptions(
        competitionId,
        seasonId,
        params.seasonSlug,
      ),
    )
  },
  component: SeasonLanding,
})

function SeasonLanding() {
  const { leagueSlug, seasonSlug } = Route.useParams()
  const { leg: legSlug } = Route.useSearch()
  const navigate = useNavigate()
  const league = resolveLeagueBySlug(leagueSlug)

  const seasonsQuery = useQuery({
    queryKey: ['league-seasons', league?.id],
    enabled: Boolean(league),
    queryFn: () =>
      getSeasonsFn({
        data: { id: String(league!.id) },
      }),
  })

  const seasons = league
    ? materializeSeasons(seasonsQuery.data ?? [], league)
    : []
  const season = resolveSeasonBySlug(seasons, seasonSlug)
  const featured = season ? pickFeaturedDivision(season.divisions) : null
  const divisionFromUrl =
    season && legSlug ? resolveDivisionBySlug(season, legSlug) : undefined
  const division =
    season?.divisions.find((item) => item.id === divisionFromUrl?.id) ??
    featured?.division ??
    null
  const activeDivisionId = division?.id ?? null
  const showLegs = Boolean(
    league && season && !isSafariLeague(league) && season.divisions.length > 1,
  )

  return (
    <div>
      <NewHero />

      {showLegs && season ? (
        <LegStrip
          legsOnly
          leagueSlug={leagueSlug}
          seasons={seasons}
          season={season}
          divisions={season.divisions}
          activeDivisionId={activeDivisionId}
          onSelectLeague={async (nextLeagueSlug) => {
            const nextLeague = resolveLeagueBySlug(nextLeagueSlug)
            if (!nextLeague) return
            const nextSeasons = materializeSeasons(
              await getSeasonsFn({ data: { id: String(nextLeague.id) } }),
              nextLeague,
            )
            const nextSeason = nextSeasons[0]
            if (!nextSeason) return
            await navigate({
              to: '/$leagueSlug/$seasonSlug',
              params: {
                leagueSlug: nextLeague.slug,
                seasonSlug: getSeasonSlug(nextSeason),
              },
              search: {},
            })
          }}
          onSelectSeason={(seasonId) => {
            const nextSeason = seasons.find((item) => item.id === seasonId)
            if (!nextSeason) return
            void navigate({
              to: '/$leagueSlug/$seasonSlug',
              params: {
                leagueSlug,
                seasonSlug: getSeasonSlug(nextSeason),
              },
              search: {},
            })
          }}
          onSelectDivision={(divisionId) => {
            const division = season.divisions.find(
              (item) => item.id === divisionId,
            )
            if (!division) return
            void navigate({
              to: '/$leagueSlug/$seasonSlug',
              params: { leagueSlug, seasonSlug },
              search: { leg: getLegSlug(division) },
            })
          }}
        />
      ) : null}

      {league && season ? (
        <Suspense
          fallback={
            <section className="sp-content-shell py-8">
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Loading pools…</p>
              </div>
            </section>
          }
        >
          <CompetitionPools
            competitionId={String(league.id)}
            seasonId={String(season.id)}
            divisionId={
              division && !isSyntheticDivision(division.id)
                ? String(division.id)
                : undefined
            }
            leagueSlug={leagueSlug}
            seasonSlug={seasonSlug}
            legSlug={
              division && !isSyntheticDivision(division.id)
                ? getLegSlug(division)
                : undefined
            }
            stages={isSafariLeague(league) ? (season.stages ?? []) : []}
          />
        </Suspense>
      ) : null}

      {league && season && division ? (
        <Suspense
          fallback={
            <section className="sp-content-shell py-8">
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Loading standings & fixtures…
                </p>
              </div>
            </section>
          }
        >
          <section className="sp-content-shell py-8">
            <div className="grid gap-4 lg:grid-cols-2">
              <StandingsSnippet
                competitionId={String(league.id)}
                seasonId={String(season.id)}
                divisionId={
                  isSyntheticDivision(division.id) ? '' : String(division.id)
                }
                leagueSlug={leagueSlug}
                seasonSlug={seasonSlug}
                legSlug={
                  isSyntheticDivision(division.id)
                    ? undefined
                    : getLegSlug(division)
                }
              />

              <MatchesToday
                competitionId={String(league.id)}
                seasonId={String(season.id)}
                divisionId={
                  isSyntheticDivision(division.id) ? '' : String(division.id)
                }
                leagueSlug={leagueSlug}
                seasonSlug={seasonSlug}
              />
            </div>
          </section>
        </Suspense>
      ) : null}

      {league && season ? (
        <Suspense
          fallback={
            <section className="sp-content-shell py-8">
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Loading stats…</p>
              </div>
            </section>
          }
        >
          <StatsGlimpse
            competitionId={String(league.id)}
            seasonId={String(season.id)}
            seasonSlug={seasonSlug}
            leagueSlug={leagueSlug}
            legSlug={
              division && !isSyntheticDivision(division.id)
                ? getLegSlug(division)
                : undefined
            }
          />
        </Suspense>
      ) : null}

      {league && season ? (
        <VideosSection
          data={seasons}
          leagueSlug={leagueSlug}
          seasonSlug={seasonSlug}
          legSlug={
            division && !isSyntheticDivision(division.id)
              ? getLegSlug(division)
              : undefined
          }
        />
      ) : null}
    </div>
  )
}
