import { authMock } from '@/mocks/auth.mock'
import { apiFetch, setAuthToken } from '@/lib/api-client'
import type { AuthResponse, AuthUser, LoginCredentials } from '@/types'

// Login is wired to the real backend (POST /api/auth/login). The other flows
// (forgot/reset password, me) remain mocked until the backend grows them —
// see BACKEND_PLAN.md Phase 6.

interface BackendUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  username: string
  role: 'MEMBER' | 'ADMIN'
  status: 'PENDING' | 'ACTIVE'
  isActivated: boolean
  avatar?: string | null
  createdAt?: string
}

function mapUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    email: u.email ?? '',
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    // The backend has MEMBER | ADMIN; the dashboard's richer role set maps
    // ADMIN → 'admin' (only admins get past the guard below).
    role: 'admin',
    avatar: u.avatar ?? undefined,
    createdAt: u.createdAt ?? new Date().toISOString(),
  }
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  avatar?: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiFetch<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      // Backend login accepts an email OR username in `identifier`.
      body: { identifier: credentials.email, password: credentials.password },
    })
    if (res.user.role !== 'ADMIN') {
      throw new Error('Accès réservé aux administrateurs.')
    }
    setAuthToken(res.token)
    return { user: mapUser(res.user), token: res.token, expiresAt: '' }
  },

  logout: async (): Promise<void> => {
    // Stateless JWT — nothing to invalidate server-side; just drop the token.
    setAuthToken(null)
  },

  forgotPassword: (email: string) =>
    apiFetch<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  me: (token: string): Promise<AuthResponse['user']> => authMock.me(token),

  // Admin self-service credentials update → PATCH /api/auth/me (backend).
  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const user = await apiFetch<BackendUser>('/auth/me', {
      method: 'PATCH',
      body: payload,
    })
    return mapUser(user)
  },
}
