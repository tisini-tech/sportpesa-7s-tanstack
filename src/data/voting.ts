import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import { useAppSession } from '#/lib/session'
import type {
  BallotResult,
  Participant,
  VoteCause,
  VoteParticipant,
} from '#/lib/types'

export const getVoteCausesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const response = await apiService.get<VoteCause[]>(`/causes`, {
      base: 'quiz',
      withApiKey: true,
    })
    return response
  },
)

export const getVoteParticipantsFn = createServerFn({ method: 'GET' })
  .validator((data: { causeId: number }) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const hasToken = Boolean(session.data.accessToken)

    // Guests: API key (public poll data). Authed: Bearer (includes has_voted).
    const response = await apiService.get<VoteParticipant>(
      `/causes/${data.causeId}/participants`,
      {
        base: 'quiz',
        withApiKey: !hasToken,
      },
    )
    return response
  })

export const castVoteFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      causeId: number
      participantId: number
      session: string
      comment: string | null
    }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiService.post<Participant>(
      `/causes/${data.causeId}/cast-vote`,
      {
        participant_id: data.participantId,
        session: data.session,
        comment: data.comment,
      },
      {
        base: 'quiz',
      },
    )

    return response
  })

export const castBallotFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      causeId: number
      session: string
      comment: string | null
      picks: Array<{ slot: number; participant_id: number }>
    }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiService.post<BallotResult>(
      `/causes/${data.causeId}/cast-ballot`,
      {
        session: data.session,
        comment: data.comment,
        picks: data.picks,
      },
      {
        base: 'quiz',
      },
    )

    return response
  })
