import { TeamHeader } from '#/components/clubs/team-header'
import { getTeamFn } from '#/data/teams'
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import { loadStatsSeasonContext } from '../../-season'
import { clubSearch } from '../-search'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/clubs/$clubSlug',
)({
  validateSearch: clubSearch,
  loaderDeps: ({ search }) => ({
    teamId: search.teamId,
  }),
  beforeLoad: async ({ params }) => loadStatsSeasonContext(params),
  loader: async ({ context, deps }) => {
    const teamId = deps.teamId
    if (teamId == null) {
      throw notFound()
    }

    const team = await getTeamFn({
      data: {
        competitionId: context.competitionId,
        seasonId: context.season.id.toString(),
        teamId: teamId.toString(),
      },
    })

    return { team, teamId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { team, teamId } = Route.useLoaderData()
  const { leagueSlug, seasonSlug, clubSlug } = Route.useParams()
  const { leg } = Route.useSearch()

  return (
    <div className="sp-content-shell flex flex-col gap-4 py-6">
      <TeamHeader
        team={team}
        teamId={teamId}
        leagueSlug={leagueSlug}
        seasonSlug={seasonSlug}
        legSlug={leg}
        clubSlug={clubSlug}
      />

      <Outlet />
    </div>
  )
}
