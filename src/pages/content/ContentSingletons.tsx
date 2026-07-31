import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { MultiImageField } from '@/components/shared/MultiImageField'
import { RichTextField } from '@/components/shared/RichTextField'
import { contentService } from '@/services/content.service'
import { ApiError } from '@/lib/api-client'

// Welcome message singleton — shown to members on their first login (native app).
export function WelcomeMessageEditor() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
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
        setImage(m.image ?? '')
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
      await contentService.setWelcomeMessage({ subject: subject.trim(), body, image })
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
            <div className="space-y-1.5">
              <Label>Image (optionnel)</Label>
              <ImageUploadField value={image} onChange={setImage} />
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
              <Label>Photo</Label>
              <ImageUploadField value={form.avatar} onChange={(v) => set('avatar', v)} />
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

// Pre-login landing screen — the very first screen a logged-out client sees.
export function LandingEditor() {
  const [form, setForm] = useState({
    tagline: '',
    title: '',
    description: '',
    image: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let active = true
    contentService
      .getLanding()
      .then((l) => {
        if (!active) return
        setForm({
          tagline: l.tagline,
          title: l.title,
          description: l.description,
          image: l.image ?? '',
        })
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
      await contentService.setLanding({
        tagline: form.tagline.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image,
      })
      toast.success("Écran d'accueil enregistré")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  const valid = form.tagline && form.title && form.description

  return (
    <Card>
      <CardHeader>
        <CardTitle>Écran d'accueil (avant connexion)</CardTitle>
        <CardDescription>
          Le tout premier écran que voient vos clientes, avant de se connecter.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Petit texte (badge)</Label>
              <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Image d'accueil</Label>
              <ImageUploadField value={form.image} onChange={(v) => set('image', v)} />
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

// "À propos" page — branded image + rich-text body.
export function AboutEditor() {
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    contentService
      .getAbout()
      .then((a) => {
        if (!active) return
        setImage(a.image ?? '')
        setBody(a.body)
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
      await contentService.setAbout({ image, body })
      toast.success('« À propos » enregistré')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>À propos</CardTitle>
        <CardDescription>
          La page « À propos » de l'application (accessible depuis l'accueil).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageUploadField value={image} onChange={setImage} />
            </div>
            <div className="space-y-1.5">
              <Label>Contenu</Label>
              <RichTextField value={body} onChange={setBody} />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving}>
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

// "Qui suis-je ?" page — bio + image grid + photo carousel + testimonial quote.
export function WhoAmIEditor() {
  const [form, setForm] = useState({
    bio: '',
    gridImages: [] as string[],
    carouselImages: [] as string[],
    quote: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let active = true
    contentService
      .getWhoAmI()
      .then((w) => {
        if (!active) return
        setForm({
          bio: w.bio,
          gridImages: w.gridImages ?? [],
          carouselImages: w.carouselImages ?? [],
          quote: w.quote,
        })
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
      await contentService.setWhoAmI({
        bio: form.bio.trim(),
        gridImages: form.gridImages.filter(Boolean),
        carouselImages: form.carouselImages.filter(Boolean),
        quote: form.quote.trim(),
      })
      toast.success('« Qui suis-je ? » enregistré')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qui suis-je ?</CardTitle>
        <CardDescription>
          Votre présentation : biographie, photos et le « mot de Ghania ».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Biographie</Label>
              <Textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Galerie (grille)</Label>
              <MultiImageField
                value={form.gridImages}
                onChange={(v) => set('gridImages', v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Carrousel photos</Label>
              <MultiImageField
                value={form.carouselImages}
                onChange={(v) => set('carouselImages', v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Un mot de Ghania (citation)</Label>
              <Textarea rows={3} value={form.quote} onChange={(e) => set('quote', e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving}>
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

// Legal texts (Politique de confidentialité + Conditions générales).
export function LegalEditor() {
  const [privacy, setPrivacy] = useState('')
  const [terms, setTerms] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    contentService
      .getLegal()
      .then((l) => {
        if (!active) return
        setPrivacy(l.privacy)
        setTerms(l.terms)
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
      await contentService.setLegal({ privacy, terms })
      toast.success('Mentions légales enregistrées')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentions légales</CardTitle>
        <CardDescription>
          Textes affichés dans l'application (popups) et à l'inscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Politique de confidentialité</Label>
              <RichTextField value={privacy} onChange={setPrivacy} />
            </div>
            <div className="space-y-1.5">
              <Label>Conditions générales</Label>
              <RichTextField value={terms} onChange={setTerms} />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving}>
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
