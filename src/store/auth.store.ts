import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, LoginCredentials } from '@/types'
import { authService } from '@/services/auth.service'
import { setAuthToken } from '@/lib/api-client'

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Une erreur est survenue.',
            isLoading: false,
          })
          throw err
        }
      },

      logout: async () => {
        const { token } = get()
        if (token) await authService.logout()
        set({ user: null, token: null, isAuthenticated: false })
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      // Restore the Authorization header for the api-client after a reload.
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    }
  )
)
