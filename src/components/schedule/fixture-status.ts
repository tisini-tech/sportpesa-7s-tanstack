import type { Fixture } from '#/lib/types'

export type FixtureStatus = 'live' | 'halftime' | 'completed' | 'upcoming'

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '')
}

function isPlayingMoment(moment: string): boolean {
  return (
    moment === 'firsthalf' ||
    moment === 'secondhalf' ||
    moment === '1sthalf' ||
    moment === '2ndhalf' ||
    moment.includes('playing') ||
    moment.includes('progress')
  )
}

function isHalftimeMoment(moment: string): boolean {
  return moment === 'ht' || moment === 'halftime' || moment === 'half'
}

function isCompletedMoment(moment: string): boolean {
  return (
    moment === 'ft' ||
    moment === 'fulltime' ||
    moment === 'ended' ||
    moment.includes('complete') ||
    moment.includes('finish')
  )
}

/**
 * Prefer `game_moment` when the API lags on `game_status`
 * (e.g. status still "HT" after second half has started).
 */
export function getFixtureStatus(fixture: Fixture): FixtureStatus {
  const status = normalize(fixture.game_status)
  const moment = normalize(fixture.game_moment)

  if (
    status === 'ft' ||
    status === 'ended' ||
    status.includes('complete') ||
    status.includes('finish') ||
    status.includes('played') ||
    isCompletedMoment(moment)
  ) {
    return 'completed'
  }

  // In-play periods beat a stale HT status
  if (isPlayingMoment(moment)) {
    return 'live'
  }

  if (
    status === 'ht' ||
    status === 'halftime' ||
    isHalftimeMoment(moment)
  ) {
    return 'halftime'
  }

  if (
    status === 'started' ||
    status === 'live' ||
    status.includes('playing') ||
    status.includes('progress')
  ) {
    return 'live'
  }

  if (
    status === 'notstarted' ||
    status.includes('schedul') ||
    status.includes('pending') ||
    moment === 'notstarted' ||
    !status
  ) {
    return 'upcoming'
  }

  return 'upcoming'
}

export function isFixtureLive(fixture: Fixture): boolean {
  const status = getFixtureStatus(fixture)
  return status === 'live' || status === 'halftime'
}

export function isFixtureCompleted(fixture: Fixture): boolean {
  return getFixtureStatus(fixture) === 'completed'
}

export function isFixtureUpcoming(fixture: Fixture): boolean {
  return getFixtureStatus(fixture) === 'upcoming'
}

export function formatFixtureClock(fixture: Fixture): string | null {
  if (
    typeof fixture.minute !== 'number' ||
    Number.isNaN(fixture.minute) ||
    fixture.minute <= 0
  ) {
    return null
  }

  return `${fixture.minute}'`
}

export function formatFixtureStatusLabel(fixture: Fixture): string {
  const status = getFixtureStatus(fixture)

  if (status === 'completed') return 'FT'
  if (status === 'halftime') return 'HT'
  if (status === 'live') {
    const clock = formatFixtureClock(fixture)
    return clock ? `Live · ${clock}` : 'Live'
  }
  return 'Upcoming'
}

export function formatFixtureKickoff(fixture: Fixture): string {
  if (fixture.matchtime) {
    const match = fixture.matchtime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
    return fixture.matchtime
  }

  if (!fixture.game_date) return 'TBC'

  const parsed = new Date(fixture.game_date)
  if (Number.isNaN(parsed.getTime())) return 'TBC'

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}
