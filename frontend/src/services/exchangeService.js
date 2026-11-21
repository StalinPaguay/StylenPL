import { apiRequest } from './api'

export const exchangeService = {
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
}
