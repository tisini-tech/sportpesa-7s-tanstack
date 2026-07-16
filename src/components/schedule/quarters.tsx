import { useMemo } from 'react'
import type { Fixture } from '#/lib/types'
import { FixtureRow } from './fixture-row'
import { FixtureSectionHeader } from './fixture-section-header'
import { ScheduleEmptyState } from './schedule-empty-state'

export function QuartersTab({ fixtures }: { fixtures: Fixture[] }) {
  const quarters = fixtures.filter((fixture) =>
    ['377', '378'].includes(fixture.stage ?? ''),
  )

  const groupedQuarters = useMemo(() => {
    const grouped: Record<string, Fixture[]> = {}

    for (const fixture of quarters) {
      const quarterName = fixture.stage_name ?? ''
      if (!grouped[quarterName]) {
        grouped[quarterName] = []
      }
      grouped[quarterName].push(fixture)
    }
    return grouped
  }, [quarters])

  if (quarters.length === 0) {
    return <ScheduleEmptyState stage="quarters" />
  }

  return (
    <div className="space-y-5">
      {Object.entries(groupedQuarters).map(([quarterName, fixtures]) => (
        <article
          key={quarterName}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <FixtureSectionHeader
            title={quarterName}
            subtitle={
              fixtures.length > 1 ? `${fixtures.length} matches` : undefined
            }
          />

          <ul>
            {fixtures.map((fixture) => (
              <FixtureRow key={fixture.id} fixture={fixture} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
