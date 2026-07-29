import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatPanel from './ChatPanel'
import HostControls from './HostControls'
import MediaControls from './MediaControls'
import ParticipantList from './ParticipantList'
import PlayerControls from './PlayerControls'
import RoomHeader from './RoomHeader'
import VideoPlayer from './VideoPlayer'
import './room.css'

const starterParticipants = [
  { id: 'host-1', username: 'maya', displayName: 'Maya', avatarUrl: '' },
  { id: 'guest-2', username: 'leo', displayName: 'Leo', avatarUrl: '' },
  { id: 'guest-3', username: 'nina', displayName: 'Nina', avatarUrl: '' },
]

const starterMessages = [
  { id: 1, sender: 'Maya', content: 'The room is ready. Let us begin.', timestamp: '2026-07-29T10:00:00.000Z' },
  { id: 2, sender: 'Leo', content: 'Perfect. I am joining from the lounge.', timestamp: '2026-07-29T10:01:00.000Z' },
]

export default function RoomView() {
  const { roomCode = 'SYNC-101' } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef(null)

  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(126)
  const [duration, setDuration] = useState(420)
  const [isHost, setIsHost] = useState(true)
  const [mediaName, setMediaName] = useState('Live watch party')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isYoutube, setIsYoutube] = useState(false)
  const [isMp4, setIsMp4] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume] = useState(0.8)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [messages, setMessages] = useState(starterMessages)
  const [participants] = useState(starterParticipants)

  const togglePlayback = () => {
    const nextValue = !playing
    setPlaying(nextValue)
    if (playerRef.current) {
      if (nextValue) {
        playerRef.current.play()
      } else {
        playerRef.current.pause()
      }
    }
  }

  const handleSeek = (nextTime) => {
    setCurrentTime(nextTime)
    playerRef.current?.seek(nextTime)
  }

  const handleJumpToLive = () => {
    playerRef.current?.jumpToLive()
    setCurrentTime(duration)
  }

  const handlePickMp4 = () => {
    setIsYoutube(false)
    setIsMp4(true)
    setMediaName('Local MP4 ready')
  }

  const handleShareScreen = () => {
    setIsYoutube(false)
    setIsMp4(false)
    setMediaName('Screen share active')
  }

  const handleLoadYoutube = () => {
    const trimmed = youtubeUrl.trim()
    if (!trimmed) return
    setIsYoutube(true)
    setIsMp4(false)
    setMediaName('YouTube video')
  }

  const handleSendMessage = (content) => {
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: 'You',
        content,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  return (
    <div className="room-view-shell">
      <RoomHeader roomName={`Room ${roomCode}`} roomCode={roomCode} onLeave={() => navigate('/rooms')} />

      <div className="room-view-content">
        <section className="room-view-main">
          <div className="room-view-player-card">
            <VideoPlayer
              ref={playerRef}
              roomCode={roomCode}
              stream={null}
              isHost={isHost}
              mediaName={mediaName}
              isMp4={isMp4}
              isYoutube={isYoutube}
              youtubeUrl={youtubeUrl}
              isPlaying={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onProgress={(value) => setCurrentTime(value)}
              onDuration={(value) => setDuration(value)}
              muted={muted}
              volume={volume}
            />

            <PlayerControls
              isHost={isHost}
              currentTime={currentTime}
              duration={duration}
              isPlaying={playing}
              onTogglePlayback={togglePlayback}
              onSeek={handleSeek}
              onJumpToLive={handleJumpToLive}
              status={isHost ? 'Host controls' : 'Watching together'}
            />

            <HostControls
              isHost={isHost}
              mediaName={mediaName}
              youtubeUrl={youtubeUrl}
              onPickMp4={handlePickMp4}
              onShareScreen={handleShareScreen}
              onLoadYoutube={handleLoadYoutube}
              onMediaNameChange={setMediaName}
              onYoutubeUrlChange={setYoutubeUrl}
            />

            <MediaControls
              isHost={isHost}
              isMicEnabled={micEnabled}
              isCameraEnabled={cameraEnabled}
              onToggleMic={() => setMicEnabled((value) => !value)}
              onToggleCamera={() => setCameraEnabled((value) => !value)}
            />
          </div>
        </section>

        <aside className="room-view-sidebar">
          <ParticipantList participants={participants} hostUserId="host-1" />
          <ChatPanel messages={messages} currentUser={{ username: 'You' }} onSend={handleSendMessage} />
        </aside>
      </div>
    </div>
  )
}
