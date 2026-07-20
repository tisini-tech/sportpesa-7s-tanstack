import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { QuizLeaderboardTable } from '#/components/quiz/quiz-leaderboard-table'
import { getQuizLeaderboardFn } from '#/data/quiz'

export const Route = createFileRoute(
  '/$seasonSlug/$legSlug/quiz/$quizId/leaderboard',
)({
  loader: async ({ params }) => {
    const quizId = params.quizId
    if (!quizId) {
      throw new Error('Quiz ID is required')
    }

    const leaderboard = await getQuizLeaderboardFn({
      data: { quizId },
    })

    return { leaderboard }
  },
  component: QuizLeaderboardPage,
})

function QuizLeaderboardPage() {
  const { seasonSlug, legSlug, quizId } = Route.useParams()
  const { leaderboard } = Route.useLoaderData()

  return (
    <div className="sp-content-shell py-6">
      <Link
        to="/$seasonSlug/$legSlug/quiz"
        params={{ seasonSlug, legSlug }}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" aria-hidden />
        All quizzes
      </Link>

      <div className="mb-5">
        <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-foreground/90">Quiz #{quizId}</p>
      </div>

      <QuizLeaderboardTable entries={leaderboard} />
    </div>
  )
}
