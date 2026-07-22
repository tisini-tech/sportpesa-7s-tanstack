import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
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

function getCountdownParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
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
  const [now, setNow] = useState(() => new Date())
  const action = getQuizAction(quiz, now)
  const startsAt = parseQuizDate(quiz.starts_at)

  useEffect(() => {
    if (action !== 'upcoming') return

    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [action])

  const countdown = getCountdownParts(startsAt.getTime() - now.getTime())

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
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 text-sm font-bold tracking-wide text-secondary-foreground uppercase transition-colors hover:bg-secondary/90"
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
          <div
            className="flex h-10 items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3"
            aria-live="polite"
            aria-label={`Starts in ${countdown.days} days ${countdown.hours} hours ${countdown.minutes} minutes ${countdown.seconds} seconds`}
          >
            <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.1em] text-primary uppercase">
              <ClockIcon className="size-3.5 shrink-0" aria-hidden />
              Starts in
            </span>
            {countdown.days === 0 &&
            countdown.hours === 0 &&
            countdown.minutes === 0 &&
            countdown.seconds === 0 ? (
              <span className="text-sm font-bold text-primary">
                Opening soon
              </span>
            ) : (
              <div className="flex items-center gap-1.5 tabular-nums text-primary">
                {countdown.days > 0 ? (
                  <CountdownUnit value={countdown.days} label="d" />
                ) : null}
                <CountdownUnit value={pad(countdown.hours)} label="h" />
                <CountdownUnit value={pad(countdown.minutes)} label="m" />
                {countdown.days === 0 ? (
                  <CountdownUnit value={pad(countdown.seconds)} label="s" />
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function CountdownUnit({
  value,
  label,
}: {
  value: number | string
  label: string
}) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[0.6rem] font-semibold tracking-wider uppercase opacity-80">
        {label}
      </span>
    </span>
  )
}
