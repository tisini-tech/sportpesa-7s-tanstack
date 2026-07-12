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
