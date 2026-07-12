export interface Season {
  id: number
  name: string
  status: number
  tournament: number
  date_from: string
  date_to: string
  divisions: Division[]
}

export interface Division {
  id: number
  name: string
  order: number
  date_from: string | null
  date_to: string | null
  county: string
  stages: Stage[]
}

export interface Stage {
  id: number
  name: string
  kind: string
}

export interface Fixture {
  id: number
  team1_id: number
  team2_id: number
  team1_name: string
  team2_name: string
  team1_short_name: string
  team2_short_name: string
  home_score: string
  away_score: string
  home_ht_score: string
  away_ht_score: string
  home_penalties: string
  away_penalties: string
  fixture_type: string
  matchday: string
  league: string
  league_name?: string
  series: string
  series_name?: string
  division?: string
  division_name?: string
  stage?: string
  stage_name?: string
  game_status: string
  game_moment: string
  game_date: string
  minute: number
  second: number
  matchtime: string
  location_id: number
  team1_logo: string
  team2_logo: string
  venue: Venue
  referees: Referee[]
}

export interface Venue {
  id: number
  name: string
  county: string
  latitude: string
  longitude: string
}

export interface Referee {
  id: number
  name: string
  role: string
}

export interface FixtureDetails {
  fixture: Fixture
  stats: FixtureStats
  highlights: Highlight[]
}

export interface FixtureStats {
  home: EventStat[]
  away: EventStat[]
}

export interface EventStat {
  event_id: number
  event_name: string
  total: number
  sub_events: SubEvent[]
}

export interface SubEvent {
  sub_event_id: string
  sub_event_name: string
  total: number
}

export interface Highlight {
  id: number
  event_name: string
  event_id: number
  time: string
  team: number
  gameid: number
  narration: string
  player_id: number
  subevent_id: string
  subplayer_id: string
  subplayer_name: string
  game_minute: string
  game_second: string
  game_moment: string
  teamplayer_id: string
  player_type: string
  pname: string
  jersey_no: string
  subsubevent_id: string
  quarter: string
}

export interface FixtureLineups {
  home: FixtureLineup[]
  away: FixtureLineup[]
}

export interface FixtureLineup {
  id: number
  fixture_id: number
  date_created: string
  team_player_id: number
  jersey_no: number
  player_type: string
  player: number
  teamid: string
  pname: string
  last_updated: string
  lineupposition: number
  red: number
  gk: number
  passportphoto: string
  minutes_played: number
  rating: number | null
}

export interface FixtureH2H {
  home: Fixture[]
  away: Fixture[]
  h2h: Fixture[]
  logos: TeamLogo[]
}

export interface TeamLogo {
  team_id: number
  logo: string
}
