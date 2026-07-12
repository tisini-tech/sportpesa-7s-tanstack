import type { Division } from '#/lib/types'

export type DivisionStatus = 'live' | 'upcoming' | 'completed'

function hasDivisionDates(
  division: Division,
): division is Division & { date_from: string; date_to: string } {
  return Boolean(division.date_from && division.date_to)
}

function parseDate(value: string): Date {
  return new Date(value)
}

function endOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

export function getDivisionStatus(
  division: Division,
  now = new Date(),
): DivisionStatus {
  if (!hasDivisionDates(division)) return 'upcoming'

  const start = parseDate(division.date_from)
  const end = endOfDay(parseDate(division.date_to))

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'upcoming'
  }

  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'live'
}

export function formatDivisionHeroDate(division: Division): string {
  if (!hasDivisionDates(division)) return 'Dates TBC'

  const start = parseDate(division.date_from)
  const end = parseDate(division.date_to)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates TBC'
  }

  const dayMonth = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  })

  const startLabel = dayMonth.format(start)

  if (division.date_from.slice(0, 10) === division.date_to.slice(0, 10)) {
    return startLabel
  }

  return `${startLabel} – ${dayMonth.format(end)}`
}

export function formatDivisionStatusLabel(status: DivisionStatus): string {
  if (status === 'live') return 'Live now'
  if (status === 'completed') return 'Completed'
  return 'Upcoming'
}

export function formatDivisionCardDateRange(division: Division): string {
  return formatDivisionHeroDate(division)
}

export function formatDivisionOrder(order: number): string {
  return String(order).padStart(2, '0')
}

function formatDivisionDateLabel(value: string | null): string | null {
  if (!value) return null

  const parsed = parseDate(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}

export function formatDivisionDayLabel(division: Division, day: 1 | 2): string {
  const value = day === 1 ? division.date_from : division.date_to
  return formatDivisionDateLabel(value) ?? 'Date TBC'
}

export function hasDivisionSecondDay(division: Division): boolean {
  if (!division.date_from || !division.date_to) return false
  return division.date_from.slice(0, 10) !== division.date_to.slice(0, 10)
}

export function pickFeaturedDivision(divisions: Division[]): {
  division: Division
  status: DivisionStatus
} | null {
  if (divisions.length === 0) return null

  const ranked = [...divisions]
    .sort((a, b) => a.order - b.order)
    .map((division) => ({
      division,
      status: getDivisionStatus(division),
    }))

  const live = ranked.find((entry) => entry.status === 'live')
  if (live) return live

  const upcoming = ranked
    .filter((entry) => entry.status === 'upcoming')
    .sort((a, b) => {
      if (!hasDivisionDates(a.division) || !hasDivisionDates(b.division)) {
        return a.division.order - b.division.order
      }

      return (
        parseDate(a.division.date_from).getTime() -
        parseDate(b.division.date_from).getTime()
      )
    })
  if (upcoming[0]) return upcoming[0]

  const completed = ranked
    .filter((entry) => entry.status === 'completed')
    .sort((a, b) => {
      if (!hasDivisionDates(a.division) || !hasDivisionDates(b.division)) {
        return b.division.order - a.division.order
      }

      return (
        parseDate(b.division.date_to).getTime() -
        parseDate(a.division.date_to).getTime()
      )
    })

  return completed[0] ?? ranked[0]
}
