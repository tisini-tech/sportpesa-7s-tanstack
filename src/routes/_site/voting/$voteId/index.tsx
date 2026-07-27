import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { CastVote } from '#/components/voting/cast-vote'
import { VoteResults } from '#/components/voting/results'
import { getVoteStatus } from '#/components/voting/voting-causes'
import { hasVotedForCause } from '#/components/voting/voting-session'
import { getVoteParticipantsFn } from '#/data/voting'

export const Route = createFileRoute('/_site/voting/$voteId/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: search.view === 'results' ? ('results' as const) : undefined,
    }
  },
  loader: async ({ params }) => {
    const poll = await getVoteParticipantsFn({
      data: { causeId: Number(params.voteId) },
    })
    return { poll }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { poll } = Route.useLoaderData()
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()
  const status = getVoteStatus(poll)
  const [alreadyVoted, setAlreadyVoted] = useState(false)

  useEffect(() => {
    if (!hasVotedForCause(poll.id)) return

    setAlreadyVoted(true)

    if (status === 'ended' || view === 'results') return

    void navigate({
      search: { view: 'results' },
      replace: true,
    })
  }, [navigate, poll.id, status, view])

  const showResults =
    status === 'ended' || view === 'results' || alreadyVoted

  return (
    <div className="sp-content-shell py-6">
      <Link
        to="/voting"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" aria-hidden />
        All votes
      </Link>

      {showResults ? <VoteResults poll={poll} /> : <CastVote poll={poll} />}
    </div>
  )
}
