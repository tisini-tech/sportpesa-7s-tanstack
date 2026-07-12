import { createFileRoute, redirect } from '@tanstack/react-router'

import { buildFeaturedTournamentPath } from '#/lib/tournament-slugs'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const featuredPath = buildFeaturedTournamentPath(context.seasons)

    if (featuredPath) {
      throw redirect({
        to: featuredPath,
        replace: true,
      })
    }
  },
})
