import { useMemo } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import { ChevronRightIcon, PlayIcon } from 'lucide-react'

import type { Season } from '#/lib/types'
import { cn, collectVideos, formatVideoDate } from '#/lib/utils'

const legRoute = getRouteApi('/$seasonSlug/$legSlug')

export type LandingVideo = {
  id: string
  url: string
  seasonName: string
  divisionName: string
  seasonSlug: string
  legSlug: string
  date: string | null
  dayLabel: string
  thumbnailUrl: string | null
}

export function VideosSection({ data }: { data: Season[] }) {
  const { seasonSlug, legSlug } = legRoute.useParams()

  const videos = useMemo(() => collectVideos(data).slice(0, 6), [data])

  if (videos.length === 0) {
    return (
      <section
        className="sp-content-shell py-8"
        aria-labelledby="landing-videos-heading"
      >
        <div className="mb-5">
          <h2
            id="landing-videos-heading"
            className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
          >
            Videos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Highlights from across the circuit
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No videos yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Matchday videos will appear here once they are published.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="sp-content-shell py-8"
      aria-labelledby="landing-videos-heading"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="landing-videos-heading"
            className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
          >
            Videos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Highlights from across the circuit
          </p>
        </div>

        <Link
          to="/$seasonSlug/$legSlug/videos"
          params={{ seasonSlug, legSlug }}
          className="inline-flex items-center gap-1 text-xs font-bold tracking-[0.08em] text-secondary uppercase transition-colors hover:text-secondary/80"
        >
          View all
          <ChevronRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function VideoCard({ video }: { video: LandingVideo }) {
  return (
    <Link
      to="/$seasonSlug/$legSlug/videos/$videoId"
      params={{
        seasonSlug: video.seasonSlug,
        legSlug: video.legSlug,
        videoId: video.id,
      }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors',
        'hover:border-secondary/40 hover:bg-muted/15',
        'focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted/40">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            width={480}
            height={270}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(circle_at_80%_80%,color-mix(in_oklch,var(--secondary)_18%,transparent),transparent_50%)]"
            aria-hidden
          />
        )}

        <div className="absolute inset-0 bg-background/10 transition-colors group-hover:bg-background/20" />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110 sm:size-14">
            <PlayIcon className="size-5 fill-current sm:size-6" aria-hidden />
          </span>
        </div>

        <span className="absolute top-3 left-3 rounded-md bg-secondary/90 px-2 py-1 text-[0.6rem] font-bold tracking-wider text-secondary-foreground uppercase">
          {video.dayLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 py-3.5">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {video.divisionName}
          <span className="text-muted-foreground"> · {video.seasonName}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatVideoDate(video.date)}
        </p>
      </div>
    </Link>
  )
}
