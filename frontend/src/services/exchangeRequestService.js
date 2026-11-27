import { apiRequest } from './api'

export const exchangeRequestService = {
  create: (token, data) =>
    apiRequest('/exchange-requests/', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  sent: (token) =>
    apiRequest('/exchange-requests/sent', { token }),

  received: (token) =>
    apiRequest('/exchange-requests/received', { token }),

  updateStatus: (token, requestId, status) =>
    apiRequest(`/exchange-requests/${requestId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),

  cancel: (token, requestId) =>
    apiRequest(`/exchange-requests/${requestId}/cancel`, {
      method: 'PATCH',
      token,
    }),
}
