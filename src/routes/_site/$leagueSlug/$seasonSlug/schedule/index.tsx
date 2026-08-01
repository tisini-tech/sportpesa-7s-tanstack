import { createFileRoute } from '@tanstack/react-router'

import {
  getDivisionStatus,
  pickFeaturedDivision,
} from '#/components/landing/division-utils'
import { getFixturesFn } from '#/data/fixtures'
import { getGroupStandingsFn } from '#/data/standings'
import { ScheduleHeader } from '#/components/schedule/schedule-header'
import { LegScheduleSection } from '#/components/schedule/leg-schedule-section'
import { useTournamentNavigation } from '#/hooks/use-tournament-navigation'
import type { Division, Fixture, StageStanding } from '#/lib/types'
import { loadScheduleSeasonContext } from './load-context'

function divisionStartTime(division: Division): number {
  if (!division.date_from) return Number.POSITIVE_INFINITY
  const time = new Date(division.date_from).getTime()
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

/** Active leg first, then remaining legs by date_from. */
function sortLegsForSchedule<T extends { division: Division }>(legs: T[]): T[] {
  const featured = pickFeaturedDivision(legs.map((leg) => leg.division))
  const featuredId = featured?.division.id

  return [...legs].sort((a, b) => {
    if (featuredId != null) {
      if (a.division.id === featuredId) return -1
      if (b.division.id === featuredId) return 1
    }

    const statusRank = (division: Division) => {
      const status = getDivisionStatus(division)
      if (status === 'live') return 0
      if (status === 'upcoming') return 1
      return 2
    }

    const rankDiff = statusRank(a.division) - statusRank(b.division)
    if (rankDiff !== 0) return rankDiff

    const aStart = divisionStartTime(a.division)
    const bStart = divisionStartTime(b.division)

    // Upcoming: soonest first. Completed: most recent first.
    if (getDivisionStatus(a.division) === 'completed') {
      return bStart - aStart
    }

    return aStart - bStart
  })
}

export const Route = createFileRoute(
  '/_site/$leagueSlug/$seasonSlug/schedule/',
)({
  // Same-route beforeLoad avoids parent/child context races on first navigation.
  beforeLoad: async ({ params }) => loadScheduleSeasonContext(params),
  loader: async ({ context }) => {
    const season = context.season
    const competitionId = context.competitionId
    if (!season || !competitionId) {
      throw new Error('Schedule season context is missing')
    }

    const seasonId = season.id.toString()
    const divisions = [...season.divisions]

    const legs = await Promise.all(
      divisions.map(async (division) => {
        const divisionId = division.id.toString()
        const [fixtures, standings] = await Promise.all([
          getFixturesFn({
            data: { competitionId, seasonId, divisionId },
          }).catch(() => [] as Fixture[]),
          getGroupStandingsFn({
            data: { competitionId, seasonId, divisionId },
          }).catch(() => [] as StageStanding[]),
        ])

        return { division, fixtures, standings }
      }),
    )

    return { legs: sortLegsForSchedule(legs) }
  },
  component: ScheduleLayout,
  head: () => ({
    meta: [
      {
        title: 'SportPesa 7s | Schedule',
      },
    ],
  }),
})

function ScheduleLayout() {
  const { seasons, season } = Route.useRouteContext()
  const { legs } = Route.useLoaderData()
  const { leagueSlug } = Route.useParams()
  const navigate = Route.useNavigate()

  const { handleLeagueChange, handleSeasonChange } = useTournamentNavigation({
    leagueSlug,
    seasons,
    season,
    onNavigate: (params) => {
      navigate({
        to: '/$leagueSlug/$seasonSlug/schedule',
        params: {
          leagueSlug: params.leagueSlug,
          seasonSlug: params.seasonSlug,
        },
      })
    },
  })

  const legNumberById = new Map(
    [...season.divisions].map((division, index) => [division.id, index + 1]),
  )

  return (
    <div>
      <ScheduleHeader
        leagueSlug={leagueSlug}
        seasons={seasons}
        season={season}
        seasonId={season.id}
        onLeagueChange={handleLeagueChange}
        onSeasonChange={handleSeasonChange}
      />

      {legs.length === 0 ? (
        <section className="sp-content-shell py-8">
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No legs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule sections will appear once legs are published for this
              season.
            </p>
          </div>
        </section>
      ) : (
        legs.map((leg) => (
          <LegScheduleSection
            key={leg.division.id}
            leg={leg}
            legNumber={legNumberById.get(leg.division.id) ?? leg.division.order}
          />
        ))
      )}
    </div>
  )
}
