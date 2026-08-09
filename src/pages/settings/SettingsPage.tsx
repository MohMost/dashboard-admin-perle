import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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

type Integrations = {
  storageProvider: 'firebase' | 'cloudinary' | 's3'
  firebaseProjectId: string
  firebaseClientEmail: string
  firebasePrivateKey: string
  firebaseStorageBucket: string
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
  s3Endpoint: string
  s3Region: string
  s3Bucket: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3PublicUrl: string
  storageLimitGb: number
  openaiApiKey: string
}

const EMPTY_INTEGRATIONS: Integrations = {
  storageProvider: 'firebase',
  firebaseProjectId: '',
  firebaseClientEmail: '',
  firebaseStorageBucket: '',
  firebasePrivateKey: '',
  cloudinaryCloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: '',
  s3Endpoint: '',
  s3Region: '',
  s3Bucket: '',
  s3AccessKeyId: '',
  s3SecretAccessKey: '',
  s3PublicUrl: '',
  storageLimitGb: 0,
  openaiApiKey: '',
}

// Intégrations — image host (Firebase / Cloudinary) + OpenAI. Stored in the DB
// (AppSettings) so it's editable here at runtime; secrets are shown as password
// fields. All admin-only.
function IntegrationsSettings() {
  const [form, setForm] = useState<Integrations>(EMPTY_INTEGRATIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof Integrations>(k: K, v: Integrations[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let active = true
    apiFetch<Integrations>('/settings/integrations')
      .then((r) => active && setForm({ ...EMPTY_INTEGRATIONS, ...r }))
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Erreur de chargement.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await apiFetch('/settings/integrations', { method: 'PUT', body: form })
      toast.success('Intégrations enregistrées')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hébergement des images</CardTitle>
          <CardDescription>
            Choisissez le service utilisé pour stocker les images téléversées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service actif</Label>
            <Select
              value={form.storageProvider}
              onValueChange={(v) => set('storageProvider', v as Integrations['storageProvider'])}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firebase">Firebase Storage</SelectItem>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                <SelectItem value="s3">IONOS / S3 compatible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Only the selected provider's credentials are shown. */}
          {form.storageProvider === 'firebase' && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Firebase Storage</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project ID" value={form.firebaseProjectId} onChange={(v) => set('firebaseProjectId', v)} />
                <Field label="Client email" value={form.firebaseClientEmail} onChange={(v) => set('firebaseClientEmail', v)} />
                <Field label="Storage bucket" value={form.firebaseStorageBucket} onChange={(v) => set('firebaseStorageBucket', v)} placeholder="mon-projet.appspot.com" />
              </div>
              <div className="space-y-2">
                <Label>Private key</Label>
                <Textarea
                  rows={4}
                  className="font-mono text-xs"
                  value={form.firebasePrivateKey}
                  placeholder="-----BEGIN PRIVATE KEY-----\n…"
                  onChange={(e) => set('firebasePrivateKey', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.storageProvider === 'cloudinary' && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Cloudinary</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Cloud name" value={form.cloudinaryCloudName} onChange={(v) => set('cloudinaryCloudName', v)} />
                <Field label="API key" type="password" value={form.cloudinaryApiKey} onChange={(v) => set('cloudinaryApiKey', v)} />
                <Field label="API secret" type="password" value={form.cloudinaryApiSecret} onChange={(v) => set('cloudinaryApiSecret', v)} />
              </div>
            </div>
          )}

          {form.storageProvider === 's3' && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">IONOS Object Storage (S3 compatible)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Bucket" value={form.s3Bucket} onChange={(v) => set('s3Bucket', v)} />
                <Field label="Région" value={form.s3Region} onChange={(v) => set('s3Region', v)} placeholder="eu-central-1" />
                <Field label="Access key ID" type="password" value={form.s3AccessKeyId} onChange={(v) => set('s3AccessKeyId', v)} />
                <Field label="Secret access key" type="password" value={form.s3SecretAccessKey} onChange={(v) => set('s3SecretAccessKey', v)} />
                <Field label="Endpoint" value={form.s3Endpoint} onChange={(v) => set('s3Endpoint', v)} placeholder="https://s3-eu-central-1.ionoscloud.com" />
                <Field label="URL publique / CDN (optionnel)" value={form.s3PublicUrl} onChange={(v) => set('s3PublicUrl', v)} placeholder="laisser vide pour l'URL du bucket" />
              </div>
              <p className="text-xs text-muted-foreground">
                IONOS : renseignez l'endpoint de votre région (ex.
                <code className="mx-1">https://s3-eu-central-1.ionoscloud.com</code>)
                et créez une clé S3 dans « Key Management » de la console IONOS.
              </p>
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label>Limite de stockage (Go)</Label>
            <Input
              type="number"
              min={0}
              className="w-40"
              value={String(form.storageLimitGb)}
              onChange={(e) => set('storageLimitGb', Number(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Sert à la barre d'usage (Médiathèque) pour IONOS / Firebase —
              0 = aucune limite. Cloudinary affiche automatiquement sa propre
              limite.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI</CardTitle>
          <CardDescription>Clé API utilisée par l'assistant de l'application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Clé API OpenAI"
            type="password"
            value={form.openaiApiKey}
            onChange={(v) => set('openaiApiKey', v)}
            placeholder="sk-…"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Enregistrement…' : 'Enregistrer les intégrations'}
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre plateforme Perle de Lys.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <SupportEmailCard />
          <ActivationCodeCard />
          <MaxLoginAttemptsCard />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
