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

// "Mes premiers pas" screen — intro block (title + text over the video), the
// "Mot de Ghania" (objet + message) and the "Vos prochaines étapes" list.
export function WelcomeMessageEditor() {
  const [form, setForm] = useState({
    introTitle: '',
    introContent: '',
    subject: '',
    body: '',
    steps: '', // one step per line
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let active = true
    contentService
      .getWelcomeMessage()
      .then((m) => {
        if (!active) return
        setForm({
          introTitle: m.introTitle ?? '',
          introContent: m.introContent ?? '',
          subject: m.subject,
          body: m.body,
          steps: (m.steps ?? []).join('\n'),
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
      await contentService.setWelcomeMessage({
        introTitle: form.introTitle.trim(),
        introContent: form.introContent.trim(),
        subject: form.subject.trim(),
        body: form.body,
        steps: form.steps
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      toast.success('« Mes premiers pas » enregistré')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes premiers pas</CardTitle>
        <CardDescription>
          L'écran affiché à vos clientes après leur connexion (intro vidéo, mot de
          Ghania et prochaines étapes).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Texte d'intro — titre</Label>
              <Input
                value={form.introTitle}
                placeholder="Mise en service du TM7…"
                onChange={(e) => set('introTitle', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Texte d'intro — contenu</Label>
              <Textarea
                rows={2}
                value={form.introContent}
                placeholder="La vidéo de mise en service de votre Thermomix TM7."
                onChange={(e) => set('introContent', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mot de Ghania — objet</Label>
              <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mot de Ghania — message</Label>
              <Textarea rows={10} value={form.body} onChange={(e) => set('body', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Vos prochaines étapes (une par ligne)</Label>
              <Textarea rows={5} value={form.steps} onChange={(e) => set('steps', e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={onSave}
                disabled={saving || !form.subject.trim() || !form.body.trim()}
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

// "À propos" page — optional image + rich-text content.
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
        setBody(a.body ?? '')
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
              <Label>Image (optionnel)</Label>
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

// "Qui suis-je ?" page — Mon histoire, Pourquoi, Statistiques, testimonial +
// the "mot de Ghania". Photos on the app are placeholders (not edited here).
export function WhoAmIEditor() {
  const [form, setForm] = useState({
    bio: '',
    storyImage: '',
    why: '',
    stats: [] as { value: string; label: string }[],
    carouselImages: [] as string[],
    quote: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const setStat = (i: number, k: 'value' | 'label', v: string) =>
    setForm((p) => ({
      ...p,
      stats: p.stats.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)),
    }))
  const addStat = () => setForm((p) => ({ ...p, stats: [...p.stats, { value: '', label: '' }] }))
  const removeStat = (i: number) =>
    setForm((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }))

  useEffect(() => {
    let active = true
    contentService
      .getWhoAmI()
      .then((w) => {
        if (!active) return
        setForm({
          bio: w.bio,
          storyImage: w.storyImage ?? '',
          why: w.why ?? '',
          stats: w.stats ?? [],
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
        storyImage: form.storyImage,
        why: form.why.trim(),
        stats: form.stats
          .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
          .filter((s) => s.value || s.label),
        gridImages: [],
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
          Votre présentation : histoire, statistiques, témoignage et le « mot de Ghania ».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Mon histoire</Label>
              <Textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Image « Mon histoire »</Label>
              <ImageUploadField value={form.storyImage} onChange={(v) => set('storyImage', v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Pourquoi cette application ?</Label>
              <Textarea rows={3} value={form.why} onChange={(e) => set('why', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Statistiques</Label>
              {form.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="w-32"
                    placeholder="+3000"
                    value={s.value}
                    onChange={(e) => setStat(i, 'value', e.target.value)}
                  />
                  <Input
                    className="flex-1"
                    placeholder="Clientes Accompagnées"
                    value={s.label}
                    onChange={(e) => setStat(i, 'label', e.target.value)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeStat(i)}>
                    Retirer
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addStat}>
                Ajouter une statistique
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Mes photos (carrousel)</Label>
              <MultiImageField
                value={form.carouselImages}
                onChange={(v) => set('carouselImages', v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Un mot de Ghania (citation)</Label>
              <Textarea rows={3} value={form.quote} onChange={(e) => set('quote', e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Les témoignages affichés sur « Qui suis-je ? » proviennent des avis
              clients approuvés (onglet Avis).
            </p>
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
