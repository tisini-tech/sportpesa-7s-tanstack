export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const apiUrl = process.env.API_SCORES_URL
  const apiKey = process.env.API_KEY

  if (!apiUrl || !apiKey) {
    throw new Error('API_SCORES_URL or API_KEY is not set')
  }

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
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
  async get<T>(path: string) {
    return parseResponse<T>(await apiFetch(path, { method: 'GET' }))
  },

  async post<T>(path: string, data?: unknown) {
    return parseResponse<T>(
      await apiFetch(path, { method: 'POST', body: JSON.stringify(data) }),
    )
  },

  async put<T>(path: string, data?: unknown) {
    return parseResponse<T>(
      await apiFetch(path, { method: 'PUT', body: JSON.stringify(data) }),
    )
  },

  async patch<T>(path: string, data?: unknown) {
    return parseResponse<T>(
      await apiFetch(path, { method: 'PATCH', body: JSON.stringify(data) }),
    )
  },

  async delete<T>(path: string) {
    return parseResponse<T>(await apiFetch(path, { method: 'DELETE' }))
  },
}
