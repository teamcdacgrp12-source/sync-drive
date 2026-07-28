import { Check, Copy, DoorOpen } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function RoomHeader({ roomName, roomCode, onLeave }) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard?.writeText(roomCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div><h1 className="font-semibold text-slate-950">{roomName}</h1><p className="text-xs text-slate-500">Watch together in real time</p></div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copyCode} aria-label="Copy room code"><span className="font-mono">{roomCode}</span>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onLeave}><DoorOpen size={15} aria-hidden="true" />Leave</Button>
      </div>
    </header>
  )
}
