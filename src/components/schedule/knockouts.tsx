import { useMemo } from 'react'

import { FixtureRow } from '#/components/schedule/fixture-row'
import { FixtureSectionHeader } from '#/components/schedule/fixture-section-header'
import { ScheduleEmptyState } from '#/components/schedule/schedule-empty-state'
import type { Fixture, Stage } from '#/lib/types'

function isPlayoffFixture(fixture: Fixture, stages: Stage[]): boolean {
  const stage = stages.find((item) => String(item.id) === String(fixture.stage))
  if (stage) return stage.kind === 'playoff'
  const name = (fixture.stage_name ?? '').toLowerCase()
  return name.includes('final') || name.includes('playoff') || name.includes('play-off')
}

export function KnockoutsTab({
  fixtures,
  stages,
}: {
  fixtures: Fixture[]
  stages: Stage[]
}) {
  const grouped = useMemo(() => {
    const playoffs = fixtures.filter((fixture) => isPlayoffFixture(fixture, stages))
    const order = [...stages].reverse().filter((stage) => stage.kind === 'playoff')
    const buckets = new Map<string, Fixture[]>()

    for (const fixture of playoffs) {
      const name = fixture.stage_name ?? 'Knockout'
      const list = buckets.get(name) ?? []
      list.push(fixture)
      buckets.set(name, list)
    }

    const names = [
      ...order.map((stage) => stage.name).filter((name) => buckets.has(name)),
      ...[...buckets.keys()].filter(
        (name) => !order.some((stage) => stage.name === name),
      ),
    ]

    return names.map((name) => [name, buckets.get(name) ?? []] as const)
  }, [fixtures, stages])

  if (grouped.length === 0) {
    return <ScheduleEmptyState stage="finals" />
  }

  return (
    <div className="space-y-5">
      {grouped.map(([name, matches]) => (
        <article
          key={name}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <FixtureSectionHeader
            title={name}
            subtitle={matches.length > 1 ? `${matches.length} matches` : undefined}
          />
          <ul>
            {matches.map((fixture) => (
              <FixtureRow key={fixture.id} fixture={fixture} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
