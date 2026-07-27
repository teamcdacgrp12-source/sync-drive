import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/layout/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import ProfilePage from '@/pages/ProfilePage'
import Register from '@/pages/Register'
import RoomJoinCreate from '@/pages/RoomJoinCreate'
import RoomList from '@/pages/RoomList'
import RoomHeader from '@/features/room/RoomHeader'
import ChatPanel from '@/features/room/ChatPanel'
import ParticipantList from '@/features/room/ParticipantList'
import './features/room/room.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><RoomList /></ProtectedRoute>} />
        <Route path="/rooms/new" element={<ProtectedRoute><RoomJoinCreate /></ProtectedRoute>} />
        <Route path="/room/:roomCode" element={<ProtectedRoute><div className="space-y-4"><RoomHeader roomId="demo-room" /><div className="room-panel"><div className="room-stage"><div className="room-stage-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Room experience placeholder</div></div><aside className="room-sidebar"><div className="room-sidebar-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><ParticipantList participants={['1', '2']} /></div><div className="room-sidebar-card rounded-2xl border border-slate-200 bg-white p-0 shadow-sm"><ChatPanel messages={[{ sender: 'system', content: 'Welcome to the room' }]} roomCode="demo-room" /></div></aside></div></div></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
