const SESSION_KEY = 'voting_session_id_by_user'
const VOTED_CAUSES_KEY = 'voting_voted_causes_by_user'
const BALLOT_PICKS_KEY = 'voting_ballot_picks_by_user'

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('Voting session is only available in the browser')
  }
}

function userKey(userId: number): string {
  return String(userId)
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

function readJsonRecord<T>(key: string): Record<string, T> {
  assertBrowser()

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    return parsed as Record<string, T>
  } catch {
    return {}
  }
}

function writeJsonRecord<T>(key: string, value: Record<string, T>) {
  assertBrowser()
  localStorage.setItem(key, JSON.stringify(value))
}

export function getOrCreateVotingSessionId(userId: number) {
  const key = userKey(userId)
  const sessions = readJsonRecord<string>(SESSION_KEY)
  const existing = sessions[key]
  if (existing) return existing

  const id = generateVotingSessionId()
  sessions[key] = id
  writeJsonRecord(SESSION_KEY, sessions)
  return id
}

function readVotedCauseIds(userId: number): number[] {
  const voted = readJsonRecord<number[]>(VOTED_CAUSES_KEY)
  const list = voted[userKey(userId)]
  if (!Array.isArray(list)) return []
  return list.map((value) => Number(value)).filter((value) => Number.isFinite(value))
}

export function hasVotedForCause(userId: number, causeId: number) {
  return readVotedCauseIds(userId).includes(causeId)
}

export function markCauseVoted(userId: number, causeId: number) {
  const key = userKey(userId)
  const voted = readJsonRecord<number[]>(VOTED_CAUSES_KEY)
  const next = new Set(readVotedCauseIds(userId))
  next.add(causeId)
  voted[key] = [...next]
  writeJsonRecord(VOTED_CAUSES_KEY, voted)
}

/** True if this user's localStorage or the server says they already voted. Syncs local when needed. */
export function resolveHasVoted(
  userId: number,
  causeId: number,
  serverHasVoted?: boolean,
) {
  const local = hasVotedForCause(userId, causeId)
  const server = Boolean(serverHasVoted)

  if (server && !local) {
    markCauseVoted(userId, causeId)
  }

  return local || server
}

export type StoredBallotPick = {
  slot: number
  number: number
  label: string
  participantId: number
  name: string
  teamName: string | null
}

export function saveBallotPicks(
  userId: number,
  causeId: number,
  picks: StoredBallotPick[],
) {
  try {
    const key = userKey(userId)
    const all = readJsonRecord<Record<string, StoredBallotPick[]>>(BALLOT_PICKS_KEY)
    const forUser =
      all[key] && typeof all[key] === 'object' && !Array.isArray(all[key])
        ? { ...all[key] }
        : {}
    forUser[String(causeId)] = picks
    all[key] = forUser
    writeJsonRecord(BALLOT_PICKS_KEY, all)
  } catch {
    // ignore quota / private mode
  }
}

export function loadBallotPicks(
  userId: number,
  causeId: number,
): StoredBallotPick[] | null {
  try {
    const all = readJsonRecord<Record<string, StoredBallotPick[]>>(BALLOT_PICKS_KEY)
    const forUser = all[userKey(userId)]
    if (!forUser || typeof forUser !== 'object') return null
    const picks = forUser[String(causeId)]
    return Array.isArray(picks) && picks.length > 0 ? picks : null
  } catch {
    return null
  }
}
