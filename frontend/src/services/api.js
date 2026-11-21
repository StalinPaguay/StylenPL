const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, options = {}) {
  const { token, headers: customHeaders, ...requestOptions } = options

  const headers = {
    ...customHeaders,
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || `Error HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
