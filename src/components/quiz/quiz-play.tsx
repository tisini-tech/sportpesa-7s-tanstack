import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  Loader2Icon,
  TrophyIcon,
} from 'lucide-react'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { Button } from '#/components/ui/button'
import { submitQuizFn } from '#/data/quiz'
import type { Question, QuestionChoice, Quiz } from '#/lib/types'
import { cn } from '#/lib/utils'

type QuizPlayProps = {
  quiz: Quiz
  seasonSlug: string
  legSlug: string
}

type QuizAnswer = {
  questionId: number
  choiceIds: number[]
  responseMs: number
}

function isMultipleAnswerType(answerType: string): boolean {
  return answerType.toUpperCase() === 'MA'
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function sortQuestions(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => a.order - b.order)
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function QuizPlay({ quiz, seasonSlug, legSlug }: QuizPlayProps) {
  const questions = useMemo(
    () => sortQuestions(quiz.questions ?? []),
    [quiz.questions],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const questionStartedAtRef = useRef(Date.now())

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  const shuffledChoices = useMemo(() => {
    if (!currentQuestion) return []
    return shuffle(currentQuestion.choices)
  }, [currentQuestion])

  const isMultiple = isMultipleAnswerType(currentQuestion?.answer_type ?? '')

  const toggleChoice = useCallback(
    (choiceId: number) => {
      setSelectedChoiceIds((prev) => {
        if (isMultiple) {
          return prev.includes(choiceId)
            ? prev.filter((id) => id !== choiceId)
            : [...prev, choiceId]
        }

        return [choiceId]
      })
    },
    [isMultiple],
  )

  const goToNextQuestion = useCallback(() => {
    if (!currentQuestion) return

    const responseMs = Date.now() - questionStartedAtRef.current

    setAnswers((prev) => [
      ...prev.filter((answer) => answer.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        choiceIds: selectedChoiceIds,
        responseMs,
      },
    ])

    if (currentIndex >= totalQuestions - 1) {
      setIsComplete(true)
      return
    }

    setCurrentIndex((index) => index + 1)
  }, [currentIndex, currentQuestion, selectedChoiceIds, totalQuestions])

  const handleSubmit = async () => {
    if (isSubmitting) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await submitQuizFn({
        data: {
          quizId: String(quiz.id),
          answers,
        },
      })

      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Could not submit your answers',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!currentQuestion || isComplete) return

    if (currentQuestion.timer_seconds > 0) {
      setTimeLeft(currentQuestion.timer_seconds)
      return
    }

    setTimeLeft(null)
  }, [currentQuestion, isComplete])

  useEffect(() => {
    if (timeLeft === null || isComplete) return

    if (timeLeft <= 0) {
      goToNextQuestion()
      return
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((value) => (value === null ? null : value - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [timeLeft, isComplete, goToNextQuestion])

  useEffect(() => {
    questionStartedAtRef.current = Date.now()
    setSelectedChoiceIds([])
  }, [currentIndex])

  if (totalQuestions === 0) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader
          title={quiz.title}
          subtitle="No questions available"
        />
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          This quiz does not have any questions yet. Check back later.
        </p>
      </article>
    )
  }

  if (isComplete) {
    const answeredCount = answers.filter(
      (answer) => answer.choiceIds.length > 0,
    ).length

    if (isSubmitted) {
      return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <FixtureSectionHeader
            title="Quiz complete"
            subtitle={`${answeredCount} of ${totalQuestions} answered`}
          />

          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <TrophyIcon className="size-8" aria-hidden />
            </div>

            <h2 className="mt-5 font-heading text-2xl font-black tracking-tight uppercase">
              Well played
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your answers for {quiz.title} have been submitted.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                render={
                  <Link
                    to="/$seasonSlug/$legSlug/quiz/$quizId/leaderboard"
                    params={{ seasonSlug, legSlug, quizId: String(quiz.id) }}
                  />
                }
                variant="secondary"
                size="lg"
                className="h-11 px-5 text-xs font-bold tracking-[0.08em] uppercase"
              >
                View leaderboard
              </Button>
              <Button
                type="button"
                render={
                  <Link
                    to="/$seasonSlug/$legSlug/quiz"
                    params={{ seasonSlug, legSlug }}
                  />
                }
                variant="outline"
                size="lg"
                className="h-11 px-5 text-xs font-bold tracking-[0.08em] uppercase"
              >
                All quizzes
              </Button>
            </div>
          </div>
        </article>
      )
    }

    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader
          title="Ready to submit"
          subtitle={`${answeredCount} of ${totalQuestions} answered`}
        />

        <div className="flex flex-col items-center px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-black tracking-tight uppercase">
            Review your quiz
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            You have finished {quiz.title}. Submit your answers when you are
            ready — this cannot be changed afterwards.
          </p>

          {submitError ? (
            <p className="mt-4 max-w-sm text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || answeredCount === 0}
              onClick={() => void handleSubmit()}
              className="h-11 min-w-40 px-5 text-xs font-bold tracking-[0.08em] uppercase"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                'Submit answers'
              )}
            </Button>
          </div>
        </div>
      </article>
    )
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const hasTimer = currentQuestion.timer_seconds > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title={quiz.title}
        subtitle={`Question ${currentIndex + 1} of ${totalQuestions}`}
      />

      <div className="space-y-6 px-4 py-5 sm:px-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Progress
            </p>
            {hasTimer && timeLeft !== null ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                  timeLeft <= 5
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <ClockIcon className="size-3.5" aria-hidden />
                {formatTimer(timeLeft)}
              </span>
            ) : null}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-lg leading-snug font-semibold text-foreground">
              {currentQuestion.text}
            </p>

            {currentQuestion.image_url ? (
              <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={currentQuestion.image_url}
                  alt=""
                  className="max-h-56 w-full object-cover"
                />
              </div>
            ) : null}

            {currentQuestion.points > 0 ? (
              <p className="text-xs font-medium text-muted-foreground">
                {currentQuestion.points}{' '}
                {currentQuestion.points === 1 ? 'point' : 'points'}
                {isMultiple ? ' · Select all that apply' : null}
              </p>
            ) : isMultiple ? (
              <p className="text-xs font-medium text-muted-foreground">
                Select all that apply
              </p>
            ) : null}
          </div>

          <div className="grid gap-3">
            {shuffledChoices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                multiple={isMultiple}
                selected={selectedChoiceIds.includes(choice.id)}
                onSelect={() => toggleChoice(choice.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-5">
          <p className="text-xs text-muted-foreground">
            {selectedChoiceIds.length > 0
              ? isMultiple
                ? `${selectedChoiceIds.length} selected. Tap next to continue.`
                : 'Tap next to continue.'
              : isMultiple
                ? 'Select one or more answers to continue.'
                : 'Select an answer to continue.'}
          </p>

          <Button
            type="button"
            size="lg"
            disabled={selectedChoiceIds.length === 0}
            onClick={goToNextQuestion}
            className="h-11 gap-1.5 px-5 text-xs font-bold tracking-[0.08em] uppercase"
          >
            {currentIndex >= totalQuestions - 1 ? 'Finish' : 'Next'}
            <ChevronRightIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}

function ChoiceButton({
  choice,
  multiple,
  selected,
  onSelect,
}: {
  choice: QuestionChoice
  multiple: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors',
        selected
          ? 'border-secondary/50 bg-secondary/10 text-foreground ring-1 ring-secondary/30'
          : 'border-border bg-muted/15 text-foreground hover:border-secondary/30 hover:bg-muted/30',
      )}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center border transition-colors',
          multiple ? 'rounded-md' : 'rounded-full',
          selected
            ? 'border-secondary bg-secondary text-secondary-foreground'
            : 'border-border bg-background text-transparent',
        )}
        aria-hidden
      >
        <CheckIcon className="size-3" />
      </span>
      <span className="leading-snug">{choice.text}</span>
    </button>
  )
}
