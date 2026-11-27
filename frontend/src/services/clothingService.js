import { apiRequest } from './api'

export const clothingService = {
  list: (token) =>
    apiRequest('/clothing/', { token }),

  create: (token, data) =>
    apiRequest('/clothing/', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  update: (token, clothingId, data) =>
    apiRequest(`/clothing/${clothingId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  remove: (token, clothingId) =>
    apiRequest(`/clothing/${clothingId}`, {
      method: 'DELETE',
      token,
    }),
}
