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
    <section className="sp-content-shell py-8">
      <VotingCauses causes={causes} seasonSlug={seasonSlug} legSlug={legSlug} />
    </section>
  )
}
