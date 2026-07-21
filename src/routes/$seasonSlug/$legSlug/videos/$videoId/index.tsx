import { useEffect, useState } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react'

import { VideoCard } from '#/components/landing/videos'
import {
  collectVideos,
  formatVideoDate,
  getYouTubeId,
  youtubeEmbedUrl,
} from '#/lib/utils'

export const Route = createFileRoute('/$seasonSlug/$legSlug/videos/$videoId/')({
  loader: ({ context, params }) => {
    const videos = collectVideos(context.seasons)
    const video = videos.find((item) => item.id === params.videoId)

    if (!video) {
      throw notFound()
    }

    const moreVideos = videos.filter((item) => item.id !== video.id).slice(0, 6)

    return { video, moreVideos }
  },
  component: VideoDetailPage,
})

function VideoDetailPage() {
  const { seasonSlug, legSlug } = Route.useParams()
  const { video, moreVideos } = Route.useLoaderData()
  const youtubeId = getYouTubeId(video.url)

  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    setPlayerReady(false)
  }, [video.id])

  const title = `${video.divisionName} · ${video.dayLabel}`

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell flex flex-col gap-x-3 gap-y-1.5 px-4 py-2.5 sm:px-6">
          <Link
            to="/$seasonSlug/$legSlug/videos"
            params={{ seasonSlug, legSlug }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            All videos
          </Link>

          <div className="flex items-center gap-1">
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              {title}
            </h1>

            <span className="hidden text-border sm:inline" aria-hidden>
              |
            </span>

            <span className="text-xs text-muted-foreground">
              {video.seasonName} · {formatVideoDate(video.date)}
            </span>
          </div>
        </div>
      </section>

      <section className="sp-content-shell space-y-8 py-8">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative aspect-video w-full bg-black">
            {youtubeId ? (
              <>
                {!playerReady ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Loading player…
                  </div>
                ) : null}
                <iframe
                  key={youtubeId}
                  title={title}
                  src={youtubeEmbedUrl(youtubeId, true)}
                  className="absolute inset-0 size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setPlayerReady(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  This video can’t be embedded here
                </p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold tracking-wider text-primary-foreground uppercase transition-colors hover:bg-primary/90"
                >
                  Open video
                  <ExternalLinkIcon className="size-3.5" aria-hidden />
                </a>
              </div>
            )}
          </div>
        </article>

        {moreVideos.length > 0 ? (
          <div>
            <h2 className="mb-4 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              More videos
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreVideos.map((item) => (
                <li key={item.id}>
                  <VideoCard video={item} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  )
}
