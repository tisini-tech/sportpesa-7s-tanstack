import { useMemo, useState } from 'react'

import { cn } from '#/lib/utils'
import type { Fixture, Standing, StageStanding } from '#/lib/types'
import { FixtureRow } from '#/components/schedule/fixture-row'
import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { ScheduleEmptyState } from '#/components/schedule/schedule-empty-state'

const GROUP_STAGE_PREFIXES = ['Group', 'Pool']

function isGroupStageFixture(fixture: Fixture): boolean {
  if (!fixture.stage_name) return false

  return GROUP_STAGE_PREFIXES.some((name) =>
    fixture.stage_name!.startsWith(name),
  )
}

function sortFixtures(fixtures: Fixture[]): Fixture[] {
  return [...fixtures].sort((a, b) => {
    const aTime = new Date(a.game_date ?? '').getTime()
    const bTime = new Date(b.game_date ?? '').getTime()

    if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
      return aTime - bTime
    }

    return (a.matchtime ?? '').localeCompare(b.matchtime ?? '')
  })
}

function groupFixturesByStage(fixtures: Fixture[]): Record<string, Fixture[]> {
  const grouped: Record<string, Fixture[]> = {}

  for (const fixture of fixtures) {
    const groupName = fixture.stage_name ?? 'Unassigned'
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(fixture)
  }

  for (const groupName of Object.keys(grouped)) {
    grouped[groupName] = sortFixtures(grouped[groupName])
  }

  return grouped
}

function getPoolTabLabel(groupName: string): string {
  const match = groupName.match(/(?:pool|group)\s*([a-z])/i)
  if (match) return `Pool ${match[1].toUpperCase()}`
  return groupName
}

function sortStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts
    if (b.GD !== a.GD) return b.GD - a.GD
    return b.GF - a.GF
  })
}

function getTeamInitials(name: string | null | undefined): string {
  const source = name || 'TBD'
  return source.slice(0, 2).toUpperCase()
}

export function GroupStageTab({
  fixtures,
  standings,
}: {
  fixtures: Fixture[]
  standings: StageStanding[]
}) {
  const [activePool, setActivePool] = useState('')

  const groupEntries = useMemo(() => {
    const groupStage = fixtures.filter(isGroupStageFixture)
    const grouped = groupFixturesByStage(groupStage)

    return Object.entries(grouped).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true }),
    )
  }, [fixtures])

  const effectiveActivePool = groupEntries.some(([name]) => name === activePool)
    ? activePool
    : (groupEntries[0]?.[0] ?? '')

  const activeFixtures =
    groupEntries.find(([name]) => name === effectiveActivePool)?.[1] ?? []

  const poolLabel = getPoolTabLabel(effectiveActivePool)

  const activeStandings = useMemo(() => {
    const stage =
      standings.find((item) => item.name === effectiveActivePool) ??
      standings.find((item) => item.name === activeFixtures[0]?.stage_name)

    return stage ? sortStandings(stage.standings) : []
  }, [standings, effectiveActivePool, activeFixtures])

  const seriesName = activeFixtures[0]?.series_name

  if (groupEntries.length === 0) {
    return <ScheduleEmptyState stage="groups" />
  }

  console.log(fixtures)

  return (
    <div className="space-y-5">
      <div
        className="inline-flex w-full flex-wrap gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5 sm:w-fit"
        role="tablist"
        aria-label="Pool"
      >
        {groupEntries.map(([groupName]) => {
          const isActive = effectiveActivePool === groupName
          const tabLabel = getPoolTabLabel(groupName)

          return (
            <button
              key={groupName}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActivePool(groupName)}
              className={cn(
                'min-w-[4.5rem] flex-1 rounded-lg px-3.5 py-2 text-[0.65rem] font-bold tracking-[0.12em] uppercase transition-colors sm:min-w-[5.5rem] sm:flex-none sm:px-5',
                isActive
                  ? 'bg-secondary/15 text-secondary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {tabLabel}
            </button>
          )
        })}
      </div>

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {seriesName ? (
          <header className="border-b border-border/60 bg-muted/15 px-4 py-2.5">
            <p className="text-xs text-muted-foreground/75">{seriesName}</p>
          </header>
        ) : null}

        <ul>
          {activeFixtures.map((fixture) => (
            <FixtureRow key={fixture.id} fixture={fixture} />
          ))}
        </ul>
      </article>

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <FixtureSectionHeader title="Standings" subtitle={poolLabel} />

        {activeStandings.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Standings will appear once pool matches are underway.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="px-3 py-2.5 text-left font-semibold sm:px-4">
                    #
                  </th>
                  <th className="px-2 py-2.5 text-left font-semibold">Team</th>
                  <th className="px-2 py-2.5 text-center font-semibold">P</th>
                  <th className="hidden px-2 py-2.5 text-center font-semibold sm:table-cell">
                    W
                  </th>
                  <th className="hidden px-2 py-2.5 text-center font-semibold sm:table-cell">
                    D
                  </th>
                  <th className="hidden px-2 py-2.5 text-center font-semibold sm:table-cell">
                    L
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold">PF</th>
                  <th className="px-2 py-2.5 text-center font-semibold">PA</th>
                  <th className="px-2 py-2.5 text-center font-semibold">PD</th>
                  <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeStandings.map((standing, index) => (
                  <StandingRow
                    key={standing.id}
                    standing={standing}
                    position={index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  )
}

function StandingRow({
  standing,
  position,
}: {
  standing: Standing
  position: number
}) {
  const isTopTwo = position <= 2
  const goalDiff = standing.GD > 0 ? `+${standing.GD}` : standing.GD.toString()

  return (
    <tr
      className={cn(
        'border-b border-border/60 last:border-b-0',
        isTopTwo && 'bg-secondary/[0.04]',
      )}
    >
      <td className="px-3 py-3 sm:px-4">
        <span
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-md text-xs font-bold tabular-nums',
            isTopTwo
              ? 'bg-secondary/15 text-secondary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {position}
        </span>
      </td>

      <td className="px-2 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
            {standing.logo ? (
              <img
                src={standing.logo}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-[0.6rem] font-bold text-muted-foreground">
                {getTeamInitials(standing.short_name || standing.team_name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground/85">
              {standing.team_name}
            </p>
            {standing.live?.status ? (
              <p className="truncate text-[0.65rem] text-secondary">
                Live vs {standing.live.opponent} · {standing.live.score}
              </p>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-2 py-3 text-center tabular-nums text-foreground/75">
        {standing.P}
      </td>
      <td className="hidden px-2 py-3 text-center tabular-nums text-foreground/75 sm:table-cell">
        {standing.W}
      </td>
      <td className="hidden px-2 py-3 text-center tabular-nums text-foreground/75 sm:table-cell">
        {standing.D}
      </td>
      <td className="hidden px-2 py-3 text-center tabular-nums text-foreground/75 sm:table-cell">
        {standing.L}
      </td>
      <td className="px-2 py-3 text-center tabular-nums text-foreground/75">
        {standing.GF}
      </td>
      <td className="px-2 py-3 text-center tabular-nums text-foreground/75">
        {standing.GA}
      </td>
      <td className="px-2 py-3 text-center tabular-nums text-foreground/75">
        {goalDiff}
      </td>
      <td className="px-3 py-3 text-center sm:px-4">
        <span className="text-base font-bold tabular-nums text-primary">
          {standing.Pts}
        </span>
      </td>
    </tr>
  )
}
