type ApiBase = 'scores' | 'quiz'

export type ApiRequestOptions = {
  /** Defaults to `scores` (API_SCORES_URL + x-api-key). */
  base?: ApiBase
  /** Bearer token for the quiz/manage API. */
  token?: string
  /**
   * Send `x-api-key`.
   * Defaults to `true` for `scores`, `false` for `quiz`.
   */
  withApiKey?: boolean
}

function resolveBaseUrl(base: ApiBase): string {
  if (base === 'quiz') {
    const url = process.env.API_QUIZ_URL
    if (!url) throw new Error('API_QUIZ_URL is not set')
    return url
  }

  const url = process.env.API_SCORES_URL
  if (!url) throw new Error('API_SCORES_URL is not set')
  return url
}

function buildHeaders(
  base: ApiBase,
  options: ApiRequestOptions,
  initHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(initHeaders)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const withApiKey = options.withApiKey ?? base === 'scores'
  if (withApiKey) {
    const apiKey = process.env.API_KEY
    if (!apiKey) throw new Error('API_KEY is not set')
    headers.set('x-api-key', apiKey)
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  return headers
}

export async function apiFetch(
  path: string,
  options: RequestInit & ApiRequestOptions = {},
): Promise<Response> {
  const { base = 'scores', token, withApiKey, ...init } = options
  const apiUrl = resolveBaseUrl(base)

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: buildHeaders(base, { token, withApiKey }, init.headers),
  })

  return res
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(
      error.detail || error.message || `Request failed (${res.status})`,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const apiService = {
  async get<T>(path: string, options?: ApiRequestOptions) {
    return parseResponse<T>(await apiFetch(path, { ...options, method: 'GET' }))
  },

  async post<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return parseResponse<T>(
      await apiFetch(path, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      }),
    )
  },

  async put<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return parseResponse<T>(
      await apiFetch(path, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    )
  },

  async patch<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return parseResponse<T>(
      await apiFetch(path, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    )
  },

  async delete<T>(path: string, options?: ApiRequestOptions) {
    return parseResponse<T>(
      await apiFetch(path, { ...options, method: 'DELETE' }),
    )
  },
}
