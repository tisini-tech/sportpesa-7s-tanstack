import { useMemo, useState } from 'react'

import { cn } from '#/lib/utils'
import type { Fixture } from '#/lib/types'
import { FixtureRow } from '#/components/schedule/fixture-row'
import { ScheduleEmptyState } from '#/components/schedule/schedule-empty-state'

const GROUP_STAGE_PREFIXES = ['Group', 'Pool']

function isGroupStageFixture(fixture: Fixture): boolean {
  if (!fixture.stage_name) return false

  return GROUP_STAGE_PREFIXES.some((name) =>
    fixture.stage_name.startsWith(name),
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

export function GroupStageTab({ fixtures }: { fixtures: Fixture[] }) {
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

  const seriesName = activeFixtures[0]?.series_name

  if (groupEntries.length === 0) {
    return <ScheduleEmptyState stage="groups" />
  }

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
    </div>
  )
}
