import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { SiteHeader } from '#/components/site/header'
import SiteFooter from '#/components/site/footer'
import { getSeasonsFn } from '#/data/seasons'
import { Loading } from '#/components/error/loading'
import { NotFound } from '#/components/error/not-found'
import { Error } from '#/components/error/error'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const seasons = await getSeasonsFn({ data: { id: '238' } })
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
