import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import { LoginModal } from '#/components/auth/login'
import { QuizPlay } from '#/components/quiz/quiz-play'
import { clearSessionFn, getOptionalUserFn } from '#/data/auth'
import { getQuizFn } from '#/data/quiz'

function isAuthError(message: string): boolean {
  return /not authenticated|token not valid|token expired|unauthorized|401/i.test(
    message,
  )
}

export const Route = createFileRoute('/$seasonSlug/$legSlug/quiz/$quizId/')({
  beforeLoad: async () => {
    const user = await getOptionalUserFn()
    return { user }
  },
  loader: async ({ params, context }) => {
    if (!context.user) {
      return { quiz: null, sessionExpired: false }
    }

    try {
      const quiz = await getQuizFn({ data: { quizId: params.quizId } })
      return { quiz, sessionExpired: false }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not load quiz'

      if (isAuthError(message)) {
        await clearSessionFn()
        return { quiz: null, sessionExpired: true }
      }

      throw error
    }
  },
  component: QuizPlayPage,
})

function QuizPlayPage() {
  const { seasonSlug, legSlug } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { quiz, sessionExpired } = Route.useLoaderData()
  const router = useRouter()

  useEffect(() => {
    if (sessionExpired) {
      void router.invalidate()
    }
  }, [sessionExpired, router])

  const needsLogin = !user || sessionExpired

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

      {user && quiz ? (
        <QuizPlay quiz={quiz} seasonSlug={seasonSlug} legSlug={legSlug} />
      ) : user && !sessionExpired ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            Could not load quiz
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try again in a moment or pick another quiz.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            {sessionExpired ? 'Session expired' : 'Sign in to play'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessionExpired
              ? 'Please sign in again to continue this quiz.'
              : 'Log in with your phone or email to start this quiz.'}
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
