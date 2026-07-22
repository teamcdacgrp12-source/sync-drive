import { jwtDecode } from 'jwt-decode'

export const getUserFromToken = (token) => {
  if (!token) return null

  try {
    const payload = jwtDecode(token)

    return {
      id: payload.userId ?? payload.id ?? payload.sub,
      username: payload.username ?? payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
    }
  } catch {
    return null
  }
}
