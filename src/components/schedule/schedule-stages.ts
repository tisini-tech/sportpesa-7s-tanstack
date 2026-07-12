export const SCHEDULE_STAGES = [
  { id: 'groups', label: 'Groups' },
  { id: 'quarters', label: 'Quarters' },
  { id: 'semi-finals', label: 'Semi-finals' },
  { id: 'finals', label: 'Finals' },
] as const

export type ScheduleStage = (typeof SCHEDULE_STAGES)[number]['id']

const STAGE_IDS = new Set<ScheduleStage>(
  SCHEDULE_STAGES.map((stage) => stage.id),
)

export function parseScheduleStage(value: unknown): ScheduleStage {
  if (typeof value === 'string' && STAGE_IDS.has(value as ScheduleStage)) {
    return value as ScheduleStage
  }

  return 'groups'
}
