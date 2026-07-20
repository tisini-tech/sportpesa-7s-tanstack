import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type { Participant, VoteCause, VoteParticipant } from '#/lib/types'

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
    const response = await apiService.get<VoteParticipant>(
      `/causes/${data.causeId}/participants`,
      {
        base: 'quiz',
        withApiKey: true,
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
        withApiKey: true,
      },
    )
    return response
  })
