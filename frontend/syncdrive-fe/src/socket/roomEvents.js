export const ROOM_EVENTS = Object.freeze({
  CHAT_MESSAGE: "CHAT",
  USER_JOINED: "JOIN",
  USER_LEFT: "LEAVE",
  VIDEO_PLAY: "PLAY",
  VIDEO_PAUSE: "PAUSE",
  VIDEO_SEEK: "SEEK",
  VIDEO_SYNC: "SYNC",
  ERROR: "ERROR",
})

export const roomTopics = (roomId) => ({
  messages: `/topic/room/${roomId}`,
  participants: `/topic/room/${roomId}/participants`,
  signals: `/topic/room/${roomId}/signal`,
})

export const roomDestinations = (roomId) => ({
  join: `/app/chat/${roomId}/join`,
  messages: `/app/chat/${roomId}/sendMessage`,
  signals: `/app/chat/${roomId}/signal`,
})
