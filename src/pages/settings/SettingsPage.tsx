import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { apiFetch, ApiError } from '@/lib/api-client'
import { useSettingsStore } from '@/store/settings.store'
import { ActivationCodeCard } from '@/pages/settings/ActivationCodeCard'

// Plateforme — reduced to just the support email (device-local config).
function SupportEmailCard() {
  const { settings, updatePlatform } = useSettingsStore()
  const [email, setEmail] = useState(settings.platform.supportEmail)

  useEffect(() => {
    setEmail(settings.platform.supportEmail)
  }, [settings.platform.supportEmail])

  const save = () => {
    updatePlatform({ ...settings.platform, supportEmail: email.trim() })
    toast.success('Email de support enregistré')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plateforme</CardTitle>
        <CardDescription>Coordonnée de support de votre application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email de support</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={save}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Accès — max failed logins before a temporary lock. Persisted to the backend
// and enforced by AuthService.login (see /api/settings/max-login-attempts).
function MaxLoginAttemptsCard() {
  const [value, setValue] = useState('5')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    apiFetch<{ maxLoginAttempts: number }>('/settings/max-login-attempts')
      .then((r) => active && setValue(String(r.maxLoginAttempts)))
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Erreur de chargement.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await apiFetch('/settings/max-login-attempts', {
        method: 'PUT',
        body: { maxLoginAttempts: Number(value) },
      })
      toast.success('Nombre de tentatives enregistré')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès</CardTitle>
        <CardDescription>Sécurité de connexion des membres.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tentatives de connexion max</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={value}
            disabled={loading}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Au-delà de ce nombre d'échecs consécutifs, le compte est bloqué
            temporairement (15 min).
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre plateforme Perle de Lys.</p>
      </div>

      <SupportEmailCard />
      <ActivationCodeCard />
      <MaxLoginAttemptsCard />
    </div>
  )
}
