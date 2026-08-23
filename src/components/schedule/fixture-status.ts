import type { Fixture } from '#/lib/types'

export type FixtureStatus = 'live' | 'halftime' | 'completed' | 'upcoming'

function normalizeStatus(fixture: Fixture): string {
  return (fixture.game_status ?? '').trim().toLowerCase()
}

export function getFixtureStatus(fixture: Fixture): FixtureStatus {
  const status = normalizeStatus(fixture)

  if (status === 'ft' || status === 'ended' || status.includes('complete')) {
    return 'completed'
  }

  if (status === 'ht' || status === 'halftime' || status === 'half-time') {
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
    status === 'not_started' ||
    status.includes('schedul') ||
    status.includes('pending')
  ) {
    return 'upcoming'
  }

  // Fallbacks for older/odd API values
  if (status.includes('finish') || status.includes('played')) {
    return 'completed'
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
  if (typeof fixture.minute !== 'number' || Number.isNaN(fixture.minute)) {
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
