const TOKEN_KEY = 'stylenpl_token'

export const sessionService = {
  getToken() {
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (!token) return null

    try {
      const payload = JSON.parse(
        atob(
          token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      )

      if (typeof payload.exp !== 'number' ||
          payload.exp * 1000 <= Date.now()) {
        sessionStorage.removeItem(TOKEN_KEY)
        return null
      }

      return token
    } catch {
      sessionStorage.removeItem(TOKEN_KEY)
      return null
    }
  },

  saveToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  },

  clearToken() {
    sessionStorage.removeItem(TOKEN_KEY)
  },
}
