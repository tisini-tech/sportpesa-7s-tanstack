import { TrophyIcon } from 'lucide-react'

import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import type { QuizLeaderboard } from '#/lib/types'
import { cn } from '#/lib/utils'

function formatTimeUsed(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'

  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60

  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

function getUsernameInitials(username: string | null | undefined): string {
  const source = username || 'U'
  return source.slice(0, 2).toUpperCase()
}

export function QuizLeaderboardTable({
  entries,
  title = 'Leaderboard',
}: {
  entries: QuizLeaderboard[]
  title?: string
}) {
  const sorted = [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.time_used - b.time_used
  })

  if (sorted.length === 0) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader title={title} />
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No scores yet. Be the first to complete this quiz.
        </p>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <FixtureSectionHeader
        title={title}
        subtitle={`${sorted.length} ${sorted.length === 1 ? 'player' : 'players'}`}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              <th className="px-3 py-2.5 text-left font-semibold sm:px-4">#</th>
              <th className="px-2 py-2.5 text-left font-semibold">Username</th>
              <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                Score
              </th>
              <th className="px-3 py-2.5 text-right font-semibold sm:px-4">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function LeaderboardRow({
  entry,
  rank,
}: {
  entry: QuizLeaderboard
  rank: number
}) {
  const isLeader = rank === 1
  const username = entry.user?.username || 'Unknown'

  return (
    <tr
      className={cn(
        'border-b border-border/60 last:border-b-0',
        isLeader && 'bg-secondary/[0.04]',
      )}
    >
      <td className="px-3 py-3 sm:px-4">
        <span
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-md text-xs font-bold tabular-nums',
            isLeader
              ? 'bg-secondary/15 text-secondary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isLeader ? <TrophyIcon className="size-3.5" aria-hidden /> : rank}
        </span>
      </td>

      <td className="px-2 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
            <span className="text-[0.65rem] font-bold text-muted-foreground">
              {getUsernameInitials(username)}
            </span>
          </div>
          <span
            className={cn(
              'truncate font-medium',
              isLeader ? 'text-foreground' : 'text-foreground/90',
            )}
          >
            {username}
          </span>
        </div>
      </td>

      <td className="px-3 py-3 text-center sm:px-4">
        <span
          className={cn(
            'font-bold tabular-nums',
            isLeader ? 'text-secondary' : 'text-primary',
          )}
        >
          {entry.score}
        </span>
      </td>

      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground sm:px-4">
        {formatTimeUsed(entry.time_used)}
      </td>
    </tr>
  )
}
