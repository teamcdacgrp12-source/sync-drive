import SockJS from "sockjs-client"
import Stomp from "stompjs"
import { ROOM_EVENTS, roomDestinations, roomTopics } from "./roomEvents"

const socketUrl = import.meta.env.VITE_CHAT_SOCKET_URL ?? "http://localhost:8083/ws"
const userKey = "syncdrive.user"

let stompClient = null
let activeRoomId = null
let subscriptions = []

const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(userKey) ?? "null")
  } catch {
    return null
  }
}

const parsePayload = (payload) => JSON.parse(payload.body)

export const isSocketConnected = () => Boolean(stompClient?.connected)

export const connectSocket = () => {
  if (stompClient) return Promise.resolve(stompClient)

  stompClient = Stomp.over(new SockJS(socketUrl))
  stompClient.debug = () => {}

  return new Promise((resolve, reject) => {
    stompClient.connect({}, () => resolve(stompClient), (error) => {
      stompClient = null
      reject(error)
    })
  })
}

const clearSubscriptions = () => {
  subscriptions.forEach((subscription) => subscription.unsubscribe())
  subscriptions = []
}

export const disconnectSocket = () => {
  clearSubscriptions()
  activeRoomId = null

  if (!stompClient) return

  const client = stompClient
  stompClient = null

  if (client.connected) client.disconnect()
}

export const leaveRoomChannel = () => {
  clearSubscriptions()
  activeRoomId = null
}

export const subscribeToRoom = async (roomId, handlers = {}) => {
  const client = await connectSocket()
  clearSubscriptions()
  activeRoomId = roomId

  const topics = roomTopics(roomId)
  const user = getCurrentUser()

  subscriptions = [
    client.subscribe(topics.messages, (payload) => handlers.onMessage?.(parsePayload(payload))),
    client.subscribe(topics.participants, (payload) => handlers.onParticipants?.(parsePayload(payload))),
    client.subscribe(topics.signals, (payload) => {
      const signal = parsePayload(payload)
      if (signal.sender !== user?.username) handlers.onSignal?.(signal)
    }),
  ]

  if (user?.username) {
    client.send(roomDestinations(roomId).join, {}, JSON.stringify({
      sender: user.username,
      userId: user.id,
      type: ROOM_EVENTS.USER_JOINED,
    }))
  }

  return leaveRoomChannel
}

const send = (roomId, destination, message) => {
  if (!isSocketConnected() || activeRoomId !== roomId) return false
  stompClient.send(destination, {}, JSON.stringify(message))
  return true
}

export const sendMessage = (roomId, content, type = ROOM_EVENTS.CHAT_MESSAGE) => {
  const user = getCurrentUser()
  if (!user?.username) return false

  return send(roomId, roomDestinations(roomId).messages, {
    sender: user.username,
    content,
    type,
  })
}

export const sendSignal = (roomId, type, payload) => {
  const user = getCurrentUser()
  if (!user?.username) return false

  return send(roomId, roomDestinations(roomId).signals, {
    roomId,
    sender: user.username,
    type,
    payload: JSON.stringify(payload),
  })
}
