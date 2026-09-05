import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'

import { DivisionPools } from '#/components/landing/division-pools'
import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'
import { MatchesToday } from '#/components/landing/matches'
import { RegisterCampaignBanner } from '#/components/landing/register-campaign-banner'
import { StandingsSnippet } from '#/components/landing/standings'
import { VideosSection } from '#/components/landing/videos'
import { fixturesQueryOptions } from '#/data/fixtures'
import { divisionStandingsQueryOptions } from '#/data/standings'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/',
)({
  loader: async ({ context }) => {
    const competitionId = context.competitionId
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()

    // Prefetch without awaiting so hero / legs / videos stay unblocked.
    void context.queryClient.prefetchQuery(
      divisionStandingsQueryOptions(competitionId, seasonId, divisionId),
    )
    void context.queryClient.prefetchQuery(
      fixturesQueryOptions(competitionId, seasonId, divisionId),
    )
  },
  component: Home,
})

function Home() {
  const { seasons, season, division, competitionId } =
    legRoute.useRouteContext()
  const { leagueSlug } = Route.useParams()
  const navigate = Route.useNavigate()

  const seasonId = season.id.toString()
  const divisionId = division.id.toString()

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: (params) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/$legSlug',
          params,
        })
      },
    })

  return (
    <div>
      <HeroSection
        divisions={season.divisions}
        season={season}
        seasonName={season.name}
        activeDivisionId={division.id}
        leagueSlug={leagueSlug}
      />

      <LegStrip
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        divisions={season.divisions}
        activeDivisionId={division.id}
        onSelectLeague={handleLeagueChange}
        onSelectSeason={handleSeasonChange}
        onSelectDivision={handleDivisionChange}
      />

      <Suspense
        fallback={
          <section className="sp-content-shell py-8">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">Loading pools…</p>
            </div>
          </section>
        }
      >
        <DivisionPools
          competitionId={competitionId}
          seasonId={seasonId}
          divisionId={divisionId}
        />
      </Suspense>

      <RegisterCampaignBanner />

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
              competitionId={competitionId}
              seasonId={seasonId}
              divisionId={divisionId}
            />

            <MatchesToday
              competitionId={competitionId}
              seasonId={seasonId}
              divisionId={divisionId}
            />
          </div>
        </section>
      </Suspense>

      <VideosSection data={seasons} />
    </div>
  )
}
