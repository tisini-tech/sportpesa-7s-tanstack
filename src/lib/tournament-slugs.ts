import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
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

export function buildTournamentPath(
  leagueSlug: string,
  season: Season,
  division: Division,
): string {
  return `/${leagueSlug}/${getSeasonSlug(season)}/${getLegSlug(division)}`
}

export function buildSchedulePath(
  leagueSlug: string,
  season: Season,
  division: Division,
): string {
  return `${buildTournamentPath(leagueSlug, season, division)}/schedule`
}

export function buildFeaturedTournamentPath(
  seasons: Season[],
  leagueSlug: string = DEFAULT_LEAGUE.slug,
): string | null {
  const season = seasons[0]
  if (!season) return null

  const featured = pickFeaturedDivision(season.divisions)
  if (!featured) return `/${leagueSlug}/${getSeasonSlug(season)}`

  return buildTournamentPath(leagueSlug, season, featured.division)
}

export function getTournamentBaseFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/([^/]+)\/([^/]+)/)
  if (!match) return null

  return `/${match[1]}/${match[2]}/${match[3]}`
}

export function getFeaturedTournamentParams(
  seasons: Season[],
  leagueSlug: string = DEFAULT_LEAGUE.slug,
): { leagueSlug: string; seasonSlug: string; legSlug: string } | null {
  const season = seasons[0]
  if (!season) return null

  const featured = pickFeaturedDivision(season.divisions)
  if (!featured) return null

  return {
    leagueSlug,
    seasonSlug: getSeasonSlug(season),
    legSlug: getLegSlug(featured.division),
  }
}
