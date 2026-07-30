import { createFileRoute } from '@tanstack/react-router'

import { QuizList } from '#/components/quiz/quiz-list'
import { getQuizzesFn } from '#/data/quiz'

export const Route = createFileRoute('/_site/quiz/')({
  loader: async () => {
    const quizzes = await getQuizzesFn()
    return { quizzes }
  },
  component: QuizPage,
  head: () => ({
    meta: [
      {
        title: 'SportPesa 7s | Quiz',
      },
    ],
  }),
})

function QuizPage() {
  const { quizzes } = Route.useLoaderData()

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Quiz
          </h1>
          <p className="mt-1 text-sm text-foreground/90">
            Play matchday quizzes or check the leaderboard.
          </p>
        </div>
      </section>

      <section className="sp-content-shell py-8">
        <QuizList quizzes={quizzes} />
      </section>
    </div>
  )
}
