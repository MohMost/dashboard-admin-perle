import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function AuthLayout() {
  // Must use the SAME "logged in" condition as ProtectedRoute
  // (isAuthenticated && user). If they disagree — e.g. stale localStorage with
  // isAuthenticated:true but a null user — the two guards redirect back and
  // forth forever and freeze the browser.
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
