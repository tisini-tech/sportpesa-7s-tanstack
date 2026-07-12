import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import {
  FixtureRow,
  getResultForTeam,
} from '#/components/schedule/fixture-row'
import { getFixtureH2HFn } from '#/data/fixtures'
import type { Fixture, TeamLogo } from '#/lib/types'
import { Route as MatchLayoutRoute } from './route'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/schedule/$fixtureId/h2h',
)({
  loader: async ({ context, params }) => {
    const h2h = await getFixtureH2HFn({
      data: {
        seasonId: context.season.id.toString(),
        fixtureId: params.fixtureId,
      },
    })
    return { h2h }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { details } = MatchLayoutRoute.useLoaderData()
  const { h2h } = Route.useLoaderData()

  return (
    <div className="space-y-5">
      <FixtureGroupSection
        title={`Recent: ${details.fixture.team1_name}`}
        fixtures={h2h.home}
        focusTeamId={details.fixture.team1_id}
        logos={h2h.logos}
      />

      <FixtureGroupSection
        title={`Recent: ${details.fixture.team2_name}`}
        fixtures={h2h.away}
        focusTeamId={details.fixture.team2_id}
        logos={h2h.logos}
      />

      <FixtureGroupSection
        title="Head to head"
        fixtures={h2h.h2h}
        focusTeamId={details.fixture.team1_id}
        logos={h2h.logos}
      />
    </div>
  )
}

function FixtureGroupSection({
  title,
  fixtures,
  focusTeamId,
  logos,
}: {
  title: string
  fixtures: Fixture[]
  focusTeamId: number
  logos: TeamLogo[]
}) {
  const PAGE_SIZE = 5
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [fixtures])

  if (!fixtures.length) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader title={title} />
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No fixtures available.
        </p>
      </article>
    )
  }

  const visibleFixtures = fixtures.slice(0, visibleCount)
  const hasMore = visibleCount < fixtures.length

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title={title}
        subtitle={`${fixtures.length} matches`}
      />

      <ul>
        {visibleFixtures.map((fixture) => (
          <FixtureRow
            key={`${title}-${fixture.id}`}
            fixture={fixture}
            interactive={false}
            result={getResultForTeam(fixture, focusTeamId) ?? undefined}
            logos={logos}
          />
        ))}
      </ul>

      {hasMore ? (
        <div className="border-t border-border px-4 py-3 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Load more fixtures
          </button>
        </div>
      ) : null}
    </article>
  )
}
