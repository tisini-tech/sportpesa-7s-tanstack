import { createFileRoute } from '@tanstack/react-router'

import { ClubsGrid } from '#/components/clubs/clubs-grid'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { getTeamsFn } from '#/data/teams'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'
import { activeStatsDivision, loadStatsSeasonContext, readLeg } from '../-season'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/clubs/',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    leg: readLeg(search),
  }),
  loaderDeps: ({ search }) => ({ leg: search.leg }),
  beforeLoad: async ({ params }) => loadStatsSeasonContext(params),
  loader: async ({ context, deps }) => {
    const { divisionId } = activeStatsDivision(context.season, deps.leg)
    const teams = await getTeamsFn({
      data: {
        competitionId: context.competitionId,
        seasonId: context.season.id.toString(),
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
  const { seasons, season } = Route.useRouteContext()
  const { leg } = Route.useSearch()
  const { division, divisionId, legSlug } = activeStatsDivision(season, leg)
  const { teams } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { leagueSlug, seasonSlug } = Route.useParams()

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
          to: '/$leagueSlug/$seasonSlug/clubs',
          params: {
            leagueSlug: nextLeagueSlug,
            seasonSlug: nextSeasonSlug,
          },
          search: { leg: nextLegSlug },
        })
      },
    })

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
        emptyMessage="Select a season and leg to view clubs."
      />

      <section className="sp-content-shell py-8">
        <div className="mb-5">
          <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Clubs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {teams.length} {teams.length === 1 ? 'club' : 'clubs'}
            {divisionId ? ' in this leg' : ''}
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
