import { Navigate, useLocation } from 'react-router-dom'
import { authUtils } from '@/features/auth/auth.utils'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
