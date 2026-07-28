import api from './api'

export const streamApi = {
  async startStream({ roomId, userId, type, source }) {
    const { data } = await api.post('/streams/start', { roomId, userId, type, source })
    return data
  },

  async pauseStream({ roomId, userId, time }) {
    const { data } = await api.post('/streams/pause', { roomId, userId, time })
    return data
  },

  async stopStream({ roomId, userId }) {
    await api.post('/streams/stop', { roomId, userId })
  },

  async getState(roomId) {
    const { data } = await api.get('/streams/state', { params: { roomId } })
    return data
  },
}
