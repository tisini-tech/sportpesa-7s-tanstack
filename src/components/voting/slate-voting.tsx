import { useEffect, useMemo, useState } from 'react'
import { CheckIcon, ImageIcon, SearchIcon, XIcon } from 'lucide-react'

import { castBallotFn } from '#/data/voting'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  getOrCreateVotingSessionId,
  loadBallotPicks,
  markCauseVoted,
  resolveHasVoted,
  saveBallotPicks,
  type StoredBallotPick,
} from '#/components/voting/voting-session'
import type {
  Formation,
  FormationPosition,
  Participant,
  VoteParticipant,
} from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  RUGBY_SLOT_LAYOUT,
  RugbyPitchMarkings,
  type PitchOrientation,
} from '#/components/voting/rugby-pitch'

const ROLE_ALIASES: Record<string, string[]> = {
  prop: ['prop', 'forward', 'forwad', 'forwards'],
  hooker: ['hooker', 'forward', 'forwad', 'forwards'],
  scrum_half: ['scrumhalf', 'scrum', 'back', 'backs', 'middlefield'],
  fly_half: ['flyhalf', 'fly', 'back', 'backs', 'middlefield'],
  centre: ['centre', 'center', 'back', 'backs', 'middlefield'],
  winger: ['winger', 'wing', 'back', 'backs'],
}

function usePitchOrientation(): PitchOrientation {
  const [orientation, setOrientation] = useState<PitchOrientation>('portrait')

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setOrientation(mq.matches ? 'landscape' : 'portrait')
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return orientation
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

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

function resolveFormation(poll: VoteParticipant): Formation | null {
  return poll.formation ?? null
}

function matchScore(participant: Participant, position: FormationPosition): number {
  if (participant.slot != null && participant.slot === position.slot) {
    return 100
  }

  const raw = participant.player?.current_position ?? ''
  const token = normalizeToken(raw)
  if (!token) return 0

  const role = normalizeToken(position.role)
  const label = normalizeToken(position.label)
  const aliases = ROLE_ALIASES[position.role] ?? [role]

  if (token === role || token === label) return 90
  if (aliases.some((alias) => alias === token)) return 70
  if (aliases.some((alias) => token.includes(alias) || alias.includes(token))) {
    return 40
  }
  return 0
}

function candidatesForSlot(
  participants: Participant[],
  position: FormationPosition,
  pickedIds: Set<number>,
  query: string,
): Participant[] {
  const q = query.trim().toLowerCase()

  return participants
    .map((participant) => ({
      participant,
      score: matchScore(participant, position),
    }))
    .filter(({ participant, score }) => {
      if (pickedIds.has(participant.id)) return false
      if (score <= 0) return false
      if (!q) return true
      const haystack = [
        participant.name,
        participant.team_name,
        participant.player?.current_position,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.participant.name.localeCompare(b.participant.name)
    })
    .map(({ participant }) => participant)
}

export function SlateVoting({ poll }: { poll: VoteParticipant }) {
  const orientation = usePitchOrientation()
  const formation = resolveFormation(poll)
  const positions = useMemo(() => {
    const order = formation?.positions_order ?? []
    return [...order].sort((a, b) => a.number - b.number || a.slot - b.slot)
  }, [formation])

  const picksRequired = poll.picks_required ?? positions.length

  const [picks, setPicks] = useState<Record<number, Participant>>({})
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [savedPicks, setSavedPicks] = useState<StoredBallotPick[]>([])

  useEffect(() => {
    setSubmitted(resolveHasVoted(poll.id, poll.has_voted))
    setSavedPicks(loadBallotPicks(poll.id) ?? [])
    setHydrated(true)
  }, [poll.has_voted, poll.id])

  const filledCount = Object.keys(picks).length
  const isComplete =
    positions.length > 0 &&
    positions.length === picksRequired &&
    positions.every((position) => picks[position.slot] != null)

  const activePosition =
    activeSlot == null
      ? null
      : (positions.find((p) => p.slot === activeSlot) ?? null)

  const pickedIds = useMemo(
    () => new Set(Object.values(picks).map((p) => p.id)),
    [picks],
  )

  const candidates = useMemo(() => {
    if (!activePosition) return []
    return candidatesForSlot(
      poll.participants,
      activePosition,
      pickedIds,
      query,
    )
  }, [activePosition, poll.participants, pickedIds, query])

  const openSlot = (slot: number) => {
    setActiveSlot(slot)
    setQuery('')
    setError(null)
  }

  const clearSlot = (slot: number) => {
    setPicks((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
  }

  const selectParticipant = (participant: Participant) => {
    if (activeSlot == null) return
    setPicks((prev) => ({ ...prev, [activeSlot]: participant }))
    setActiveSlot(null)
    setQuery('')
  }

  const submitBallot = async () => {
    if (!isComplete || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const session = getOrCreateVotingSessionId()
      await castBallotFn({
        data: {
          causeId: poll.id,
          session,
          comment: null,
          picks: positions.map((position) => ({
            slot: position.slot,
            participant_id: picks[position.slot]!.id,
          })),
        },
      })

      const ballotPicks: StoredBallotPick[] = positions.map((position) => {
        const pick = picks[position.slot]!
        return {
          slot: position.slot,
          number: position.number,
          label: position.label,
          participantId: pick.id,
          name: pick.name,
          teamName: pick.team_name,
        }
      })

      markCauseVoted(poll.id)
      saveBallotPicks(poll.id, ballotPicks)
      setSavedPicks(ballotPicks)
      setSubmitted(true)
      setConfirmOpen(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not submit your team'
      setError(message)

      if (/already|duplicate|once/i.test(message)) {
        markCauseVoted(poll.id)
        setSubmitted(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!formation || positions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-foreground">
          Formation not configured
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This slate poll is missing a formation. Please try again later.
        </p>
      </div>
    )
  }

  // Avoid flashing the pitch before we know if this browser already voted.
  if (!hydrated) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading vote">
        <div className="h-36 animate-pulse rounded-2xl border border-border bg-muted/20" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted/15 lg:h-80" />
      </div>
    )
  }

  if (submitted) {
    const selectionList =
      savedPicks.length > 0
        ? savedPicks
        : positions
            .map((position) => {
              const pick = picks[position.slot]
              if (!pick) return null
              return {
                slot: position.slot,
                number: position.number,
                label: position.label,
                participantId: pick.id,
                name: pick.name,
                teamName: pick.team_name,
              } satisfies StoredBallotPick
            })
            .filter((pick): pick is StoredBallotPick => pick != null)

    return (
      <div className="space-y-5">
        <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 bg-muted/15 px-4 py-5 text-center sm:px-5">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <CheckIcon className="size-6" aria-hidden />
            </div>
            <p className="mt-3 text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
              Team submitted
            </p>
            <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl">
              {poll.reason}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you — your team has been locked in.
            </p>
          </div>
        </header>

        {selectionList.length > 0 ? (
          <ul className="space-y-2">
            {selectionList.map((pick) => (
              <li
                key={pick.slot}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary/15 text-xs font-black text-secondary">
                  {pick.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {pick.name}
                  </p>
                  <p className="truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                    {pick.label}
                    {pick.teamName ? ` · ${pick.teamName}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
        {/* Sidebar: copy + progress + submit */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="bg-muted/15 px-4 py-4 sm:px-5">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
                Build your team
              </p>
              <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl">
                {poll.reason}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Tap a jersey on the pitch, then pick a player for that role.
                Formation:{' '}
                <span className="font-semibold text-foreground">
                  {formation.name}
                </span>
                .
              </p>
              <p className="mt-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {filledCount} of {picksRequired} selected
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{
                    width: `${Math.min(100, (filledCount / picksRequired) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </header>

          <ul className="hidden space-y-1.5 rounded-2xl border border-border bg-card/80 p-3 lg:block">
            {positions.map((position) => {
              const pick = picks[position.slot]
              return (
                <li
                  key={position.slot}
                  className={cn(
                    'flex items-center gap-1 rounded-xl px-1 py-0.5',
                    pick && 'bg-muted/20',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openSlot(position.slot)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[0.65rem] font-black text-secondary">
                      {position.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.65rem] font-bold tracking-wider text-muted-foreground uppercase">
                        {position.label}
                      </span>
                      <span className="block truncate text-sm font-medium text-foreground">
                        {pick ? pick.name : 'Tap to pick'}
                      </span>
                    </span>
                  </button>
                  {pick ? (
                    <button
                      type="button"
                      onClick={() => clearSlot(position.slot)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      aria-label={`Clear ${position.label}`}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>

          {error ? (
            <p className="hidden rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive lg:block">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            size="lg"
            variant="secondary"
            disabled={!isComplete || isSubmitting}
            className="hidden h-11 w-full rounded-xl text-sm font-bold tracking-[0.08em] uppercase lg:inline-flex"
            onClick={() => {
              setError(null)
              setConfirmOpen(true)
            }}
          >
            Submit team
          </Button>
        </aside>

        {/* Pitch — portrait on mobile, landscape on lg+ */}
        <div className="flex w-full justify-center lg:pt-1">
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-2xl border border-emerald-950/50 bg-[#0e3f20] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)]',
              orientation === 'landscape'
                ? 'aspect-[7/5] max-w-none'
                : 'aspect-[5/7] max-w-[22rem] sm:max-w-[26rem]',
            )}
          >
            <RugbyPitchMarkings orientation={orientation} />

            {orientation === 'landscape' ? (
              <>
                <p className="pointer-events-none absolute top-1/2 left-[6%] z-10 -translate-y-1/2 -rotate-90 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
                  Forwards
                </p>
                <p className="pointer-events-none absolute top-1/2 right-[5%] z-10 -translate-y-1/2 rotate-90 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
                  Backs
                </p>
              </>
            ) : (
              <>
                <p className="pointer-events-none absolute top-[7%] left-1/2 z-10 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
                  Forwards
                </p>
                <p className="pointer-events-none absolute bottom-[7%] left-1/2 z-10 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
                  Backs
                </p>
              </>
            )}

            {positions.map((position) => {
              const layout = RUGBY_SLOT_LAYOUT[orientation][position.number] ?? {
                top: '50%',
                left: '50%',
              }
              const pick = picks[position.slot]
              const isActive = activeSlot === position.slot

              return (
                <div
                  key={position.slot}
                  className={cn(
                    'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1',
                    orientation === 'landscape'
                      ? 'w-[4.75rem] sm:w-[5.5rem]'
                      : 'w-[4.5rem] sm:w-[5.25rem]',
                  )}
                  style={{ top: layout.top, left: layout.left }}
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => openSlot(position.slot)}
                      className={cn(
                        'flex items-center justify-center overflow-hidden rounded-full border-2 shadow-lg transition outline-none',
                        orientation === 'landscape'
                          ? 'size-12 lg:size-14'
                          : 'size-11 sm:size-12',
                        'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                        pick
                          ? 'border-secondary bg-card'
                          : 'border-white/55 bg-black/40 text-white backdrop-blur-[2px]',
                        isActive &&
                          'scale-105 border-secondary ring-2 ring-secondary/60',
                      )}
                      aria-label={
                        pick
                          ? `${position.label}: ${pick.name}. Change pick`
                          : `Pick ${position.label}`
                      }
                    >
                      {pick?.image_url || pick?.player?.passportphoto ? (
                        <img
                          src={pick.image_url || pick.player!.passportphoto!}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : pick ? (
                        <span className="text-xs font-bold text-foreground">
                          {getInitials(pick.name) || '—'}
                        </span>
                      ) : (
                        <span className="text-sm font-black">
                          {position.number}
                        </span>
                      )}
                    </button>

                    {pick ? (
                      <button
                        type="button"
                        onClick={() => clearSlot(position.slot)}
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                        aria-label={`Clear ${position.label}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    ) : null}
                  </div>
                  <span className="max-w-full truncate rounded-md bg-black/50 px-1.5 py-0.5 text-center text-[0.6rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                    {pick ? pick.name.split(' ').slice(-1)[0] : position.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile submit */}
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive lg:hidden">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        variant="secondary"
        disabled={!isComplete || isSubmitting}
        className="h-11 w-full rounded-xl text-sm font-bold tracking-[0.08em] uppercase lg:hidden"
        onClick={() => {
          setError(null)
          setConfirmOpen(true)
        }}
      >
        Submit team
      </Button>

      {/* Player picker */}
      <Dialog
        open={activeSlot != null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSlot(null)
            setQuery('')
          }
        }}
      >
        <DialogContent className="max-h-[85vh] gap-4 overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {activePosition
                ? `Pick ${activePosition.label}`
                : 'Pick a player'}
            </DialogTitle>
            <DialogDescription>
              Showing players who fit this role. Search by name or club.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players…"
              className="h-10 rounded-xl pl-9"
              autoFocus
            />
          </div>

          <ul className="-mx-1 max-h-[min(50vh,22rem)] space-y-1 overflow-y-auto px-1">
            {candidates.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                No matching players for this slot.
              </li>
            ) : (
              candidates.map((participant) => {
                const team = teamLabel(participant)
                const positionLabel = participant.player?.current_position
                return (
                  <li key={participant.id}>
                    <button
                      type="button"
                      onClick={() => selectParticipant(participant)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                        {participant.image_url ||
                        participant.player?.passportphoto ? (
                          <img
                            src={
                              participant.image_url ||
                              participant.player!.passportphoto!
                            }
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {getInitials(participant.name) || (
                              <ImageIcon className="size-4 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {participant.name}
                        </p>
                        <p className="truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                          {[positionLabel, team].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </DialogContent>
      </Dialog>

      {/* Confirm submit */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return
          setConfirmOpen(open)
        }}
      >
        <DialogContent showCloseButton={!isSubmitting}>
          <DialogHeader>
            <DialogTitle>Confirm your team</DialogTitle>
            <DialogDescription>
              You can only submit once. Double-check your {picksRequired} picks
              before locking them in.
            </DialogDescription>
          </DialogHeader>

          <ul className="max-h-56 space-y-2 overflow-y-auto">
            {positions.map((position) => {
              const pick = picks[position.slot]
              if (!pick) return null
              return (
                <li
                  key={position.slot}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-16 shrink-0 text-[0.65rem] font-bold tracking-wider text-muted-foreground uppercase">
                    {position.label}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {pick.name}
                  </span>
                </li>
              )
            })}
          </ul>

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
              onClick={() => setConfirmOpen(false)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => {
                void submitBallot()
              }}
            >
              {isSubmitting ? 'Submitting…' : 'Confirm team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
