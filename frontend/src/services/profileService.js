import { apiRequest } from './api'

export const profileService = {
  get: (token) =>
    apiRequest('/auth/me', { token }),

  update: (token, name) =>
    apiRequest('/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ name }),
    }),

  changePassword: (token, currentPassword, newPassword) =>
    apiRequest('/auth/password', {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),
}
