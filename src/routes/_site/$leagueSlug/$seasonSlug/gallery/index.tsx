import { createFileRoute, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

import {
  GalleryGrid,
  GalleryGridSkeleton,
} from '#/components/gallery/gallery-grid'
import { getSeasonsFn, seasonImagesQueryOptions } from '#/data/seasons'
import { resolveLeagueBySlug } from '#/lib/leagues'
import { resolveSeasonBySlug } from '#/lib/tournament-slugs'

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/gallery/')(
  {
    beforeLoad: async ({ params }) => {
      const league = resolveLeagueBySlug(params.leagueSlug)
      if (!league) throw notFound()

      // Gallery assets live on Division 1 (238) only.
      const seasons = await getSeasonsFn({ data: { id: '238' } })
      const season = resolveSeasonBySlug(seasons, params.seasonSlug)
      if (!season) throw notFound()

      return { league, season }
    },
    loader: async ({ context }) => {
      await context.queryClient.ensureQueryData(
        seasonImagesQueryOptions(context.season.id.toString()),
      )
    },
    component: GalleryPage,
    head: () => ({
      meta: [
        {
          title: 'SportPesa 7s | Gallery',
        },
      ],
    }),
  },
)

function GalleryPage() {
  const { league, season } = Route.useRouteContext()
  const { leagueSlug, seasonSlug } = Route.useParams()

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-foreground/90">
            {league.title} · {season.name}
          </p>
        </div>
      </section>

      <section className="sp-content-shell py-8">
        <Suspense fallback={<GalleryGridSkeleton />}>
          <GalleryGridContent
            seasonId={season.id.toString()}
            leagueSlug={leagueSlug}
            seasonSlug={seasonSlug}
          />
        </Suspense>
      </section>
    </div>
  )
}

function GalleryGridContent({
  seasonId,
  leagueSlug,
  seasonSlug,
}: {
  seasonId: string
  leagueSlug: string
  seasonSlug: string
}) {
  const { data: images } = useSuspenseQuery(seasonImagesQueryOptions(seasonId))

  return (
    <GalleryGrid
      images={images}
      leagueSlug={leagueSlug}
      seasonSlug={seasonSlug}
    />
  )
}
