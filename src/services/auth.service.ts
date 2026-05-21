import { authMock } from '@/mocks/auth.mock'
import type { LoginCredentials, AuthResponse } from '@/types'

// Service layer - swap mock for real API when ready
export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    authMock.login(credentials),

  logout: (): Promise<void> =>
    authMock.logout(),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    authMock.forgotPassword(email),

  resetPassword: (token: string, password: string): Promise<{ message: string }> =>
    authMock.resetPassword(token, password),

  me: (token: string): Promise<AuthResponse['user']> =>
    authMock.me(token),
}
