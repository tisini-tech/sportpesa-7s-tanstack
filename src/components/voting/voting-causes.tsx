import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  ImageIcon,
} from 'lucide-react'

import type { VoteCause } from '#/lib/types'
import { cn } from '#/lib/utils'

type VoteStatus = 'upcoming' | 'open' | 'ended'

function parseVoteDate(value: string): Date {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function getVoteStatus(
  cause: Pick<VoteCause, 'date_from' | 'date_to'>,
  now = new Date(),
): VoteStatus {
  const from = parseVoteDate(cause.date_from)
  const to = parseVoteDate(cause.date_to)

  if (now < from) return 'upcoming'
  if (now > to) return 'ended'
  return 'open'
}

function formatVoteDateRange(cause: VoteCause): string {
  const from = parseVoteDate(cause.date_from)
  const to = parseVoteDate(cause.date_to)

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

function statusLabel(status: VoteStatus): string {
  if (status === 'open') return 'Open'
  if (status === 'ended') return 'Ended'
  return 'Upcoming'
}

function statusClass(status: VoteStatus): string {
  if (status === 'open') {
    return 'bg-secondary/15 text-secondary ring-secondary/30'
  }
  if (status === 'ended') {
    return 'bg-muted text-muted-foreground ring-border'
  }
  return 'bg-primary/15 text-primary ring-primary/30'
}

export function VotingCauses({
  causes,
  seasonSlug,
  legSlug,
}: {
  causes: VoteCause[]
  seasonSlug: string
  legSlug: string
}) {
  const sorted = [...causes].sort((a, b) => {
    const statusOrder = { open: 0, upcoming: 1, ended: 2 }
    const statusDiff =
      statusOrder[getVoteStatus(a)] - statusOrder[getVoteStatus(b)]
    if (statusDiff !== 0) return statusDiff
    return (
      parseVoteDate(b.date_from).getTime() -
      parseVoteDate(a.date_from).getTime()
    )
  })

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">No votes yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fan votes will appear here when a poll is published.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((cause) => (
        <li key={cause.id}>
          <VoteCauseCard
            cause={cause}
            seasonSlug={seasonSlug}
            legSlug={legSlug}
          />
        </li>
      ))}
    </ul>
  )
}

function VoteCauseCard({
  cause,
  seasonSlug,
  legSlug,
}: {
  cause: VoteCause
  seasonSlug: string
  legSlug: string
}) {
  const [now, setNow] = useState(() => new Date())
  const status = getVoteStatus(cause, now)
  const startsAt = parseVoteDate(cause.date_from)
  const isActionable = status === 'open' || status === 'ended'
  const ctaLabel = status === 'ended' ? 'Results' : 'Vote'

  useEffect(() => {
    if (status !== 'upcoming') return

    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [status])

  const countdown = getCountdownParts(startsAt.getTime() - now.getTime())

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted/40">
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

        <span
          className={cn(
            'absolute top-3 left-3 rounded-md px-2 py-1 text-[0.6rem] font-bold tracking-wider uppercase ring-1',
            statusClass(status),
            status === 'open' && 'animate-pulse',
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {cause.reason}
          </h2>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden />
            {formatVoteDateRange(cause)}
          </p>
        </div>

        {isActionable ? (
          <Link
            to="/$seasonSlug/$legSlug/voting/$voteId"
            params={{
              seasonSlug,
              legSlug,
              voteId: cause.id.toString(),
            }}
            search={{ view: status === 'ended' ? 'results' : undefined }}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold tracking-wide uppercase transition-colors',
              status === 'open'
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted',
            )}
          >
            {ctaLabel}
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
