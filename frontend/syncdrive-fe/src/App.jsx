import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/layout/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import ProfilePage from '@/pages/ProfilePage'
import Register from '@/pages/Register'
import RoomJoinCreate from '@/pages/RoomJoinCreate'
import RoomList from '@/pages/RoomList'
import RoomView from '@/features/room/RoomView'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><RoomList /></ProtectedRoute>} />
        <Route path="/rooms/new" element={<ProtectedRoute><RoomJoinCreate /></ProtectedRoute>} />
        <Route path="/rooms/:roomCode" element={<ProtectedRoute><RoomView /></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
