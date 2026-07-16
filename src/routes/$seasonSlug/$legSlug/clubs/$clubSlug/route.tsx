import { TeamHeader } from '#/components/clubs/team-header'
import { getTeamFn } from '#/data/teams'
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

type ClubSearch = {
  teamId?: number
}

export const Route = createFileRoute('/$seasonSlug/$legSlug/clubs/$clubSlug')({
  validateSearch: (search: Record<string, unknown>): ClubSearch => {
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
    const teamId = deps.teamId
    if (teamId == null) {
      throw notFound()
    }

    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()
    const team = await getTeamFn({
      data: {
        seasonId,
        divisionId,
        teamId: teamId.toString(),
      },
    })

    return { team, teamId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { team, teamId } = Route.useLoaderData()
  const { seasonSlug, legSlug, clubSlug } = Route.useParams()

  return (
    <div className="sp-content-shell flex flex-col gap-4 py-6">
      <TeamHeader
        team={team}
        teamId={teamId}
        seasonSlug={seasonSlug}
        legSlug={legSlug}
        clubSlug={clubSlug}
      />

      <Outlet />
    </div>
  )
}
