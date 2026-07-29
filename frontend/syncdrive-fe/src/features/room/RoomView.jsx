import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { authUtils } from '@/features/auth/auth.utils'
import { roomApi } from '@/api/room.api'
import { streamApi } from '@/api/stream.api'
import { connectSocket, disconnectSocket, sendMessage, sendSignal, subscribeToRoom } from '@/socket/roomSocket'
import { useWebRTC } from '@/hooks/useWebRTC'
import { createMp4Stream } from '@/hooks/useMp4Stream'
import { getLocalMedia } from '@/hooks/useLocalMedia'
import ChatPanel from './ChatPanel'
import HostControls from './HostControls'
import MediaControls from './MediaControls'
import ParticipantList from './ParticipantList'
import PlayerControls from './PlayerControls'
import RoomHeader from './RoomHeader'
import VideoPlayer from './VideoPlayer'
import './room.css'

const normalizeYoutubeUrl = (value) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null
  const short = raw.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  const standard = raw.match(/(?:v=|\/embed\/)([A-Za-z0-9_-]{11})/)
  const videoId = short?.[1] ?? standard?.[1]
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
}

const initialPlayerState = {
  isPlaying: false,
  isMp4: false,
  isYoutube: false,
  youtubeUrl: '',
  mediaName: '',
  currentTime: 0,
  duration: 0,
}

export default function RoomView() {
  const { roomCode: rawRoomCode } = useParams()
  const roomCode = rawRoomCode?.toUpperCase() ?? ''
  const navigate = useNavigate()
  const user = authUtils.getUser()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [playerState, setPlayerState] = useState(initialPlayerState)
  const [localStream, setLocalStream] = useState(null)
  const [mediaName, setMediaName] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const playerRef = useRef(null)
  const mp4VideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const lastHeartbeatRef = useRef(Date.now())
  const isHost = Boolean(room?.hostUserId && user?.id && Number(room.hostUserId) === Number(user.id))
  const roomId = room?.roomId ?? room?.id
  const { remoteStreams, handleIncomingSignal, replaceVideoTrack, connectToPeer } = useWebRTC(roomCode, user)

  const activeStream = useMemo(() => {
    if (isHost) return localStream
    return remoteStreams.values().next().value ?? null
  }, [isHost, localStream, remoteStreams])

  const applySync = useCallback((payload) => {
    const action = typeof payload === 'string' ? JSON.parse(payload) : payload
    if (!action?.type) return
    lastHeartbeatRef.current = Date.now()
    if (action.type === 'PLAY') {
      playerRef.current?.play()
      setPlayerState((state) => ({ ...state, isPlaying: true }))
    } else if (action.type === 'PAUSE') {
      playerRef.current?.pause()
      setPlayerState((state) => ({ ...state, isPlaying: false }))
    } else if (action.type === 'SEEK' && !isHost) {
      playerRef.current?.seek(action.time ?? 0)
      setPlayerState((state) => ({ ...state, currentTime: action.time ?? 0 }))
    } else if (action.type === 'LOAD') {
      setPlayerState((state) => ({ ...state, isMp4: true, isYoutube: false, mediaName: action.filename ?? 'MP4 stream', isPlaying: false }))
    } else if (action.type === 'LOAD_YOUTUBE') {
      const youtubeUrl = normalizeYoutubeUrl(action.url) ?? action.url
      setPlayerState((state) => ({ ...state, isMp4: false, isYoutube: true, youtubeUrl, mediaName: 'YouTube video', isPlaying: true }))
    } else if (action.type === 'STOP') {
      setPlayerState(initialPlayerState)
    } else if (action.type === 'HEARTBEAT' && !isHost) {
      setPlayerState((state) => ({
        ...state,
        isPlaying: action.isPlaying ?? state.isPlaying,
        isMp4: action.isMp4 ?? state.isMp4,
        isYoutube: action.isYoutube ?? state.isYoutube,
        youtubeUrl: normalizeYoutubeUrl(action.youtubeUrl) ?? action.youtubeUrl ?? state.youtubeUrl,
        mediaName: action.mediaName ?? state.mediaName,
        currentTime: action.time ?? state.currentTime,
      }))
      if (typeof action.time === 'number') playerRef.current?.seek(action.time)
    }
  }, [isHost])

  useEffect(() => {
    if (!roomCode || !user) return undefined
    let unsubscribe = () => {}
    let active = true
    const initialise = async () => {
      try {
        await roomApi.joinRoom(roomCode).catch((error) => {
          if (error?.response?.status !== 409) throw error
        })
        const details = await roomApi.getRoom(roomCode)
        if (!active) return
        setRoom(details)
        await connectSocket()
        unsubscribe = await subscribeToRoom(roomCode, {
          onMessage: (message) => {
            if (message.type === 'SYNC') {
              try { applySync(message.content) } catch { return }
            } else setMessages((items) => [...items, message])
          },
          onParticipants: (items) => setParticipants(Array.isArray(items) ? items : []),
          onSignal: (signal) => handleIncomingSignal(signal, localStreamRef.current),
        })
        sendSignal(roomCode, 'join', {})
      } catch {
        navigate('/rooms', { replace: true })
      }
    }
    initialise()
    return () => {
      active = false
      unsubscribe()
      disconnectSocket()
    }
  }, [applySync, handleIncomingSignal, navigate, roomCode, user])

  useEffect(() => {
    if (!isHost || (!playerState.isMp4 && !playerState.isYoutube)) return undefined
    const interval = window.setInterval(() => {
      sendMessage(roomCode, JSON.stringify({
        type: 'HEARTBEAT', time: playerRef.current?.getCurrentTime?.() ?? playerState.currentTime,
        isPlaying: playerState.isPlaying, isMp4: playerState.isMp4, isYoutube: playerState.isYoutube,
        youtubeUrl: playerState.youtubeUrl, mediaName: playerState.mediaName,
      }), 'SYNC')
    }, 2000)
    return () => window.clearInterval(interval)
  }, [isHost, playerState, roomCode])

  useEffect(() => {
    if (isHost) return undefined
    const interval = window.setInterval(() => {
      if (Date.now() - lastHeartbeatRef.current > 10_000) {
        playerRef.current?.pause()
        setPlayerState((state) => ({ ...state, isPlaying: false }))
      }
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isHost])

  const startMp4 = async (file) => {
    if (!file || !isHost) return
    const { video, stream } = await createMp4Stream(file)
    mp4VideoRef.current = video
    localStreamRef.current = stream
    setLocalStream(stream)
    replaceVideoTrack(stream)
    await video.play()
    setPlayerState({ ...initialPlayerState, isPlaying: true, isMp4: true, mediaName: mediaName || file.name })
    sendMessage(roomCode, JSON.stringify({ type: 'LOAD', filename: mediaName || file.name }), 'SYNC')
    sendMessage(roomCode, JSON.stringify({ type: 'PLAY' }), 'SYNC')
    if (roomId) await streamApi.startStream({ roomId, userId: user.id, type: 'MP4', source: file.name })
    participants.forEach((participant) => participant.username && participant.username !== user.username && connectToPeer(participant.username, stream))
  }

  const shareScreen = async () => {
    if (!isHost) return
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    localStreamRef.current = stream
    setLocalStream(stream)
    replaceVideoTrack(stream)
    setPlayerState({ ...initialPlayerState, isPlaying: true, mediaName: 'Host screen' })
    sendMessage(roomCode, JSON.stringify({ type: 'SCREEN_SHARE' }), 'SYNC')
    if (roomId) await streamApi.startStream({ roomId, userId: user.id, type: 'SCREEN', source: 'Screen' })
  }

  const loadYoutube = () => {
    const youtubeUrl = normalizeYoutubeUrl(youtubeInput)
    if (!isHost || !youtubeUrl) return
    setPlayerState({ ...initialPlayerState, isPlaying: true, isYoutube: true, youtubeUrl, mediaName: mediaName || 'YouTube video' })
    sendMessage(roomCode, JSON.stringify({ type: 'LOAD_YOUTUBE', url: youtubeUrl }), 'SYNC')
  }

  const togglePlayback = async () => {
    const isPlaying = !playerState.isPlaying
    setPlayerState((state) => ({ ...state, isPlaying }))
    playerRef.current?.[isPlaying ? 'play' : 'pause']?.()
    if (isHost) {
      sendMessage(roomCode, JSON.stringify({ type: isPlaying ? 'PLAY' : 'PAUSE' }), 'SYNC')
      if (!isPlaying && roomId) await streamApi.pauseStream({ roomId, userId: user.id, time: playerRef.current?.getCurrentTime?.() ?? 0 })
    }
  }

  const leaveRoom = async () => {
    try { await roomApi.leaveRoom(roomCode) } finally { navigate('/rooms') }
  }

  const toggleTrack = (kind) => {
    const track = localStreamRef.current?.getTracks().find((item) => item.kind === kind)
    if (!track) return
    track.enabled = !track.enabled
    if (kind === 'audio') setIsMicEnabled(track.enabled)
    else setIsCameraEnabled(track.enabled)
  }

  return (
    <div className="room-wrapper">
      <RoomHeader roomName={room?.name ?? `Room ${roomCode}`} roomCode={roomCode} onLeave={leaveRoom} />
      <main className="room-container">
        <section className="main-content">
          <VideoPlayer ref={playerRef} roomCode={roomCode} stream={activeStream} isHost={isHost} {...playerState}
            onPlay={togglePlayback} onPause={togglePlayback} onProgress={(currentTime) => setPlayerState((state) => ({ ...state, currentTime }))}
            onDuration={(duration) => setPlayerState((state) => ({ ...state, duration }))} muted={!isMicEnabled} volume={1} />
          <HostControls isHost={isHost} mediaName={mediaName} youtubeUrl={youtubeInput} onMediaNameChange={setMediaName}
            onYoutubeUrlChange={setYoutubeInput} onPickMp4={() => document.getElementById('room-mp4-picker')?.click()} onShareScreen={shareScreen} onLoadYoutube={loadYoutube} />
          <input id="room-mp4-picker" className="hidden" type="file" accept="video/mp4" onChange={(event) => startMp4(event.target.files?.[0])} />
          <PlayerControls isHost={isHost} {...playerState} onTogglePlayback={togglePlayback} onSeek={(time) => { playerRef.current?.seek(time); setPlayerState((state) => ({ ...state, currentTime: time })); if (isHost) sendMessage(roomCode, JSON.stringify({ type: 'SEEK', time }), 'SYNC') }} onJumpToLive={() => playerRef.current?.jumpToLive()} />
          <MediaControls isHost={isHost} isMicEnabled={isMicEnabled} isCameraEnabled={isCameraEnabled} onToggleMic={() => toggleTrack('audio')} onToggleCamera={() => toggleTrack('video')} />
        </section>
        <aside className="sidebar"><ParticipantList participants={participants} hostUserId={room?.hostUserId} /><ChatPanel messages={messages} currentUser={user} onSend={(content) => sendMessage(roomCode, content)} /></aside>
      </main>
    </div>
  )
}
