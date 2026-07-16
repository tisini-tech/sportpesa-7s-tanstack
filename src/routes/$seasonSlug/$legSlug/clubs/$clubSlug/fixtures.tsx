import { CalendarOffIcon } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

import { getTeamFixturesFn } from '#/data/teams'
import { FixtureRow, getResultForTeam } from '#/components/schedule/fixture-row'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/clubs/$clubSlug/fixtures',
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
    const response = await getTeamFixturesFn({
      data: { seasonId, divisionId, teamId: teamId.toString() },
    })
    return {
      fixtures: response.fixtures ?? [],
      logos: response.logos ?? [],
      teamId,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixtures, logos, teamId } = Route.useLoaderData()

  if (fixtures.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
          <CalendarOffIcon className="size-6" aria-hidden />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          No fixtures yet
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Matches for this team will appear here once the schedule is published.
        </p>
      </div>
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <ul>
        {fixtures.map((fixture) => (
          <FixtureRow
            key={fixture.id}
            fixture={fixture}
            logos={logos}
            result={getResultForTeam(fixture, teamId) ?? undefined}
          />
        ))}
      </ul>
    </article>
  )
}
