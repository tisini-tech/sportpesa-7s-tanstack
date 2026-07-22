import { useAppSession } from '#/lib/session'

type ApiBase = 'scores' | 'quiz'

export type ApiRequestOptions = {
  /** Defaults to `scores` (API_SCORES_URL + x-api-key). */
  base?: ApiBase
  /**
   * Explicit Bearer token. If omitted and the request needs auth
   * (`base: 'quiz'` without `withApiKey`), the session access token is used.
   */
  token?: string
  /**
   * Send `x-api-key`.
   * Defaults to `true` for `scores`, `false` for `quiz`.
   * When `false` on `quiz`, the session Bearer token is attached automatically.
   */
  withApiKey?: boolean
}

type InternalApiOptions = ApiRequestOptions & {
  /** Internal: already retried once after a token refresh. */
  _authRetried?: boolean
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

function needsBearerAuth(base: ApiBase, withApiKey: boolean): boolean {
  return base === 'quiz' && !withApiKey
}

async function resolveToken(
  base: ApiBase,
  options: ApiRequestOptions,
  withApiKey: boolean,
): Promise<string | undefined> {
  if (options.token) return options.token
  if (!needsBearerAuth(base, withApiKey)) return undefined

  const session = await useAppSession()
  const accessToken = session.data.accessToken

  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  return accessToken
}

function buildHeaders(
  options: ApiRequestOptions & { token?: string },
  withApiKey: boolean,
  initHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(initHeaders)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

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

/** Prevent concurrent refresh requests from racing. */
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const session = await useAppSession()
    const refreshToken = session.data.refreshToken

    if (!refreshToken) {
      await session.clear()
      throw new Error('Not authenticated')
    }

    const url = process.env.API_QUIZ_URL
    if (!url) {
      throw new Error('API_QUIZ_URL is not set')
    }

    const res = await fetch(`${url}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      await session.clear()
      const error = await res.json().catch(() => ({}))
      throw new Error(
        error.detail || error.message || 'Failed to refresh access token',
      )
    }

    const data = (await res.json()) as {
      access_token: string
      refresh_token: string
    }

    await session.update({
      ...session.data,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    })

    return data.access_token
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

function isUnauthorized(res: Response): boolean {
  return res.status === 401
}

export async function apiFetch(
  path: string,
  options: RequestInit & InternalApiOptions = {},
): Promise<Response> {
  const {
    base = 'scores',
    token: explicitToken,
    withApiKey: withApiKeyOption,
    _authRetried,
    ...init
  } = options

  const withApiKey = withApiKeyOption ?? base === 'scores'
  const token = await resolveToken(base, { token: explicitToken }, withApiKey)
  const apiUrl = resolveBaseUrl(base)

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: buildHeaders({ token }, withApiKey, init.headers),
  })

  if (
    !isUnauthorized(res) ||
    !needsBearerAuth(base, withApiKey) ||
    _authRetried
  ) {
    return res
  }

  const accessToken = await refreshAccessToken()

  return apiFetch(path, {
    ...init,
    base,
    token: accessToken,
    withApiKey,
    _authRetried: true,
  })
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
