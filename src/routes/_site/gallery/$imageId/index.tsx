import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { pickGalleryDivision } from '#/components/landing/division-utils'
import { getSeasonsFn, seasonImagesQueryOptions } from '#/data/seasons'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
import {
  getLegSlug,
  getSeasonSlug,
  resolveDivisionBySlug,
  resolveSeasonBySlug,
} from '#/lib/tournament-slugs'

const GALLERY_COMPETITION_ID = String(DEFAULT_LEAGUE.id)

type GallerySearch = {
  season?: string
  leg?: string
}

export const Route = createFileRoute('/_site/gallery/$imageId/')({
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    season: typeof search.season === 'string' ? search.season : undefined,
    leg: typeof search.leg === 'string' ? search.leg : undefined,
  }),
  beforeLoad: async ({ search, params }) => {
    const seasons = await getSeasonsFn({
      data: { id: GALLERY_COMPETITION_ID },
    })

    const season =
      (search.season
        ? resolveSeasonBySlug(seasons, search.season)
        : undefined) ?? seasons[0]

    if (!season) throw notFound()

    const featured = pickGalleryDivision(season.divisions)
    const division =
      (search.leg
        ? resolveDivisionBySlug(season, search.leg)
        : undefined) ?? featured?.division

    if (!division) throw notFound()

    const seasonSlug = getSeasonSlug(season)
    const legSlug = getLegSlug(division)

    if (search.season !== seasonSlug || search.leg !== legSlug) {
      throw redirect({
        to: '/gallery/$imageId',
        params: { imageId: params.imageId },
        search: { season: seasonSlug, leg: legSlug },
        replace: true,
      })
    }

    return {
      seasons,
      season,
      division,
      competitionId: GALLERY_COMPETITION_ID,
    }
  },
  loader: async ({ context, params }) => {
    const images = await context.queryClient.ensureQueryData(
      seasonImagesQueryOptions(
        context.competitionId,
        context.season.id.toString(),
        context.division.id.toString(),
      ),
    )

    const image = images.find((item) => String(item.id) === params.imageId)
    if (!image) throw notFound()

    return { image }
  },
  component: GalleryImagePage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `SportPesa 7s | ${loaderData?.image.caption || 'Photo'}`,
      },
    ],
  }),
})

function GalleryImagePage() {
  const { season, division } = Route.useRouteContext()
  const { image } = Route.useLoaderData()
  const search = Route.useSearch()

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell flex flex-col gap-x-3 gap-y-1.5 px-4 py-2.5 sm:px-6">
          <Link
            to="/gallery"
            search={search}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            All photos
          </Link>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              {image.caption || 'Photo'}
            </h1>
            <span className="hidden text-border sm:inline" aria-hidden>
              |
            </span>
            <span className="text-xs text-muted-foreground">
              {division.name} · {season.name}
            </span>
          </div>
        </div>
      </section>

      <section className="sp-content-shell py-8">
        <article className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-muted/30">
            <img
              src={image.image}
              alt={image.caption || ''}
              className="mx-auto max-h-[min(80vh,52rem)] w-full object-contain"
            />
          </div>
          {image.caption ? (
            <div className="border-t border-border px-4 py-4 sm:px-5">
              <p className="text-sm text-foreground/90">{image.caption}</p>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  )
}
