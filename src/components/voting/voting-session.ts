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
