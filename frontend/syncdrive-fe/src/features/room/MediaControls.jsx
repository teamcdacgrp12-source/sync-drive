import { Mic, MicOff, Video, VideoOff } from 'lucide-react'
import './room.css'

export default function MediaControls({
  isHost = false,
  isMicEnabled = true,
  isCameraEnabled = true,
  onToggleMic,
  onToggleCamera,
}) {
  return (
    <div className="media-controls-row">
      <button type="button" className={`media-control-pill ${isMicEnabled ? 'media-control-pill--active' : ''}`} onClick={onToggleMic}>
        {isMicEnabled ? <Mic size={15} /> : <MicOff size={15} />}
        <span>{isMicEnabled ? 'Mic on' : 'Mic off'}</span>
      </button>
      <button type="button" className={`media-control-pill ${isCameraEnabled ? 'media-control-pill--active' : ''}`} onClick={onToggleCamera}>
        {isCameraEnabled ? <Video size={15} /> : <VideoOff size={15} />}
        <span>{isCameraEnabled ? 'Camera on' : 'Camera off'}</span>
      </button>
      {isHost ? <span className="player-status-pill">Host controls</span> : null}
    </div>
  )
}
