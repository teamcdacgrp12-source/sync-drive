import api from './api'

export const userApi = {
  async getProfile(userId) {
    const { data } = await api.get(`/users/${userId}`)
    return data
  },

  async updateProfile(profile) {
    const { data } = await api.put('/users/me', profile)
    return data
  },

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data
  },
}
