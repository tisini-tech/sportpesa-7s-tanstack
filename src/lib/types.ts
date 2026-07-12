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
  league_name: string
  series: string
  series_name: string
  division: string
  division_name: string
  stage: string
  stage_name: string
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
