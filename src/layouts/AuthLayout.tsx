import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
