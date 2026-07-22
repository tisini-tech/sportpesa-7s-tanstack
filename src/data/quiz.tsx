import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Country,
  Quiz,
  QuizLeaderboard,
  QuizSubmitResponse,
} from '#/lib/types'

export const getQuizzesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return apiService.get<Quiz[]>('/engagements', {
      base: 'quiz',
      withApiKey: true,
    })
  },
)

export const getQuizLeaderboardFn = createServerFn({ method: 'GET' })
  .validator((data: { quizId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<QuizLeaderboard[]>(
      `/engagements/${data.quizId}/leaderboard`,
      {
        base: 'quiz',
        withApiKey: true,
      },
    )
  })

export const getQuizFn = createServerFn({ method: 'GET' })
  .validator((data: { quizId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Quiz>(`/engagements/${data.quizId}/questions`, {
      base: 'quiz',
    })
  })

export type QuizSubmitAnswer = {
  questionId: number
  choiceIds: number[]
  responseMs: number
}

export const submitQuizFn = createServerFn({ method: 'POST' })
  .validator((data: { quizId: string; answers: QuizSubmitAnswer[] }) => data)
  .handler(async ({ data }) => {
    return apiService.post<QuizSubmitResponse>(
      `/engagements/${data.quizId}/answers`,
      data.answers.map((answer) => ({
        question_id: answer.questionId,
        choice_id: answer.choiceIds[0] ?? 0,
        selected_choice_ids:
          answer.choiceIds.length > 1 ? answer.choiceIds : [],
        text_answer: '',
        response_ms: answer.responseMs,
      })),
      {
        base: 'quiz',
      },
    )
  })

export const getCountriesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return apiService.get<Country[]>('/countries', {
      base: 'quiz',
      withApiKey: true,
    })
  },
)
