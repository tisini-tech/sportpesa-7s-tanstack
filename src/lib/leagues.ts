import type { Division, Season } from '#/lib/types'

export type LeagueSeries = 'circuit' | 'safari'

export type LeagueDefinition = {
  slug: string
  title: string
  id: number
  series: LeagueSeries
}

export const LEAGUES: LeagueDefinition[] = [
  {
    slug: 'national-7s-circuit-men-div1',
    title: 'National 7s Circuit · Men Div 1',
    id: 238,
    series: 'circuit',
  },
  {
    slug: 'national-7s-circuit-men-div2',
    title: 'National 7s Circuit · Men Div 2',
    id: 292,
    series: 'circuit',
  },
  {
    slug: 'national-7s-circuit-women',
    title: 'National 7s Circuit · Women',
    id: 239,
    series: 'circuit',
  },
  {
    slug: 'safari-7s-men',
    title: 'Safari 7s Men',
    id: 253,
    series: 'safari',
  },
  {
    slug: 'safari-7s-women',
    title: 'Safari 7s Women',
    id: 254,
    series: 'safari',
  },
]

export const DEFAULT_LEAGUE = LEAGUES[3]

export function resolveLeagueBySlug(
  leagueSlug: string,
): LeagueDefinition | undefined {
  return LEAGUES.find((league) => league.slug === leagueSlug)
}

export function getLeagueCompetitionId(leagueSlug: string): string | undefined {
  const league = resolveLeagueBySlug(leagueSlug)
  return league ? String(league.id) : undefined
}

export function isSafariLeague(league: LeagueDefinition): boolean {
  return league.series === 'safari'
}

/** Safari seasons have no API divisions. One synthetic stop keeps `legSlug` required. */
export function materializeSeason(
  season: Season,
  league: LeagueDefinition,
): Season {
  if (season.divisions.length > 0) return season

  const division: Division = {
    id: -season.id,
    name: league.title,
    order: 1,
    date_from: season.date_from,
    date_to: season.date_to,
    day1_video_url: null,
    day2_video_url: null,
    winner_url: null,
    winner_team: null,
    county: '',
    stages: season.stages ?? [],
  }

  return { ...season, divisions: [division] }
}

export function materializeSeasons(
  seasons: Season[],
  league: LeagueDefinition,
): Season[] {
  return seasons.map((season) => materializeSeason(season, league))
}

export function isSyntheticDivision(divisionId: number): boolean {
  return divisionId < 0
}
