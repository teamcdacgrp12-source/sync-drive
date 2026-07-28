import { Crown, Users } from 'lucide-react'
import Avatar from '@/components/Avatar'
import './room.css'

export default function ParticipantList({ participants = [], hostUserId }) {
  return (
    <section className="room-sidebar h-full" aria-label="Participants">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h2 className="font-semibold">People here</h2><span className="inline-flex items-center gap-1 text-sm text-slate-500"><Users size={15} aria-hidden="true" />{participants.length}</span></header>
      <ul className="flex-1 overflow-y-auto p-2">
        {participants.map((participant) => {
          const isHost = participant.id === hostUserId || participant.userId === hostUserId
          return (
            <li key={participant.id ?? participant.userId ?? participant.username} className="room-participant flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar user={participant} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{participant.displayName || participant.username}</span>
              {isHost && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700"><Crown size={14} aria-hidden="true" />Host</span>}
            </li>
          )
        })}
        {participants.length === 0 && <li className="px-2 py-6 text-center text-sm text-slate-500">No participants yet.</li>}
      </ul>
    </section>
  )
}
