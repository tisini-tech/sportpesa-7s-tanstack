import { pickFeaturedDivision } from '#/components/landing/division-utils'
import type { Division, Season } from '#/lib/types'

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getSeasonSlug(season: Pick<Season, 'name'>): string {
  return slugify(season.name)
}

export function getLegSlug(division: Pick<Division, 'name'>): string {
  return slugify(division.name)
}

export function resolveSeasonBySlug(
  seasons: Season[],
  seasonSlug: string,
): Season | undefined {
  return seasons.find((season) => getSeasonSlug(season) === seasonSlug)
}

export function resolveDivisionBySlug(
  season: Season,
  legSlug: string,
): Division | undefined {
  return season.divisions.find((division) => getLegSlug(division) === legSlug)
}

export function buildTournamentPath(season: Season, division: Division): string {
  return `/${getSeasonSlug(season)}/${getLegSlug(division)}`
}

export function buildSchedulePath(season: Season, division: Division): string {
  return `${buildTournamentPath(season, division)}/schedule`
}

export function buildFeaturedTournamentPath(seasons: Season[]): string | null {
  const season = seasons[0]
  if (!season) return null

  const featured = pickFeaturedDivision(season.divisions)
  if (!featured) return `/${getSeasonSlug(season)}`

  return buildTournamentPath(season, featured.division)
}

export function getTournamentBaseFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/([^/]+)/)
  if (!match) return null

  return `/${match[1]}/${match[2]}`
}
