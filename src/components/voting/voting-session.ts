const SESSION_KEY = 'voting_session_id'
const VOTED_CAUSES_KEY = 'voting_voted_causes'

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('Voting session is only available in the browser')
  }
}

function generateVotingSessionId() {
  const c = globalThis.crypto as Crypto | undefined

  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }

  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)

    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16,
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return `voting-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getOrCreateVotingSessionId() {
  assertBrowser()

  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const id = generateVotingSessionId()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

function readVotedCauseIds(): number[] {
  assertBrowser()

  try {
    const raw = localStorage.getItem(VOTED_CAUSES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
  } catch {
    return []
  }
}

export function hasVotedForCause(causeId: number) {
  return readVotedCauseIds().includes(causeId)
}

export function markCauseVoted(causeId: number) {
  assertBrowser()

  const next = new Set(readVotedCauseIds())
  next.add(causeId)
  localStorage.setItem(VOTED_CAUSES_KEY, JSON.stringify([...next]))
}

export type StoredBallotPick = {
  slot: number
  number: number
  label: string
  participantId: number
  name: string
  teamName: string | null
}

const BALLOT_PICKS_KEY = 'voting_ballot_picks'

export function saveBallotPicks(causeId: number, picks: StoredBallotPick[]) {
  assertBrowser()

  try {
    const raw = localStorage.getItem(BALLOT_PICKS_KEY)
    const parsed =
      raw != null ? (JSON.parse(raw) as Record<string, StoredBallotPick[]>) : {}
    const next = typeof parsed === 'object' && parsed ? parsed : {}
    next[String(causeId)] = picks
    localStorage.setItem(BALLOT_PICKS_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
}

export function loadBallotPicks(causeId: number): StoredBallotPick[] | null {
  assertBrowser()

  try {
    const raw = localStorage.getItem(BALLOT_PICKS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, StoredBallotPick[]>
    const picks = parsed[String(causeId)]
    return Array.isArray(picks) && picks.length > 0 ? picks : null
  } catch {
    return null
  }
}
