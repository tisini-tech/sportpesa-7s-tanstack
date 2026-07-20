import { createFileRoute } from '@tanstack/react-router'

import { VotingCauses } from '#/components/voting/voting-causes'
import { getVoteCausesFn } from '#/data/voting'

export const Route = createFileRoute('/$seasonSlug/$legSlug/voting/')({
  loader: async () => {
    const causes = await getVoteCausesFn()
    return { causes }
  },
  component: VotingPage,
})

function VotingPage() {
  const { causes } = Route.useLoaderData()
  const { seasonSlug, legSlug } = Route.useParams()

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Voting
          </h1>
          <p className="mt-1 text-sm text-foreground/90">
            Vote for the cause you want to support.
          </p>
        </div>
      </section>

      <section className="sp-content-shell py-8">
        <VotingCauses
          causes={causes}
          seasonSlug={seasonSlug}
          legSlug={legSlug}
        />
      </section>
    </div>
  )
}
