import { useState } from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch, ApiError } from '@/lib/api-client'

// The notification kinds and their default title, matching the backend enum.
const TYPES: { value: string; label: string; title: string }[] = [
  { value: 'recipe', label: 'Nouvelle recette disponible', title: 'Nouvelle recette disponible' },
  { value: 'video', label: 'Nouvelle vidéo publiée', title: 'Nouvelle vidéo publiée' },
  { value: 'live', label: 'Nouveau live annoncé', title: 'Nouveau live annoncé' },
  { value: 'replay', label: 'Replay disponible', title: 'Replay disponible' },
  { value: 'ramadan', label: 'Annonce spéciale Ramadan', title: 'Annonce spéciale Ramadan' },
  { value: 'promo', label: 'Promotion ou information importante', title: 'Information importante' },
]

export function NotificationsPage() {
  const [type, setType] = useState('recipe')
  const [title, setTitle] = useState(TYPES[0].title)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const onTypeChange = (v: string) => {
    setType(v)
    // Prefill the title with the preset (only if the user hasn't customised it).
    const preset = TYPES.find((t) => t.value === v)
    const currentPreset = TYPES.find((t) => t.title === title)
    if (preset && (currentPreset || !title.trim())) setTitle(preset.title)
  }

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Renseignez un titre et un message.')
      return
    }
    setSending(true)
    try {
      await apiFetch('/admin/notifications/send', {
        method: 'POST',
        body: { type, title: title.trim(), body: body.trim() },
      })
      toast.success('Notification envoyée à toutes les clientes')
      setBody('')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Échec de l'envoi.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Envoyez une notification push à toutes vos clientes.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nouvelle notification</CardTitle>
          <CardDescription>
            Elle apparaît dans l'app (centre de notifications) et en push sur les
            téléphones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={body}
              placeholder="Le texte de la notification…"
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={send} disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Envoi…' : 'Envoyer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
