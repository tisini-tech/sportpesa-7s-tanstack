import { TeamPlayers } from '#/components/clubs/team-players'
import { getPlayersFn } from '#/data/players'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$seasonSlug/$legSlug/clubs/$clubSlug/')({
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
    const teamId = deps.teamId
    if (!teamId) {
      throw new Error('Team ID is required')
    }
    const players = await getPlayersFn({
      data: {
        seasonId,
        divisionId: context.division.id.toString(),
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
