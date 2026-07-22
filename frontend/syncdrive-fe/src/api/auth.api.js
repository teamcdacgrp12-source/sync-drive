import api from './api'

export const authApi = {
  async login(credentials) {
    const { data } = await api.post('/auth/signin', credentials)
    return data
  },

  async register(account) {
    const { data } = await api.post('/auth/signup', account)
    return data
  },
}
