import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'syncdrive.token'
const USER_KEY = 'syncdrive.user'

const readUser = () => {
  const storedUser = sessionStorage.getItem(USER_KEY)

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export const authUtils = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),

  getUser: readUser,

  setAuth: (token, user) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  updateUser: (user) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('syncdrive:user-updated'))
  },

  clearAuth: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  },

  isAuthenticated: () => {
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (!token) return false

    try {
      const { exp } = jwtDecode(token)
      const isExpired = typeof exp === 'number' && exp * 1000 <= Date.now()

      if (isExpired) {
        authUtils.clearAuth()
        return false
      }

      return true
    } catch {
      authUtils.clearAuth()
      return false
    }
  },
}
