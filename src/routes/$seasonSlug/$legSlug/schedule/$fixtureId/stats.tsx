import { createFileRoute } from '@tanstack/react-router'
import { Route as MatchLayoutRoute } from './route'
import { TeamStats } from '#/components/schedule/stats/stats'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/schedule/$fixtureId/stats',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { details } = MatchLayoutRoute.useLoaderData()

  return <TeamStats home={details.stats.home} away={details.stats.away} />
}
