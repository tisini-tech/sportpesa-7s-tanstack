export type LeagueDefinition = {
  slug: string
  title: string
  id: number
}

export const LEAGUES: LeagueDefinition[] = [
  { slug: 'div1', title: 'Division 1', id: 238 },
  { slug: 'div2', title: 'Division 2', id: 292 },
  { slug: 'women', title: 'Women', id: 239 },
]

export const DEFAULT_LEAGUE = LEAGUES[0]

export function resolveLeagueBySlug(
  leagueSlug: string,
): LeagueDefinition | undefined {
  return LEAGUES.find((league) => league.slug === leagueSlug)
}

export function getLeagueCompetitionId(leagueSlug: string): string | undefined {
  const league = resolveLeagueBySlug(leagueSlug)
  return league ? String(league.id) : undefined
}
