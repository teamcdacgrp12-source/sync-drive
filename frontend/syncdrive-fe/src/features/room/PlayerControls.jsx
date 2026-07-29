import { Pause, Play, SkipForward } from 'lucide-react'
import './room.css'

const formatTime = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0
  const mins = Math.floor(safeValue / 60)
  const secs = Math.floor(safeValue % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function PlayerControls({
  isHost = false,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onTogglePlayback,
  onSeek,
  onJumpToLive,
  status = 'LIVE',
}) {
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <div className="player-controls-panel">
      <div className="player-controls-main">
        <button type="button" className="player-control-btn" onClick={onTogglePlayback}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        {isHost ? (
          <button type="button" className="player-control-btn" onClick={onJumpToLive}>
            <SkipForward size={18} />
          </button>
        ) : null}

        <div className="player-progress-block">
          <span className="player-time-text">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(event) => onSeek?.(Number(event.target.value))}
            className="player-progress"
          />
          <span className="player-time-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-control-meta">
        <span className="player-status-pill">{status}</span>
        <span className="player-progress-label">{Math.round(progress)}% watched</span>
      </div>
    </div>
  )
}
