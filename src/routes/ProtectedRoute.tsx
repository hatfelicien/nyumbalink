import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export interface ProtectedRouteProps {
  allowedRoles: Role[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
