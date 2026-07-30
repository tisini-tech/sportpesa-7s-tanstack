import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { ClubsGrid } from '#/components/clubs/clubs-grid'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { getTeamsFn } from '#/data/teams'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/$legSlug/clubs/',
)({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const teams = await getTeamsFn({
      data: {
        competitionId: context.competitionId,
        seasonId,
        divisionId,
      },
    })
    return { teams }
  },
  component: ClubsPage,
  head: () => ({
    meta: [
      {
        title: 'SportPesa 7s | Clubs',
      },
    ],
  }),
})

function ClubsPage() {
  const { seasons, season, division } = legRoute.useRouteContext()
  const { teams } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { leagueSlug, seasonSlug, legSlug } = Route.useParams()

  const { handleLeagueChange, handleSeasonChange, handleDivisionChange } =
    useTournamentNavigation({
      leagueSlug,
      seasons,
      season,
      onNavigate: (params) => {
        navigate({
          to: '/$leagueSlug/$seasonSlug/$legSlug/clubs',
          params,
        })
      },
    })

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
        emptyMessage="Select a season and leg to view clubs."
      />

      <section className="sp-content-shell py-8">
        <div className="mb-5">
          <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Clubs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {teams.length} {teams.length === 1 ? 'club' : 'clubs'} in this leg
          </p>
        </div>

        <ClubsGrid
          teams={teams}
          leagueSlug={leagueSlug}
          seasonSlug={seasonSlug}
          legSlug={legSlug}
        />
      </section>
    </div>
  )
}
