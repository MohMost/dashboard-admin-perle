import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { MembersPage } from '@/pages/members/MembersPage'
// import { UsersPage } from '@/pages/users/UsersPage' // "Utilisateurs" hidden — see AppSidebar
import { ContentPage } from '@/pages/content/ContentPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'members', element: <MembersPage /> },
      // { path: 'users', element: <UsersPage /> }, // "Utilisateurs" hidden — see AppSidebar
      { path: 'content', element: <ContentPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
