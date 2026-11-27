import { apiRequest } from './api'

export const exchangeService = {
  complete: completeExchange,
  list: () => apiRequest('/exchanges/'),

  mine: (token) => apiRequest('/exchanges/mine', { token }),

  create: (token, data) => apiRequest('/exchanges/', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),

  remove: (token, exchangeId) => apiRequest(`/exchanges/${exchangeId}`, {
    method: 'DELETE',
    token,
  }),

  updateStatus: (exchangeId, status, token) =>
    apiRequest(`/exchanges/${exchangeId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
}

export const exchangeEditService = {
  update: (token, exchangeId, data) =>
    apiRequest(`/exchanges/${exchangeId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),
}

export async function completeExchange(token, exchangeId) {
  return apiRequest(`/exchanges/${exchangeId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status: 'intercambiado' }),
  })
}
