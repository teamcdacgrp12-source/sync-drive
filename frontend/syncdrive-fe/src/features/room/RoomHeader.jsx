import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Copy, LogOut } from 'lucide-react'
import { roomApi } from '@/api/room.api'
import { authUtils } from '@/features/auth/auth.utils'
import Avatar from '@/components/Avatar'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'

export default function RoomHeader({ roomId = 'Lobby', user, isHost = false, disableProfileLink = false }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(user ?? authUtils.getUser())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) setCurrentUser(user)
  }, [user])

  useEffect(() => {
    const handleUserUpdate = () => setCurrentUser(authUtils.getUser())
    window.addEventListener('syncdrive:user-updated', handleUserUpdate)
    return () => window.removeEventListener('syncdrive:user-updated', handleUserUpdate)
  }, [])

  const handleLeave = async () => {
    try {
      if (roomId === 'Lobby') {
        authUtils.clearAuth()
        navigate('/login')
        return
      }

      if (isHost && !window.confirm('Leaving this room will end the hosted session. Continue?')) {
        return
      }

      await roomApi.leaveRoom(roomId)
      navigate('/rooms')
    } catch {
      navigate('/rooms')
    }
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Logo />
        {!disableProfileLink && (
          <Link to="/profile" className="flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1.5">
            <Avatar user={currentUser} size="sm" />
            <span className="text-sm font-medium text-slate-700">{currentUser?.displayName || currentUser?.username || 'Profile'}</span>
          </Link>
        )}
        {roomId !== 'Lobby' && roomId !== 'Dashboard' && (
          <button type="button" onClick={copyCode} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
            <span className="font-mono">{roomId}</span>
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      <Button type="button" variant="destructive" onClick={handleLeave}>
        <LogOut size={16} aria-hidden="true" />
        {roomId === 'Lobby' ? 'Logout' : 'Leave room'}
      </Button>
    </div>
  )
}
