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
    accessCodeExpireDays: 30,
    maxLoginAttempts: 5,
  },
  email: {
    fromName: 'Perle de Lys',
    fromEmail: 'noreply@perledelys.fr',
    replyToEmail: 'contact@perledelys.fr',
    emailFooter: '© 2025 Perle de Lys. Tous droits réservés.',
    invitationSubject: 'Votre accès exclusif Perle de Lys',
    invitationBody: 'Bienvenue dans la communauté Perle de Lys ! Voici votre code d\'accès exclusif.',
  },
}

interface SettingsStore {
  settings: AppSettings
  updatePlatform: (data: Partial<AppSettings['platform']>) => void
  updateAccess: (data: Partial<AppSettings['access']>) => void
  updateEmail: (data: Partial<AppSettings['email']>) => void
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

      updateEmail: (data) =>
        set(s => ({ settings: { ...s.settings, email: { ...s.settings.email, ...data } } })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    { name: 'app-settings' }
  )
)
