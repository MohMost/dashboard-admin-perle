import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { membersService } from '@/services/members.service'
import { memberSchema, type MemberFormData } from '@/schemas/member.schema'
import { MEMBER_TAGS } from '@/lib/constants'
import type { Member } from '@/types'

interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: Member | null
}

export function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!member

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', status: 'active', tags: [], notes: '' },
  })

  const tags = watch('tags') ?? []

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone ?? '',
        status: member.status,
        tags: member.tags,
        notes: member.notes ?? '',
      })
    } else {
      reset({ firstName: '', lastName: '', email: '', phone: '', status: 'active', tags: [], notes: '' })
    }
  }, [member, reset])

  const mutation = useMutation({
    mutationFn: (data: MemberFormData) => {
      if (isEdit && member) {
        return membersService.updateMember(member.id, data)
      }
      return membersService.createMember({ ...data, tags: data.tags ?? [] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(isEdit ? 'Membre mis à jour' : 'Membre créé avec succès')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleTag = (tag: string) => {
    const current = tags ?? []
    if (current.includes(tag)) {
      setValue('tags', current.filter(t => t !== tag))
    } else {
      setValue('tags', [...current, tag])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le membre' : 'Nouveau membre'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register('firstName')} className={errors.firstName ? 'border-destructive' : ''} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName')} className={errors.lastName ? 'border-destructive' : ''} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} placeholder="+33 6 00 00 00 00" />
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {MEMBER_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="transition-opacity"
                >
                  <Badge
                    variant={tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    {tags?.includes(tag) && <X className="w-3 h-3 mr-1" />}
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} placeholder="Notes internes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
