import { useState } from 'react'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'
import Avatar from '@/components/Avatar'

export default function ParticipantList({ participants = [], profileMap = {} }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="participant-list">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700">
        <span className="flex items-center gap-2">
          <Users size={15} aria-hidden="true" />
          Participants
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{participants.length}</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          {participants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">No one is here yet.</div>
          ) : (
            participants.map((participant, index) => {
              const key = Number(participant)
              const profile = profileMap[key] || profileMap[participant]
              const displayName = profile?.displayName || profile?.username || participant
              const avatarUser = {
                username: profile?.username || displayName,
                displayName,
                avatarUrl: profile?.avatarUrl,
              }

              return (
                <div key={`${displayName}-${index}`} className="participant-item">
                  <Avatar user={avatarUser} size="sm" />
                  <div className="flex-1 truncate text-sm font-medium text-slate-700">{displayName}</div>
                  <span className="participant-dot" aria-hidden="true" />
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
