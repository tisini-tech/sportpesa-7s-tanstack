import { Link } from '@tanstack/react-router'

import type { SeasonImage } from '#/lib/types'

export function GalleryGridSkeleton() {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  return (
    <ul
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
      aria-hidden
    >
      {cells.map((index) => (
        <li
          key={index}
          className="aspect-square overflow-hidden rounded-xl bg-muted/40"
        >
          <div className="size-full animate-pulse bg-muted/60" />
        </li>
      ))}
    </ul>
  )
}

export function GalleryGrid({
  images,
  leagueSlug,
  seasonSlug,
}: {
  images: SeasonImage[]
  leagueSlug: string
  seasonSlug: string
}) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">No photos yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Gallery images for this season will appear here once they are
          published.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <li
          key={image.id}
          className="group aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/30"
        >
          <Link
            to="/$leagueSlug/$seasonSlug/gallery/$imageId"
            params={{
              leagueSlug,
              seasonSlug,
              imageId: String(image.id),
            }}
            className="relative block size-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={image.caption || `Gallery image ${index + 1}`}
          >
            <img
              src={image.image}
              alt={image.caption || ''}
              loading="lazy"
              className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {image.caption ? (
              <p className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 truncate px-3 py-2 text-xs font-medium text-foreground opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                {image.caption}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
