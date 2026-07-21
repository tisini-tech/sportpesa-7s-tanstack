import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { VideoCard } from '#/components/landing/videos'
import { collectVideos } from '#/lib/utils'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/$seasonSlug/$legSlug/videos/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { seasons } = rootRoute.useRouteContext()
  const videos = collectVideos(seasons)

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Videos
          </h1>
          <p className="mt-1 text-sm text-foreground/90">
            Highlights and features from the SportPesa National 7s Circuit.
          </p>
        </div>
      </section>

      <section className="sp-content-shell py-8">
        {videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              No videos yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Matchday videos will appear here once they are published.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <li key={video.id}>
                <VideoCard video={video} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
