import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { roomApi } from '@/api/room.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialRoom = { roomName: '', isPublic: true, maxUsers: 8 }

export default function RoomJoinCreate() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(() => (searchParams.has('code') ? 'join' : 'create'))
  const [room, setRoom] = useState(initialRoom)
  const [joinCode, setJoinCode] = useState(() => searchParams.get('code') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const updateRoom = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value
    setRoom((current) => ({ ...current, [target.name]: target.name === 'maxUsers' ? Number(value) : value }))
  }

  const createRoom = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const createdRoom = await roomApi.createRoom(room)
      navigate(`/room/${createdRoom.roomCode}`)
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Unable to create a room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async (event) => {
    event.preventDefault()
    const roomCode = joinCode.trim().toUpperCase()

    if (!roomCode) return

    setLoading(true)
    setError(null)

    try {
      await roomApi.joinRoom(roomCode)
      navigate(`/room/${roomCode}`)
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        navigate(`/room/${roomCode}`)
        return
      }

      setError(requestError.response?.data?.message ?? 'Unable to join this room. Check the invite code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Start watching together</h1><p className="mt-2 text-slate-600">Create a room or join one with an invite code.</p></div>
      <div className="inline-flex rounded-lg bg-slate-100 p-1">
        <button type="button" onClick={() => setMode('create')} className={`rounded-md px-4 py-2 text-sm font-medium ${mode === 'create' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}>Create room</button>
        <button type="button" onClick={() => setMode('join')} className={`rounded-md px-4 py-2 text-sm font-medium ${mode === 'join' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}>Join with code</button>
      </div>
      {mode === 'create' && (
        <Card>
          <CardHeader><CardTitle>Create a room</CardTitle><CardDescription>Choose a name and invite your friends.</CardDescription></CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={createRoom}>
              <div className="space-y-2"><Label htmlFor="room-name">Room name</Label><Input id="room-name" name="roomName" value={room.roomName} onChange={updateRoom} placeholder="Friday movie night" maxLength={100} required /></div>
              <div className="space-y-2"><Label htmlFor="max-users">Maximum people</Label><Input id="max-users" name="maxUsers" type="number" min="2" max="100" value={room.maxUsers} onChange={updateRoom} required /></div>
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input name="isPublic" type="checkbox" checked={room.isPublic} onChange={updateRoom} />Make this room public</label>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create room'}</Button>
            </form>
          </CardContent>
        </Card>
      )}
      {mode === 'join' && (
        <Card>
          <CardHeader><CardTitle>Join a room</CardTitle><CardDescription>Enter the invite code shared by the host.</CardDescription></CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={joinRoom}>
              <div className="space-y-2"><Label htmlFor="room-code">Invite code</Label><Input id="room-code" value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123" className="font-mono uppercase tracking-[0.2em]" maxLength={12} required /></div>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Joining…' : 'Join room'}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
