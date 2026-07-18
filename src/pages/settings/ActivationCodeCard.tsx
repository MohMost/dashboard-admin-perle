import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { KeyRound, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { apiFetch, ApiError } from '@/lib/api-client'

// Manages the global activation code (BACKEND_PLAN.md Task 4.3), wired to the
// backend's admin-only GET/PUT /api/settings/activation-code. Plain fetch (the
// app has no QueryClientProvider). Changing the code only affects FUTURE
// activations — already-active members keep access.
interface ActivationCodeResponse {
  activationCode: string
  updatedAt: string
}

export function ActivationCodeCard() {
  const [current, setCurrent] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    apiFetch<ActivationCodeResponse>('/settings/activation-code')
      .then((res) => {
        if (!active) return
        setCurrent(res.activationCode)
        setCode(res.activationCode)
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof ApiError ? e.message : 'Erreur de chargement.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const onSave = async () => {
    const value = code.trim()
    if (!value) return
    setSaving(true)
    try {
      const res = await apiFetch<ActivationCodeResponse>('/settings/activation-code', {
        method: 'PUT',
        body: { activationCode: value },
      })
      setCurrent(res.activationCode)
      setCode(res.activationCode)
      toast.success("Code d'activation mis à jour")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Code d'activation
        </CardTitle>
        <CardDescription>
          Code global partagé que vos clientes saisissent pour activer leur compte
          (transmis manuellement, ex. par WhatsApp). Le modifier n'affecte que les
          nouvelles activations — les comptes déjà activés conservent leur accès.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Code actuel</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading || saving}
                placeholder={loading ? 'Chargement…' : 'WELCOME2026'}
                className="font-mono uppercase tracking-widest"
                autoCapitalize="characters"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={onSave}
                disabled={loading || saving || !code.trim() || code.trim() === current}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
