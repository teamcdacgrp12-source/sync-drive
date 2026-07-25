import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { roomApi } from '@/api/room.api'
import Loader from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const refreshInterval = 10000

export default function RoomList() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const loadRooms = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true)

    try {
      const result = await roomApi.getPublicRooms()
      setRooms(result)
      setError(null)
    } catch {
      setError('Unable to load public rooms. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
    const intervalId = window.setInterval(loadRooms, refreshInterval)
    return () => window.clearInterval(intervalId)
  }, [loadRooms])

  if (loading) return <Loader label="Finding public rooms" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Public rooms</h1>
          <p className="mt-2 text-slate-600">Find a watch party or create one of your own.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => loadRooms(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </Button>
          <Link to="/rooms/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"><Plus size={16} aria-hidden="true" />Create room</Link>
        </div>
      </div>
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {rooms.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="font-medium">No public rooms yet</p><p className="mt-2 text-sm text-slate-500">Start the first watch party for your friends.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.roomCode}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{room.roomName}</h2><p className="mt-1 font-mono text-sm text-slate-500">{room.roomCode}</p></div><Badge>Public</Badge></div>
                <div className="mt-5 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Users size={16} aria-hidden="true" />{room.participantCount} / {room.maxUsers} people</span><Button onClick={() => navigate(`/rooms/new?code=${encodeURIComponent(room.roomCode)}`)}>Join room</Button></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
