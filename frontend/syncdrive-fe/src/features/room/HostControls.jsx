import { MonitorUp, Upload } from 'lucide-react'
import './room.css'

export default function HostControls({
  isHost = false,
  mediaName = '',
  youtubeUrl = '',
  onPickMp4,
  onShareScreen,
  onLoadYoutube,
  onMediaNameChange,
  onYoutubeUrlChange,
}) {
  if (!isHost) return null

  return (
    <div className="host-controls-card">
      <div className="host-controls-row">
        <label className="host-controls-field">
          <span>Media label</span>
          <input
            type="text"
            value={mediaName}
            onChange={(event) => onMediaNameChange?.(event.target.value)}
            placeholder="Optional media label"
            className="host-control-input"
          />
        </label>
      </div>

      <div className="host-controls-row">
        <button type="button" className="host-control-btn" onClick={onPickMp4}>
          <Upload size={16} />
          Pick MP4
        </button>
        <button type="button" className="host-control-btn" onClick={onShareScreen}>
          <MonitorUp size={16} />
          Share screen
        </button>
      </div>

      <div className="host-controls-row">
        <input
          type="text"
          value={youtubeUrl}
          onChange={(event) => onYoutubeUrlChange?.(event.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="host-control-input host-control-input--wide"
        />
        <button type="button" className="host-control-btn host-control-btn--primary" onClick={onLoadYoutube}>
          Load YouTube
        </button>
      </div>
    </div>
  )
}
