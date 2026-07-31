import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { ApiError } from '@/lib/api-client'

// Admin self-credentials editor (opened from the sidebar identity). Edits
// prénom / nom / email / mot de passe (optional) / avatar, via PATCH /auth/me.
export function AdminProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, setUser } = useAuthStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  // Reseed the form from the current user each time the dialog opens.
  useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setEmail(user.email ?? '')
      setAvatar(user.avatar ?? '')
      setPassword('')
    }
  }, [open, user])

  const onSave = async () => {
    setSaving(true)
    try {
      const updated = await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        avatar,
        ...(password ? { password } : {}),
      })
      setUser(updated)
      toast.success('Profil mis à jour')
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mon profil</DialogTitle>
          <DialogDescription>
            Modifiez vos informations de connexion et votre photo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Prénom</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              // Prevent browser autofill from silently changing the password.
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Photo (optionnel)</Label>
            <ImageUploadField value={avatar} onChange={setAvatar} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !firstName.trim() || (!!password && password.length < 6)}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
