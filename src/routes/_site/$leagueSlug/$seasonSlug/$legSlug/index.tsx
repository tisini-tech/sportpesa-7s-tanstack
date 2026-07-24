import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'

import { DivisionPools } from '#/components/landing/division-pools'
import { HeroSection } from '#/components/landing/hero'
import { LegStrip } from '#/components/landing/legs-strip'
import { VideosSection } from '#/components/landing/videos'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/',
)({
  component: Home,
})

function Home() {
  const { seasons, season, division, competitionId } =
    legRoute.useRouteContext()
  const { leagueSlug } = Route.useParams()
  const navigate = Route.useNavigate()

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
          seasonId={season.id.toString()}
          divisionId={division.id.toString()}
        />
      </Suspense>

      <VideosSection data={seasons} />
    </div>
  )
}
