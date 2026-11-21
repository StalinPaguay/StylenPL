import { sessionService } from './sessionService'

export async function apiRequest(path, options = {}) {
  const { token, headers: customHeaders, ...fetchOptions } = options

  const headers = {
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || '/api'}${path}`,
    { ...fetchOptions, headers }
  )

  if (response.status === 401 && token) {
    sessionService.clearToken()
    window.dispatchEvent(new Event('stylenpl:session-expired'))
    throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    throw new Error(
      typeof detail === 'string'
        ? detail
        : 'No se pudo completar la solicitud.'
    )
  }

  return data
}
