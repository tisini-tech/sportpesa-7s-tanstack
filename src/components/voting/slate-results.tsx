import { useMemo, useState } from 'react'
import { ImageIcon, TrophyIcon } from 'lucide-react'

import {
  RUGBY_SLOT_LAYOUT,
  RugbyPitchMarkings,
} from '#/components/voting/rugby-pitch'
import type { PlayerOfTheWeek, Slot, VoteParticipant } from '#/lib/types'
import { cn } from '#/lib/utils'

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatVotes(count: number): string {
  return new Intl.NumberFormat('en-GB').format(count)
}

function teamLabel(player: {
  team_name?: string | null
  description?: string | null
}): string | null {
  return player.team_name || player.description || null
}

/** Landscape pitch positions for team-of-the-week (attack left). */
const TOTW_LAYOUT = RUGBY_SLOT_LAYOUT.landscape

export function SlateVoteResults({ poll }: { poll: VoteParticipant }) {
  const team = [...(poll.team_of_the_week ?? [])].sort(
    (a, b) => a.slot - b.slot,
  )
  const slots = [...(poll.slots ?? [])].sort((a, b) => a.slot - b.slot)
  const ballots = poll.ballots_casted ?? 0
  const formationName = poll.formation?.name

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-5">
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            Results
          </p>
          <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-foreground uppercase sm:text-2xl">
            {poll.reason}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatVotes(ballots)} {ballots === 1 ? 'ballot' : 'ballots'} cast
            {formationName ? ` · Formation ${formationName}` : ''}
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            Team of the week
          </p>
          <h2 className="mt-0.5 font-heading text-lg font-black tracking-tight text-foreground uppercase">
            Leading XI
          </h2>
        </div>

        {team.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">
              No leading team yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Leaders will appear once ballots are counted.
            </p>
          </div>
        ) : (
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-5">
            <ul className="flex h-full flex-col justify-between gap-3">
              {team.map((player) => (
                <TotwListRow key={player.participant_id} player={player} />
              ))}
            </ul>
            <TeamOfWeekPitch team={team} />
          </div>
        )}
      </section>

      <SlotBreakdown slots={slots} />
    </div>
  )
}

function TeamOfWeekPitch({ team }: { team: PlayerOfTheWeek[] }) {
  return (
    <div className="relative aspect-[7/5] w-full overflow-hidden rounded-2xl border border-emerald-950/50 bg-[#0e3f20] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)] lg:aspect-auto lg:h-full lg:min-h-0">
      <RugbyPitchMarkings orientation="landscape" idPrefix="totw" />

      <p className="pointer-events-none absolute top-1/2 left-[6%] z-10 -translate-y-1/2 -rotate-90 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
        Forwards
      </p>
      <p className="pointer-events-none absolute top-1/2 right-[5%] z-10 -translate-y-1/2 rotate-90 text-[0.6rem] font-bold tracking-[0.22em] text-white/45 uppercase">
        Backs
      </p>

      {team.map((player) => {
        const layout = TOTW_LAYOUT[player.slot] ?? { top: '50%', left: '50%' }
        return (
          <div
            key={player.participant_id}
            className="absolute z-10 flex w-[4.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 sm:w-[5.25rem]"
            style={{ top: layout.top, left: layout.left }}
          >
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-card shadow-lg sm:size-12">
              {player.image_url || player.player?.passportphoto ? (
                <img
                  src={player.image_url || player.player!.passportphoto!}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-secondary">
                  {getInitials(player.name) || player.slot}
                </span>
              )}
            </div>
            <span className="max-w-full truncate rounded-md bg-black/50 px-1.5 py-0.5 text-center text-[0.6rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
              {player.name.split(/\s+/).slice(-1)[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TotwListRow({ player }: { player: PlayerOfTheWeek }) {
  const team = teamLabel(player)

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-secondary/30 bg-card px-3.5 py-3.5 ring-1 ring-secondary/15 sm:py-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-black text-secondary">
        {player.slot}
      </span>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
        {player.image_url ? (
          <img
            src={player.image_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="text-[0.65rem] font-bold text-muted-foreground">
            {getInitials(player.name) || '—'}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {player.name}
        </p>
        <p className="truncate text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          {team ?? '—'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-black tabular-nums text-secondary">
          {formatVotes(player.picks)}
        </p>
        <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase">
          picks
        </p>
      </div>
    </li>
  )
}

function SlotBreakdown({ slots }: { slots: Slot[] }) {
  const [selectedSlot, setSelectedSlot] = useState(() => slots[0]?.slot ?? 1)

  const active = useMemo(
    () => slots.find((slot) => slot.slot === selectedSlot) ?? slots[0] ?? null,
    [slots, selectedSlot],
  )

  const ranked = useMemo(() => {
    if (!active) return []
    return [...(active.players ?? [])].sort((a, b) => b.picks - a.picks)
  }, [active])

  const totalPicks = ranked.reduce((sum, p) => sum + (p.picks || 0), 0)
  const maxPicks = ranked[0]?.picks ?? 0

  if (slots.length === 0) {
    return (
      <section className="space-y-3">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            By position
          </p>
          <h2 className="mt-0.5 font-heading text-lg font-black tracking-tight text-foreground uppercase">
            Slot standings
          </h2>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Slot breakdowns are not available yet.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-secondary uppercase">
            By position
          </p>
          <h2 className="mt-0.5 font-heading text-lg font-black tracking-tight text-foreground uppercase">
            Slot standings
          </h2>
        </div>

        <label className="flex flex-col gap-1.5 sm:min-w-[14rem]">
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Filter slot
          </span>
          <select
            value={active?.slot ?? selectedSlot}
            onChange={(e) => setSelectedSlot(Number(e.target.value))}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {slots.map((slot) => (
              <option key={slot.slot} value={slot.slot}>
                Slot {slot.slot} · {slot.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/15 px-4 py-3">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Slot {active?.slot} · {active?.line}
            </p>
            <h3 className="font-heading text-base font-black tracking-tight text-foreground uppercase">
              {active?.label}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-black tabular-nums text-secondary">
              {formatVotes(totalPicks)}
            </p>
            <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase">
              picks
            </p>
          </div>
        </div>

        {ranked.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No picks for this slot yet.
          </p>
        ) : (
          <ol className="divide-y divide-border/60">
            {ranked.map((player, index) => (
              <SlotPlayerRow
                key={player.participant_id}
                player={player}
                rank={index + 1}
                maxPicks={maxPicks}
                totalPicks={totalPicks}
              />
            ))}
          </ol>
        )}
      </article>
    </section>
  )
}

function SlotPlayerRow({
  player,
  rank,
  maxPicks,
  totalPicks,
}: {
  player: PlayerOfTheWeek
  rank: number
  maxPicks: number
  totalPicks: number
}) {
  const isLeader = rank === 1
  const picks = player.picks || 0
  const share = totalPicks > 0 ? Math.round((picks / totalPicks) * 100) : 0
  const barWidth = maxPicks > 0 ? (picks / maxPicks) * 100 : 0
  const team = teamLabel(player)

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums',
            isLeader
              ? 'bg-secondary/15 text-secondary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isLeader ? <TrophyIcon className="size-3.5" aria-hidden /> : rank}
        </span>

        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
          {player.image_url ? (
            <img
              src={player.image_url}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-3.5 text-muted-foreground opacity-70" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {player.name}
              </p>
              {team ? (
                <p className="truncate text-[0.65rem] text-muted-foreground uppercase">
                  {team}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  'text-sm font-black tabular-nums',
                  isLeader ? 'text-secondary' : 'text-foreground',
                )}
              >
                {formatVotes(picks)}
              </p>
              <p className="text-[0.6rem] tabular-nums text-muted-foreground">
                {share}%
              </p>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn(
                'h-full rounded-full',
                isLeader ? 'bg-secondary' : 'bg-primary/70',
              )}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </div>
    </li>
  )
}
