export const LEAGUE_TEAM_LEADERBOARD_LIMIT = 7

export type StatMetric<K extends string = string> = {
  key: K
  label: string
  /** Event ID for 2024 / 2025 seasons. */
  legacyEventId: string
  /** Event ID for 2026+ seasons. */
  eventId: string
  isPoints?: boolean
}

export type LeagueTeamMetricKey =
  | 'tries'
  | 'points'
  | 'visits'
  | 'carries'
  | 'tackles'
  | 'turnovers'
  | 'penalties'
  | 'handling-errors'

export type LeaguePlayerMetricKey =
  | 'tries'
  | 'points'
  | 'line-breaks'
  | 'assists'
  | 'carries'
  | 'tackles'
  | 'offloads'
  | 'turnovers'

export type LeagueTeamMetric = StatMetric<LeagueTeamMetricKey>
export type LeaguePlayerMetric = StatMetric<LeaguePlayerMetricKey>

export const LEAGUE_TEAM_METRICS: LeagueTeamMetric[] = [
  {
    key: 'tries',
    label: 'Tries',
    legacyEventId: '33',
    eventId: '253',
  },
  {
    key: 'points',
    label: 'Points',
    legacyEventId: '33',
    eventId: '253',
    isPoints: true,
  },
  {
    key: 'visits',
    label: 'Visits in opp 22',
    legacyEventId: '122',
    eventId: '245',
  },
  {
    key: 'carries',
    label: 'Carries',
    legacyEventId: '58',
    eventId: '250',
  },
  {
    key: 'tackles',
    label: 'Tackles',
    legacyEventId: '56',
    eventId: '251',
  },
  {
    key: 'turnovers',
    label: 'Turnovers won',
    legacyEventId: '59',
    eventId: '258',
  },
  {
    key: 'penalties',
    label: 'Penalties conceded',
    legacyEventId: '60',
    eventId: '257',
  },
  {
    key: 'handling-errors',
    label: 'Handling errors',
    legacyEventId: '255',
    eventId: '255',
  },
]

export const LEAGUE_PLAYER_METRICS: LeaguePlayerMetric[] = [
  {
    key: 'tries',
    label: 'Tries',
    legacyEventId: '33',
    eventId: '253',
  },
  {
    key: 'points',
    label: 'Points',
    legacyEventId: '33',
    eventId: '253',
    isPoints: true,
  },
  {
    key: 'line-breaks',
    label: 'Line breaks',
    legacyEventId: '37',
    eventId: '243',
  },
  {
    key: 'assists',
    label: 'Assists',
    legacyEventId: '180',
    eventId: '254',
  },
  {
    key: 'carries',
    label: 'Carries',
    legacyEventId: '58',
    eventId: '250',
  },
  {
    key: 'tackles',
    label: 'Tackles',
    legacyEventId: '56',
    eventId: '251',
  },
  {
    key: 'offloads',
    label: 'Offloads',
    legacyEventId: '83',
    eventId: '244',
  },
  {
    key: 'turnovers',
    label: 'Turnovers won',
    legacyEventId: '59',
    eventId: '258',
  },
]

export function isLegacySeasonSlug(seasonSlug: string): boolean {
  return seasonSlug === '2024' || seasonSlug === '2025'
}

export function resolveMetricEventId(
  metric: StatMetric,
  seasonSlug: string,
): string {
  return isLegacySeasonSlug(seasonSlug) ? metric.legacyEventId : metric.eventId
}

function resolveMetric<M extends StatMetric>(
  metrics: M[],
  seasonSlug: string,
  statsId: string,
  isPoints?: boolean,
): M {
  const wantsPoints = Boolean(isPoints)

  const match = metrics.find((metric) => {
    if (resolveMetricEventId(metric, seasonSlug) !== statsId) return false
    return Boolean(metric.isPoints) === wantsPoints
  })

  return match ?? metrics[0]
}

export function resolveLeagueTeamMetric(
  seasonSlug: string,
  statsId: string,
  isPoints?: boolean,
): LeagueTeamMetric {
  return resolveMetric(LEAGUE_TEAM_METRICS, seasonSlug, statsId, isPoints)
}

export function resolveLeaguePlayerMetric(
  seasonSlug: string,
  statsId: string,
  isPoints?: boolean,
): LeaguePlayerMetric {
  return resolveMetric(LEAGUE_PLAYER_METRICS, seasonSlug, statsId, isPoints)
}

/** Season slug → event IDs used on the league stats hub. */
export function getLeagueStatsEvents(seasonSlug: string) {
  const byKey = (key: LeagueTeamMetricKey) =>
    resolveMetricEventId(
      LEAGUE_TEAM_METRICS.find((metric) => metric.key === key)!,
      seasonSlug,
    )

  return {
    score: byKey('tries'),
    visits: byKey('visits'),
    carries: byKey('carries'),
  }
}

export function getLeagueStatLabel({
  seasonSlug,
  statsId,
  isPoints,
}: {
  seasonSlug: string
  statsId: string
  isPoints?: boolean
}): string {
  return resolveLeagueTeamMetric(seasonSlug, statsId, isPoints).label
}
