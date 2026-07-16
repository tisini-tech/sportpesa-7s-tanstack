import { TeamStatsCards } from '#/components/clubs/team-stats'
import { getTeamStatsFn } from '#/data/teams'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/clubs/$clubSlug/stats',
)({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.teamId
    const teamId =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? Number(raw)
          : undefined
    return {
      teamId: teamId != null && !Number.isNaN(teamId) ? teamId : undefined,
    }
  },
  loaderDeps: ({ search }) => ({
    teamId: search.teamId,
  }),
  loader: async ({ context, deps }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const teamId = deps.teamId
    if (!teamId) {
      throw new Error('Team ID is required')
    }
    const stats = await getTeamStatsFn({
      data: { seasonId, divisionId, teamId: teamId.toString() },
    })
    return { stats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { stats } = Route.useLoaderData()

  return <TeamStatsCards data={stats} />
}
