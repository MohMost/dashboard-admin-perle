import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { contentService } from '@/services/content.service'
import { ApiError } from '@/lib/api-client'

// Welcome message singleton — shown to members on their first login (native app).
export function WelcomeMessageEditor() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    contentService
      .getWelcomeMessage()
      .then((m) => {
        if (!active) return
        setSubject(m.subject)
        setBody(m.body)
      })
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Erreur de chargement.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      await contentService.setWelcomeMessage({ subject: subject.trim(), body })
      toast.success("Message d'accueil enregistré")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message d'accueil</CardTitle>
        <CardDescription>
          Affiché à vos clientes lors de leur première connexion dans l'application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Objet</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving || !subject.trim() || !body.trim()}>
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

// Founder info singleton — the "conseillère" bio shown in the app.
export function FounderEditor() {
  const [form, setForm] = useState({ name: '', fullName: '', bio: '', avatar: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let active = true
    contentService
      .getFounder()
      .then((f) => {
        if (!active) return
        setForm({ name: f.name, fullName: f.fullName, bio: f.bio, avatar: f.avatar })
      })
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Erreur de chargement.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      await contentService.setFounder({
        name: form.name.trim(),
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
      })
      toast.success('Fondatrice enregistrée')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  const valid = form.name && form.fullName && form.bio && form.avatar

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fondatrice</CardTitle>
        <CardDescription>Les informations de présentation affichées dans l'application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Prénom / nom court</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nom complet / titre</Label>
                <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Photo (URL)</Label>
              <Input value={form.avatar} onChange={(e) => set('avatar', e.target.value)} placeholder="https://…" />
              <p className="text-xs text-muted-foreground">
                Collez l'URL d'une image hébergée. L'upload direct sera ajouté plus tard.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving || !valid}>
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
