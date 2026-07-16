import { getTopTeamStatsFn } from '#/data/teams'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/$seasonSlug/$legSlug/stats/')({
  loader: async ({ context, deps }) => {
    const seasonId = context.season.id.toString()
    const divisionId = context.division.id.toString()

    const eventIds = [33, 60, 58]

    const topTeamStats = await Promise.all(
      eventIds.map(async (eventId) => {
        return getTopTeamStatsFn({
          data: { seasonId, eventId: eventId.toString() },
        })
      }),
    )

    return { topTeamStats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { topTeamStats } = Route.useLoaderData()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1>Stats: Comming Soon!</h1>
      <p className="text-center text-lg">
        We are working hard to bring you the best stats experience possible.
        Please check back soon.
      </p>
      <Link to="/" className="text-blue-500">
        Go back to the home page
      </Link>
    </div>
  )
}
