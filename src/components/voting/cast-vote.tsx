import { useEffect, useState } from 'react'
import { CheckIcon, ImageIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { castVoteFn } from '#/data/voting'
import { Button } from '#/components/ui/button'
import type { Participant, VoteParticipant } from '#/lib/types'
import {
  getOrCreateVotingSessionId,
  hasVotedForCause,
  markCauseVoted,
} from '#/components/voting/voting-session'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function teamLabel(participant: Participant): string | null {
  return participant.team_name || participant.description || null
}

function formatVotes(count: number): string {
  return new Intl.NumberFormat('en-GB').format(count)
}

function applyVoteResult(
  poll: VoteParticipant,
  result: Participant,
): VoteParticipant {
  return {
    ...poll,
    total_votes: result.votes_casted ?? poll.total_votes + 1,
    participants: poll.participants.map((participant) =>
      participant.id === result.id
        ? {
            ...participant,
            ...result,
            total_votes: result.total_votes,
          }
        : participant,
    ),
  }
}

export function CastVote({ poll: initialPoll }: { poll: VoteParticipant }) {
  const [poll, setPoll] = useState(initialPoll)
  const [pendingParticipant, setPendingParticipant] =
    useState<Participant | null>(null)
  const [votedParticipant, setVotedParticipant] = useState<Participant | null>(
    null,
  )
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPoll(initialPoll)
  }, [initialPoll])

  useEffect(() => {
    setHasVoted(hasVotedForCause(initialPoll.id))
  }, [initialPoll.id])

  const participants = [...poll.participants].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const closeConfirm = () => {
    if (isSubmitting) return
    setPendingParticipant(null)
    setError(null)
  }

  const confirmVote = async () => {
    if (!pendingParticipant || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const session = getOrCreateVotingSessionId()
      const result = await castVoteFn({
        data: {
          causeId: poll.id,
          participantId: pendingParticipant.id,
          session,
          comment: null,
        },
      })

      markCauseVoted(poll.id)
      setPoll(applyVoteResult(poll, result))
      setVotedParticipant(result)
      setHasVoted(true)
      setPendingParticipant(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not cast your vote'
      setError(message)

      if (/already|duplicate|once/i.test(message)) {
        markCauseVoted(poll.id)
        setHasVoted(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const team = pendingParticipant ? teamLabel(pendingParticipant) : null

  if (hasVoted) {
    return <VotedState poll={poll} votedParticipant={votedParticipant} />
  }

  return (
    <div className="space-y-5">
      <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-5">
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            Cast your vote
          </p>
          <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl">
            {poll.reason}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose one player below. You can only vote once.
          </p>
        </div>
      </header>

      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            No nominees yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Participants will appear here once the ballot is published.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {participants.map((participant) => (
            <ParticipantVoteCard
              key={participant.id}
              participant={participant}
              disabled={isSubmitting}
              onVote={() => {
                setError(null)
                setPendingParticipant(participant)
              }}
            />
          ))}
        </ul>
      )}

      <Dialog
        open={pendingParticipant != null}
        onOpenChange={(open) => {
          if (!open) closeConfirm()
        }}
      >
        <DialogContent showCloseButton={!isSubmitting}>
          <DialogHeader>
            <DialogTitle>Confirm your vote</DialogTitle>
            <DialogDescription>
              You can only vote once for this poll. Please confirm before we
              submit.
            </DialogDescription>
          </DialogHeader>

          {pendingParticipant ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                {pendingParticipant.image_url ? (
                  <img
                    src={pendingParticipant.image_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {getInitials(pendingParticipant.name) || '—'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {pendingParticipant.name}
                </p>
                {team ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {team}
                  </p>
                ) : null}
                <p className="mt-1 text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  {poll.reason}
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={closeConfirm}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => {
                void confirmVote()
              }}
            >
              {isSubmitting ? 'Submitting…' : 'Confirm vote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VotedState({
  poll,
  votedParticipant,
}: {
  poll: VoteParticipant
  votedParticipant: Participant | null
}) {
  const team = votedParticipant ? teamLabel(votedParticipant) : null

  return (
    <div className="space-y-5">
      <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/15 px-4 py-5 text-center sm:px-5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <CheckIcon className="size-6" aria-hidden />
          </div>
          <p className="mt-3 text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            Vote submitted
          </p>
          <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl">
            {poll.reason}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks — you’ve already voted in this poll.
            {poll.total_votes > 0
              ? ` ${formatVotes(poll.total_votes)} total votes so far.`
              : null}
          </p>
        </div>
      </header>

      {votedParticipant ? (
        <article className="overflow-hidden rounded-2xl border border-secondary/40 bg-card shadow-sm ring-1 ring-secondary/20">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
              {votedParticipant.image_url ? (
                <img
                  src={votedParticipant.image_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">
                  {getInitials(votedParticipant.name) || '—'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                Your pick
              </p>
              <p className="truncate text-lg font-semibold text-foreground">
                {votedParticipant.name}
              </p>
              {team ? (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {team}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-black tabular-nums text-secondary">
                {formatVotes(votedParticipant.total_votes)}
              </p>
              <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                votes
              </p>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  )
}

function ParticipantVoteCard({
  participant,
  disabled,
  onVote,
}: {
  participant: Participant
  disabled: boolean
  onVote: () => void
}) {
  const team = teamLabel(participant)

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[4/5] overflow-hidden border-b border-border bg-muted/40">
        {participant.image_url ? (
          <img
            src={participant.image_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%),radial-gradient(circle_at_80%_80%,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)] text-muted-foreground">
            <ImageIcon className="size-7 opacity-60" aria-hidden />
            <span className="text-sm font-bold tracking-wide">
              {getInitials(participant.name) || '—'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-foreground">
            {participant.name}
          </p>
          {team ? (
            <p className="mt-0.5 truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              {team}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onVote}
          disabled={disabled}
          className={cn(
            'inline-flex h-9 w-full items-center justify-center rounded-xl bg-primary text-xs font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60',
          )}
        >
          Vote
        </button>
      </div>
    </li>
  )
}
