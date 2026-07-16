import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { ClubsGrid } from '#/components/clubs/clubs-grid'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { getTeamsFn } from '#/data/teams'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'

const rootRoute = getRouteApi('__root__')
const legRoute = getRouteApi('/$seasonSlug/$legSlug')

export const Route = createFileRoute('/$seasonSlug/$legSlug/clubs/')({
  loader: async ({ context }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const teams = await getTeamsFn({ data: { seasonId, divisionId } })
    return { teams }
  },
  component: ClubsPage,
})

function ClubsPage() {
  const { seasons } = rootRoute.useRouteContext()
  const { season, division } = legRoute.useRouteContext()
  const { teams } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { seasonSlug, legSlug } = Route.useParams()

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    const featured = nextSeason
      ? pickFeaturedDivision(nextSeason.divisions)
      : null

    if (!nextSeason || !featured) return

    navigate({
      to: '/$seasonSlug/$legSlug/clubs',
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
      to: '/$seasonSlug/$legSlug/clubs',
      params: {
        seasonSlug: getSeasonSlug(season),
        legSlug: getLegSlug(nextDivision),
      },
    })
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

        <ClubsGrid teams={teams} seasonSlug={seasonSlug} legSlug={legSlug} />
      </section>
    </div>
  )
}
