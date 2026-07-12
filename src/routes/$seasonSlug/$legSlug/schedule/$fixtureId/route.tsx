import FixtureHeader from '#/components/schedule/fixture-header'
import { getFixtureDetailsFn } from '#/data/fixtures'
import { cn } from '#/lib/utils'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/schedule/$fixtureId',
)({
  loader: async ({ context, params }) => {
    const details = await getFixtureDetailsFn({
      data: {
        seasonId: context.season.id.toString(),
        fixtureId: params.fixtureId,
      },
    })

    return { details, fixtureId: params.fixtureId }
  },
  component: RouteComponent,
})

const tabs = [
  {
    label: 'Overview',
    to: '/$seasonSlug/$legSlug/schedule/$fixtureId' as const,
    exact: true,
  },
  {
    label: 'Lineups',
    to: '/$seasonSlug/$legSlug/schedule/$fixtureId/lineups' as const,
    exact: false,
  },
  {
    label: 'Stats',
    to: '/$seasonSlug/$legSlug/schedule/$fixtureId/stats' as const,
    exact: false,
  },
  {
    label: 'H2H',
    to: '/$seasonSlug/$legSlug/schedule/$fixtureId/h2h' as const,
    exact: false,
  },
]

const tabLinkClass =
  'rounded-lg px-3 py-2.5 text-center text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors text-muted-foreground hover:bg-accent hover:text-foreground'

const tabLinkActiveClass = 'bg-secondary/15 text-secondary shadow-sm'

function RouteComponent() {
  const { details, fixtureId } = Route.useLoaderData()
  const { seasonSlug, legSlug } = Route.useParams()

  return (
    <div className="sp-content-shell flex flex-col gap-4 py-6">
      <FixtureHeader details={details.fixture} />

      <nav className="grid grid-cols-4 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            params={{ seasonSlug, legSlug, fixtureId }}
            className={tabLinkClass}
            activeProps={{ className: cn(tabLinkClass, tabLinkActiveClass) }}
            activeOptions={{ exact: tab.exact }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
