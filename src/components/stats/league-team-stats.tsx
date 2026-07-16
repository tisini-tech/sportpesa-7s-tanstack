import { LeagueTeamLeaderboard } from '#/components/stats/league-team-leaderboard'
import type { TopTeamStats } from '#/lib/types'

export type LeagueTeamLeaderboardData = {
  eventId: number
  label: string
  teams: TopTeamStats[]
}

export function LeagueTeamStats({
  leaderboards,
}: {
  leaderboards: LeagueTeamLeaderboardData[]
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Team stats
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leaderboards.map((leaderboard) => (
          <li key={leaderboard.eventId}>
            <LeagueTeamLeaderboard
              title={leaderboard.label}
              teams={leaderboard.teams}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
