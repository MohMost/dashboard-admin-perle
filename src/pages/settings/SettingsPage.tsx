import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsStore } from '@/store/settings.store'

const platformSchema = z.object({
  platformName: z.string().min(1, 'Requis'),
  platformUrl: z.string().url('URL invalide'),
  supportEmail: z.string().email('Email invalide'),
  primaryColor: z.string().min(1),
})

const accessSchema = z.object({
  allowRegistration: z.boolean(),
  emailVerification: z.boolean(),
  memberApproval: z.boolean(),
  accessCodeExpireDays: z.number().min(1).max(365),
  maxLoginAttempts: z.number().min(1).max(20),
})

const emailSchema = z.object({
  fromName: z.string().min(1, 'Requis'),
  fromEmail: z.string().email('Email invalide'),
  replyToEmail: z.string().email('Email invalide'),
  emailFooter: z.string(),
  invitationSubject: z.string().min(1, 'Requis'),
  invitationBody: z.string().min(1, 'Requis'),
})

type PlatformFormData = z.infer<typeof platformSchema>
type AccessFormData = z.infer<typeof accessSchema>
type EmailFormData = z.infer<typeof emailSchema>

function PlatformSettings() {
  const { settings, updatePlatform } = useSettingsStore()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: settings.platform,
  })

  useEffect(() => { reset(settings.platform) }, [settings.platform, reset])

  const onSubmit = (data: PlatformFormData) => {
    updatePlatform(data)
    toast.success('Paramètres de la plateforme sauvegardés')
    reset(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nom de la plateforme</Label>
          <Input {...register('platformName')} className={errors.platformName ? 'border-destructive' : ''} />
          {errors.platformName && <p className="text-xs text-destructive">{errors.platformName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>URL de la plateforme</Label>
          <Input {...register('platformUrl')} className={errors.platformUrl ? 'border-destructive' : ''} />
          {errors.platformUrl && <p className="text-xs text-destructive">{errors.platformUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email de support</Label>
          <Input type="email" {...register('supportEmail')} className={errors.supportEmail ? 'border-destructive' : ''} />
          {errors.supportEmail && <p className="text-xs text-destructive">{errors.supportEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Couleur principale</Label>
          <div className="flex items-center gap-2">
            <Input type="color" {...register('primaryColor')} className="h-9 w-16 cursor-pointer p-1" />
            <Input {...register('primaryColor')} className="flex-1" placeholder="#1a1a1a" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty}>
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>
    </form>
  )
}

function AccessSettings() {
  const { settings, updateAccess } = useSettingsStore()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<AccessFormData>({
    resolver: zodResolver(accessSchema),
    defaultValues: settings.access,
  })

  useEffect(() => { reset(settings.access) }, [settings.access, reset])

  const watched = watch()

  const onSubmit = (data: AccessFormData) => {
    updateAccess(data)
    toast.success('Paramètres d\'accès sauvegardés')
    reset(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {([
          { name: 'allowRegistration' as const, label: 'Autoriser l\'inscription publique', desc: 'Les utilisateurs peuvent créer un compte sans invitation' },
          { name: 'emailVerification' as const, label: 'Vérification email requise', desc: 'Envoyer un email de confirmation à l\'inscription' },
          { name: 'memberApproval' as const, label: 'Approbation manuelle des membres', desc: 'Les nouveaux membres doivent être approuvés par un administrateur' },
        ] as const).map(item => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch
              checked={watched[item.name]}
              onCheckedChange={v => setValue(item.name, v, { shouldDirty: true })}
            />
          </div>
        ))}
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Expiration des codes d'accès (jours)</Label>
          <Input type="number" min={1} max={365} {...register('accessCodeExpireDays')} className={errors.accessCodeExpireDays ? 'border-destructive' : ''} />
          {errors.accessCodeExpireDays && <p className="text-xs text-destructive">{errors.accessCodeExpireDays.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Tentatives de connexion max</Label>
          <Input type="number" min={1} max={20} {...register('maxLoginAttempts')} className={errors.maxLoginAttempts ? 'border-destructive' : ''} />
          {errors.maxLoginAttempts && <p className="text-xs text-destructive">{errors.maxLoginAttempts.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty}>
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>
    </form>
  )
}

function EmailSettings() {
  const { settings, updateEmail } = useSettingsStore()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: settings.email,
  })

  useEffect(() => { reset(settings.email) }, [settings.email, reset])

  const onSubmit = (data: EmailFormData) => {
    updateEmail(data)
    toast.success('Paramètres email sauvegardés')
    reset(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nom d'expéditeur</Label>
          <Input {...register('fromName')} className={errors.fromName ? 'border-destructive' : ''} />
          {errors.fromName && <p className="text-xs text-destructive">{errors.fromName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email d'expéditeur</Label>
          <Input type="email" {...register('fromEmail')} className={errors.fromEmail ? 'border-destructive' : ''} />
          {errors.fromEmail && <p className="text-xs text-destructive">{errors.fromEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email de réponse</Label>
          <Input type="email" {...register('replyToEmail')} className={errors.replyToEmail ? 'border-destructive' : ''} />
          {errors.replyToEmail && <p className="text-xs text-destructive">{errors.replyToEmail.message}</p>}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Objet de l'invitation</Label>
          <Input {...register('invitationSubject')} className={errors.invitationSubject ? 'border-destructive' : ''} />
          {errors.invitationSubject && <p className="text-xs text-destructive">{errors.invitationSubject.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Corps de l'invitation</Label>
          <Textarea {...register('invitationBody')} rows={4} className={errors.invitationBody ? 'border-destructive' : ''} />
          {errors.invitationBody && <p className="text-xs text-destructive">{errors.invitationBody.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Pied de page email</Label>
          <Textarea {...register('emailFooter')} rows={2} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty}>
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>
    </form>
  )
}

export function SettingsPage() {
  const { resetSettings } = useSettingsStore()

  const handleReset = () => {
    resetSettings()
    toast.success('Paramètres réinitialisés')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Configurez votre plateforme Perle de Lys.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />Réinitialiser
        </Button>
      </div>

      <Tabs defaultValue="platform">
        <TabsList>
          <TabsTrigger value="platform">Plateforme</TabsTrigger>
          <TabsTrigger value="access">Accès</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la plateforme</CardTitle>
              <CardDescription>Configurez les informations générales de votre application.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contrôle d'accès</CardTitle>
              <CardDescription>Définissez les règles d'inscription et de connexion des membres.</CardDescription>
            </CardHeader>
            <CardContent>
              <AccessSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration email</CardTitle>
              <CardDescription>Personnalisez les emails envoyés à vos membres.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
