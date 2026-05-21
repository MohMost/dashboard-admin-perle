import type { AuthResponse, LoginCredentials } from '@/types'
import { delay } from '@/lib/utils'
import { MOCK_ADMIN_USERS } from './seed'

const FAKE_PASSWORDS: Record<string, string> = {
  'superadmin@perledelys.fr': 'admin123',
  'admin@perledelys.fr': 'admin123',
  'editor@perledelys.fr': 'admin123',
  'moderator@perledelys.fr': 'admin123',
}

function generateFakeJWT(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }))
  return `${header}.${payload}.mock_signature`
}

export const authMock = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800)
    const user = MOCK_ADMIN_USERS.find(u => u.email === credentials.email)
    if (!user || FAKE_PASSWORDS[credentials.email] !== credentials.password) {
      throw new Error('Email ou mot de passe incorrect.')
    }
    if (user.status === 'suspended') {
      throw new Error('Ce compte a été suspendu. Contactez un administrateur.')
    }
    return {
      user,
      token: generateFakeJWT(user.id),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    }
  },

  async logout(): Promise<void> {
    await delay(300)
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    await delay(800)
    const user = MOCK_ADMIN_USERS.find(u => u.email === email)
    if (!user) throw new Error('Aucun compte trouvé avec cet email.')
    return { message: 'Un email de réinitialisation a été envoyé.' }
  },

  async resetPassword(_token: string, _newPassword: string): Promise<{ message: string }> {
    await delay(800)
    return { message: 'Mot de passe réinitialisé avec succès.' }
  },

  async me(token: string): Promise<AuthResponse['user']> {
    await delay(300)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const user = MOCK_ADMIN_USERS.find(u => u.id === payload.sub)
    if (!user) throw new Error('Session expirée.')
    return user
  },
}
