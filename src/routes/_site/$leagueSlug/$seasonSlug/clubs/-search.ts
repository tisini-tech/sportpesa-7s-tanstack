import { readLeg } from '../-season'

function readTeamId(value: unknown): number | undefined {
  const teamId =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : undefined

  return teamId != null && !Number.isNaN(teamId) ? teamId : undefined
}

export function clubSearch(search: Record<string, unknown>) {
  return {
    leg: readLeg(search),
    teamId: readTeamId(search.teamId),
  }
}
