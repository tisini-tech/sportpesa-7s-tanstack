import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { SiteHeader } from '#/components/site/header'
import SiteFooter from '#/components/site/footer'
import { getSeasonsFn } from '#/data/seasons'
import { Loading } from '#/components/error/loading'
import { NotFound } from '#/components/error/not-found'
import { Error } from '#/components/error/error'

type RootSearch = {
  season?: number
  division?: number
}

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): RootSearch => ({
    season: search.season ? Number(search.season) : undefined,
    division: search.division ? Number(search.division) : undefined,
  }),
  beforeLoad: async ({ search, location }) => {
    const seasons = await getSeasonsFn({ data: { id: '238' } })
    const defaultSeason = seasons[0]

    if (!defaultSeason) {
      return { seasons }
    }

    const needsSeason = search.season == null
    const needsDivision = search.division == null

    if (needsSeason || needsDivision) {
      const defaultDivisionId = pickFeaturedDivision(defaultSeason.divisions)
        ?.division.id

      throw redirect({
        to: location.pathname,
        search: {
          season: needsSeason ? defaultSeason.id : search.season,
          division: needsDivision ? defaultDivisionId : search.division,
        },
        replace: true,
      })
    }

    return { seasons }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SportPesa 7s',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  pendingComponent: Loading,
  errorComponent: Error,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>

      <body className="min-h-screen">
        <main className="flex min-h-screen w-full flex-col">
          <SiteHeader />

          <div className="w-full min-w-0 flex-1">{children}</div>
          <SiteFooter />
        </main>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
