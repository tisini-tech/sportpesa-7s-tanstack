import { TeamPlayers } from '#/components/clubs/team-players'
import { getPlayersFn } from '#/data/players'
import { createFileRoute } from '@tanstack/react-router'

import { clubSearch } from '../-search'

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/clubs/$clubSlug/',
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
    const players = await getPlayersFn({
      data: {
        competitionId: context.competitionId,
        seasonId: context.season.id.toString(),
        teamId: teamId.toString(),
      },
    })
    return { players }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { players } = Route.useLoaderData()

  return <TeamPlayers players={players} />
}
