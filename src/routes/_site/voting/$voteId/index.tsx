import { useEffect, useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'

import { getOptionalUserFn } from '#/data/auth'
import { LoginModal } from '#/components/auth/login'
import { getVoteParticipantsFn } from '#/data/voting'
import { VoteResults } from '#/components/voting/results'
import { SlateVoting } from '#/components/voting/slate-voting'
import { SingleVoting } from '#/components/voting/single-voting'
import { getVoteStatus } from '#/components/voting/voting-causes'
import { hasVotedForCause } from '#/components/voting/voting-session'

export const Route = createFileRoute('/_site/voting/$voteId/')({
  beforeLoad: async () => {
    const user = await getOptionalUserFn()
    return { user }
  },
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
  const { user } = Route.useRouteContext()
  const { poll } = Route.useLoaderData()
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const [alreadyVoted, setAlreadyVoted] = useState(false)

  const status = getVoteStatus(poll)
  const isSlate = poll.vote_mode?.trim().toLowerCase() === 'slate'

  useEffect(() => {
    if (!hasVotedForCause(poll.id)) return

    setAlreadyVoted(true)

    if (status === 'ended' || view === 'results') return
    // Slate polls stay on the success screen instead of results.
    if (isSlate) return

    void navigate({
      search: { view: 'results' },
      replace: true,
    })
  }, [isSlate, navigate, poll.id, status, view])

  const showResults =
    status === 'ended' || view === 'results' || (alreadyVoted && !isSlate)

  // Casting requires auth; results stay public.
  const needsLogin = !user && !showResults
  const mode = poll.vote_mode?.trim().toLowerCase()

  return (
    <div className="sp-content-shell py-6">
      <Link
        to="/voting"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" aria-hidden />
        All votes
      </Link>

      {showResults ? (
        <VoteResults poll={poll} />
      ) : user ? (
        <>
          {mode === 'slate' ? (
            <SlateVoting poll={poll} />
          ) : (
            <SingleVoting poll={poll} />
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            Sign in to vote
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in with your phone or email to cast your vote.
          </p>
        </div>
      )}

      <LoginModal
        open={needsLogin}
        showTrigger={false}
        onOpenChange={(open) => {
          if (!open && needsLogin) return
        }}
        onSuccess={() => {
          void router.invalidate()
        }}
      />
    </div>
  )
}
