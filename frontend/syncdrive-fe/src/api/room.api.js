import api from './api'

export const roomApi = {
  async getPublicRooms() {
    const { data } = await api.get('/rooms/public')
    return data
  },

  async getRoom(roomCode) {
    const { data } = await api.get(`/rooms/${encodeURIComponent(roomCode)}`)
    return data
  },

  async createRoom(room) {
    const { data } = await api.post('/rooms', room)
    return data
  },

  async joinRoom(roomCode) {
    await api.post(`/rooms/join/${encodeURIComponent(roomCode)}`)
  },

  async leaveRoom(roomCode) {
    await api.post(`/rooms/${encodeURIComponent(roomCode)}/leave`)
  },
}
