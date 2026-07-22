import { useCallback, useState } from 'react'
import { authApi } from '@/api/auth.api'
import { getUserFromToken } from '@/utils/auth'
import { authUtils } from './auth.utils'

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ?? error.response?.data?.error ?? fallback

export const useAuth = () => {
  const [user, setUser] = useState(authUtils.getUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authApi.login(credentials)
      const token = response.token ?? response.accessToken

      if (!token) {
        throw new Error('The server did not return an access token.')
      }

      const tokenUser = getUserFromToken(token) ?? {}
      const signedInUser = {
        ...tokenUser,
        id: response.id ?? tokenUser.id,
        username: response.username ?? tokenUser.username,
        email: response.email ?? tokenUser.email,
        roles: response.roles ?? tokenUser.roles,
      }

      authUtils.setAuth(token, signedInUser)
      setUser(signedInUser)
      return signedInUser
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to sign in. Please try again.'))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (account) => {
    setLoading(true)
    setError(null)

    try {
      return await authApi.register(account)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create your account.'))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authUtils.clearAuth()
    setUser(null)
  }, [])

  return { user, loading, error, login, register, logout }
}
