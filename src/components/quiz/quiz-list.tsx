import { Link } from '@tanstack/react-router'
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ImageIcon,
  PlayIcon,
  TrophyIcon,
} from 'lucide-react'

import type { Quiz } from '#/lib/types'
import { cn } from '#/lib/utils'

type QuizAction = 'play' | 'leaderboard' | 'upcoming'

function parseQuizDate(value: string): Date {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function getQuizAction(
  quiz: Pick<Quiz, 'status' | 'starts_at' | 'ends_at'>,
  now = new Date(),
): QuizAction {
  const startsAt = parseQuizDate(quiz.starts_at)
  const endsAt = parseQuizDate(quiz.ends_at)
  const status = quiz.status.toUpperCase()

  if (now > endsAt || status === 'CL' || status === 'EN' || status === 'ED') {
    return 'leaderboard'
  }

  if (status === 'OP' && now >= startsAt) {
    return 'play'
  }

  return 'upcoming'
}

function formatQuizDateRange(quiz: Quiz): string {
  const from = parseQuizDate(quiz.starts_at)
  const to = parseQuizDate(quiz.ends_at)

  const format = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)

  return `${format(from)} – ${format(to)}`
}

function actionLabel(action: QuizAction): string {
  if (action === 'play') return 'Open'
  if (action === 'leaderboard') return 'Ended'
  return 'Upcoming'
}

function actionBadgeClass(action: QuizAction): string {
  if (action === 'play') {
    return 'bg-secondary/15 text-secondary ring-secondary/30'
  }
  if (action === 'leaderboard') {
    return 'bg-muted text-muted-foreground ring-border'
  }
  return 'bg-primary/15 text-primary ring-primary/30'
}

export function QuizList({
  quizzes,
  seasonSlug,
  legSlug,
}: {
  quizzes: Quiz[]
  seasonSlug: string
  legSlug: string
}) {
  const visible = quizzes
    .filter((quiz) => quiz.is_public && quiz.status.toUpperCase() !== 'DR')
    .sort((a, b) => {
      const order = { play: 0, upcoming: 1, leaderboard: 2 }
      const actionDiff = order[getQuizAction(a)] - order[getQuizAction(b)]
      if (actionDiff !== 0) return actionDiff
      return (
        parseQuizDate(b.starts_at).getTime() -
        parseQuizDate(a.starts_at).getTime()
      )
    })

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">No quizzes yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Matchday quizzes will appear here once they are published.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((quiz) => (
        <li key={quiz.id}>
          <QuizCard quiz={quiz} seasonSlug={seasonSlug} legSlug={legSlug} />
        </li>
      ))}
    </ul>
  )
}

function QuizCard({
  quiz,
  seasonSlug,
  legSlug,
}: {
  quiz: Quiz
  seasonSlug: string
  legSlug: string
}) {
  const action = getQuizAction(quiz)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted/40">
        {quiz.image_url ? (
          <img src={quiz.image_url} alt="" className="size-full object-cover" />
        ) : (
          <>
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(circle_at_80%_80%,color-mix(in_oklch,var(--secondary)_18%,transparent),transparent_50%)]"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="size-8 opacity-60" aria-hidden />
              <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase">
                Image
              </span>
            </div>
          </>
        )}

        <span
          className={cn(
            'absolute top-3 left-3 rounded-md px-2 py-1 text-[0.6rem] font-bold tracking-wider uppercase ring-1',
            actionBadgeClass(action),
            action === 'play' && 'animate-pulse',
          )}
        >
          {actionLabel(action)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {quiz.title}
          </h2>
          {quiz.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {quiz.description}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden />
            {formatQuizDateRange(quiz)}
          </p>
          {quiz.prize_description ? (
            <p className="mt-2 text-xs font-medium text-secondary">
              {quiz.prize_description}
            </p>
          ) : null}
        </div>

        {action === 'play' ? (
          <Link
            to="/$seasonSlug/$legSlug/quiz/$quizId"
            params={{
              seasonSlug,
              legSlug,
              quizId: quiz.id.toString(),
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 text-sm font-bold tracking-wide text-primary uppercase transition-colors hover:bg-secondary/90"
          >
            <PlayIcon className="size-4" aria-hidden />
            Play
            <ChevronRightIcon className="size-4" aria-hidden />
          </Link>
        ) : action === 'leaderboard' ? (
          <Link
            to="/$seasonSlug/$legSlug/quiz/$quizId/leaderboard"
            params={{
              seasonSlug,
              legSlug,
              quizId: quiz.id.toString(),
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 text-sm font-bold tracking-wide text-primary uppercase transition-colors hover:bg-muted"
          >
            <TrophyIcon className="size-4" aria-hidden />
            Leaderboard
            <ChevronRightIcon className="size-4" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl border border-border bg-muted/20 px-4 text-sm font-bold tracking-wide text-muted-foreground uppercase opacity-70"
          >
            Coming soon
          </button>
        )}
      </div>
    </article>
  )
}
