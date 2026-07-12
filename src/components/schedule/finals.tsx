import { useMemo } from 'react'

import { FixtureRow } from './fixture-row'
import { FixtureSectionHeader } from './fixture-section-header'
import { ScheduleEmptyState } from './schedule-empty-state'
import type { Fixture } from '#/lib/types'

export function FinalsTab({ fixtures }: { fixtures: Fixture[] }) {
  const final = [
    'Cup Final',
    '3rd Place Final',
    '5th Place Final',
    'Challenge Final',
    '13th Place Final',
  ]

  const finals = fixtures.filter((fixture) =>
    final.includes(fixture.stage_name),
  )

  const groupedQuarters = useMemo(() => {
    const grouped: Record<string, Fixture[]> = {}

    for (const fixture of finals) {
      const quarterName = fixture.stage_name

      if (!grouped[quarterName]) {
        grouped[quarterName] = []
      }
      grouped[quarterName].push(fixture)
    }
    return grouped
  }, [finals])

  if (finals.length === 0) {
    return <ScheduleEmptyState stage="finals" />
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
