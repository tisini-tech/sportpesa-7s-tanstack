import { TeamStatsCards } from '#/components/clubs/team-stats'
import { getTeamStatsFn } from '#/data/teams'
import { createFileRoute } from '@tanstack/react-router'

import { clubSearch } from '../-search'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/clubs/$clubSlug/stats',
)({
  validateSearch: clubSearch,
  loaderDeps: ({ search }) => ({
    teamId: search.teamId,
  }),
  loader: async ({ context, deps }) => {
    const teamId = deps.teamId
    if (!teamId) {
      throw new Error('Team ID is required')
    }
    const stats = await getTeamStatsFn({
      data: {
        competitionId: context.competitionId,
        seasonId: context.season.id.toString(),
        teamId: teamId.toString(),
      },
    })
    return { stats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { stats } = Route.useLoaderData()

  return <TeamStatsCards data={stats} />
}
