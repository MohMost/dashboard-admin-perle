import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'

const defaultSettings: AppSettings = {
  platform: {
    platformName: 'Perle de Lys',
    platformUrl: 'https://perledelys.fr',
    primaryColor: '#1a1a1a',
    supportEmail: 'contact@perledelys.fr',
  },
  access: {
    allowRegistration: false,
    emailVerification: false,
    memberApproval: true,
    maxLoginAttempts: 5,
  },
}

interface SettingsStore {
  settings: AppSettings
  updatePlatform: (data: Partial<AppSettings['platform']>) => void
  updateAccess: (data: Partial<AppSettings['access']>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updatePlatform: (data) =>
        set(s => ({ settings: { ...s.settings, platform: { ...s.settings.platform, ...data } } })),

      updateAccess: (data) =>
        set(s => ({ settings: { ...s.settings, access: { ...s.settings.access, ...data } } })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    { name: 'app-settings' }
  )
)
