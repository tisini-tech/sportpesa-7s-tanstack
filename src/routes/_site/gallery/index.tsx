import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react'

import { pickGalleryDivision } from '#/components/landing/division-utils'
import {
  GalleryGrid,
  GalleryGridSkeleton,
} from '#/components/gallery/gallery-grid'
import { TournamentPageHeader } from '#/components/site/tournament-page-header'
import { getSeasonsFn, seasonImagesQueryOptions } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
import {
  getLegSlug,
  getSeasonSlug,
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

/** Gallery photos are only published for Division 1 (competition 238). */
const GALLERY_COMPETITION_ID = String(DEFAULT_LEAGUE.id)

type GallerySearch = {
  season?: string
  leg?: string
}

export const Route = createFileRoute('/_site/gallery/')({
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    season: typeof search.season === 'string' ? search.season : undefined,
    leg: typeof search.leg === 'string' ? search.leg : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const seasons = await getSeasonsFn({
      data: { id: GALLERY_COMPETITION_ID },
    })

    const season =
      (search.season
        ? resolveSeasonBySlug(seasons, search.season)
        : undefined) ?? seasons[0]

    if (!season) {
      throw redirect({ to: '/' })
    }

    const featured = pickGalleryDivision(season.divisions)
    const division =
      (search.leg
        ? resolveDivisionBySlug(season, search.leg)
        : undefined) ?? featured?.division

    if (!division) {
      throw redirect({ to: '/' })
    }

    // Do not throw redirect here to fill search defaults — that races with
    // defaultPendingComponent and can white-screen client navigations.
    return {
      seasons,
      season,
      division,
      competitionId: GALLERY_COMPETITION_ID,
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      seasonImagesQueryOptions(
        context.competitionId,
        context.season.id.toString(),
        context.division.id.toString(),
      ),
    )
  },
  component: GalleryPage,
  head: () => ({
    meta: [{ title: 'SportPesa 7s | Gallery' }],
  }),
})

function GalleryPage() {
  const { seasons, season, division, competitionId } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const seasonSlug = getSeasonSlug(season)
  const legSlug = getLegSlug(division)

  useEffect(() => {
    if (search.season === seasonSlug && search.leg === legSlug) return

    void navigate({
      to: '/gallery',
      search: { season: seasonSlug, leg: legSlug },
      replace: true,
    })
  }, [search.season, search.leg, seasonSlug, legSlug, navigate])

  const handleSeasonChange = (nextSeasonId: number) => {
    const nextSeason = seasons.find((item) => item.id === nextSeasonId)
    if (!nextSeason) return

    const featured = pickGalleryDivision(nextSeason.divisions)
    if (!featured) return

    void navigate({
      to: '/gallery',
      search: {
        season: getSeasonSlug(nextSeason),
        leg: getLegSlug(featured.division),
      },
    })
  }

  const handleDivisionChange = (nextDivisionId: number) => {
    const nextDivision = season.divisions.find(
      (item) => item.id === nextDivisionId,
    )
    if (!nextDivision) return

    void navigate({
      to: '/gallery',
      search: {
        season: getSeasonSlug(season),
        leg: getLegSlug(nextDivision),
      },
    })
  }

  return (
    <div>
      <TournamentPageHeader
        leagueSlug={DEFAULT_LEAGUE.slug}
        seasons={seasons}
        season={season}
        division={division}
        seasonId={season.id}
        divisionId={division.id}
        onSeasonChange={handleSeasonChange}
        onDivisionChange={handleDivisionChange}
        showLeagueSelect={false}
        showDivisionSelect
        banded
        emptyMessage="Select a season and leg to view photos."
      />

      <section className="sp-content-shell py-8">
        <Suspense fallback={<GalleryGridSkeleton />}>
          <GalleryGridContent
            competitionId={competitionId}
            seasonId={season.id.toString()}
            divisionId={division.id.toString()}
            seasonSlug={seasonSlug}
            legSlug={legSlug}
          />
        </Suspense>
      </section>
    </div>
  )
}

function GalleryGridContent({
  competitionId,
  seasonId,
  divisionId,
  seasonSlug,
  legSlug,
}: {
  competitionId: string
  seasonId: string
  divisionId: string
  seasonSlug: string
  legSlug: string
}) {
  const { data: images } = useSuspenseQuery(
    seasonImagesQueryOptions(competitionId, seasonId, divisionId),
  )

  return (
    <GalleryGrid
      images={images}
      seasonSlug={seasonSlug}
      legSlug={legSlug}
    />
  )
}
