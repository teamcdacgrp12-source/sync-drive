import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { Circle, Maximize2, Minimize2, Play } from 'lucide-react'
import './room.css'

const VideoPlayer = forwardRef(function VideoPlayer(
  {
    roomCode,
    stream,
    isHost,
    mediaName,
    isMp4,
    isYoutube,
    youtubeUrl,
    isPlaying,
    onPlay,
    onPause,
    onProgress,
    onDuration,
    muted,
    volume,
  },
  ref,
) {
  const [playing, setPlaying] = useState(Boolean(isPlaying))
  const [showOverlay, setShowOverlay] = useState(false)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isValidStream, setIsValidStream] = useState(Boolean(stream))

  const videoRef = useRef(null)
  const reactPlayerRef = useRef(null)
  const playerWrapperRef = useRef(null)
  const currentTimeRef = useRef(0)

  useEffect(() => {
    setPlaying(Boolean(isPlaying))
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = muted
    }
  }, [volume, muted])

  useEffect(() => {
    if (!mediaName) return undefined
    setShowOverlay(true)
    const timer = window.setTimeout(() => setShowOverlay(false), 2800)
    return () => window.clearTimeout(timer)
  }, [mediaName])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerWrapperRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const jumpToLiveInternal = () => {
    if (isYoutube && reactPlayerRef.current) {
      const duration = reactPlayerRef.current.getDuration?.() ?? reactPlayerRef.current.duration
      if (duration && Number.isFinite(duration)) {
        reactPlayerRef.current.seekTo?.(Math.max(0, duration - 1))
      }
      return
    }

    const video = videoRef.current
    if (video?.buffered?.length) {
      try {
        video.currentTime = video.buffered.end(video.buffered.length - 1)
      } catch {
        // ignore
      }
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      pause: () => setPlaying(false),
      play: () => setPlaying(true),
      seek: (time) => {
        if (isYoutube && reactPlayerRef.current) {
          reactPlayerRef.current.seekTo?.(time)
        } else if (videoRef.current) {
          videoRef.current.currentTime = time
        }
      },
      jumpToLive: jumpToLiveInternal,
      getCurrentTime: () => {
        if (isYoutube) {
          return reactPlayerRef.current?.getCurrentTime?.() ?? currentTimeRef.current ?? 0
        }
        return videoRef.current?.currentTime ?? 0
      },
    }),
    [isYoutube],
  )

  useEffect(() => {
    if (isYoutube) return undefined
    setIsValidStream(Boolean(stream))

    const video = videoRef.current
    if (stream && video) {
      video.srcObject = stream
      if (video.isConnected) {
        video.play().catch((error) => {
          if (error?.name === 'NotAllowedError') {
            setShowPlayOverlay(true)
          }
        })
      }
    }
    return undefined
  }, [stream, isYoutube])

  const effectiveYoutubeUrl = typeof youtubeUrl === 'string' ? youtubeUrl.trim() : ''

  if (isYoutube && effectiveYoutubeUrl) {
    return (
      <div className="player-shell" ref={playerWrapperRef}>
        <div className="player-surface player-surface--youtube">
          <ReactPlayer
            ref={reactPlayerRef}
            url={effectiveYoutubeUrl}
            playing={playing}
            muted={muted}
            volume={volume}
            playsinline
            controls={false}
            width="100%"
            height="100%"
            onPlay={() => {
              setPlaying(true)
              onPlay?.()
            }}
            onPause={() => onPause?.()}
            onProgress={({ playedSeconds }) => {
              currentTimeRef.current = playedSeconds
              onProgress?.(playedSeconds)
            }}
            onDuration={(duration) => {
              if (duration && Number.isFinite(duration)) {
                onDuration?.(duration)
              }
            }}
          />
        </div>

        <div className="player-badge">
          <Circle size={10} className="text-red-600" />
          <span>YouTube</span>
        </div>

        {isPlaying && !playing && (
          <div className="player-overlay">
            <button type="button" className="player-action-btn" onClick={() => setPlaying(true)}>
              <Play size={22} />
              <span>Start playback</span>
            </button>
          </div>
        )}

        {!isHost && (
          <div
            className="player-click-capture"
            onClick={(event) => {
              event.stopPropagation()
              setPlaying(true)
            }}
          />
        )}

        <button type="button" className="player-fs-btn" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
    )
  }

  if (isMp4 && (!stream || !isValidStream)) {
    return (
      <div className="player-shell" ref={playerWrapperRef}>
        <div className="player-surface player-surface--idle">
          <div className="player-placeholder">
            <h2>Video not started yet</h2>
            <p>Waiting for the host to resume playback.</p>
          </div>
        </div>
      </div>
    )
  }

  if (stream && isValidStream) {
    return (
      <div className="player-shell" ref={playerWrapperRef}>
        <div className="player-surface">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            onPlay={onPlay}
            muted={muted}
            className="player-video"
          />

          <div className="player-badge">
            <Circle size={10} className="text-red-600" />
            <span>LIVE</span>
          </div>

          {showPlayOverlay && (
            <div className="player-overlay">
              <button
                type="button"
                className="player-action-btn"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {})
                    setShowPlayOverlay(false)
                    jumpToLiveInternal()
                  }
                }}
              >
                <Play size={22} />
                <span>Watch now</span>
              </button>
            </div>
          )}

          {showOverlay && mediaName && <div className="player-media-overlay">🎥 {mediaName}</div>}

          <button type="button" className="player-fs-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="player-shell">
      <div className="player-surface player-surface--idle">
        <div className="player-placeholder">
          <h2>Waiting for host</h2>
          <p>Start content to bring the room to life.</p>
        </div>
      </div>
    </div>
  )
})

export default VideoPlayer
