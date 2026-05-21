import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { contentService } from '@/services/content.service'
import { contentSchema, type ContentFormData } from '@/schemas/content.schema'
import { CONTENT_CATEGORIES, CONTENT_TYPES } from '@/lib/constants'
import type { ContentItem } from '@/types'

interface ContentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content?: ContentItem | null
}

export function ContentFormDialog({ open, onOpenChange, content }: ContentFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!content

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: { title: '', type: 'article', status: 'draft', excerpt: '', body: '', categories: [], tags: [] },
  })

  const categories = watch('categories') ?? []

  useEffect(() => {
    if (content) {
      reset({
        title: content.title, type: content.type, status: content.status,
        excerpt: content.excerpt ?? '', body: content.body ?? '',
        categories: content.categories, tags: content.tags,
      })
    } else {
      reset({ title: '', type: 'article', status: 'draft', excerpt: '', body: '', categories: [], tags: [] })
    }
  }, [content, reset])

  const mutation = useMutation({
    mutationFn: (data: ContentFormData) => {
      if (isEdit && content) {
        return contentService.updateContent(content.id, data)
      }
      return contentService.createContent({
        ...data,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author: 'Admin',
        authorId: '1',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      toast.success(isEdit ? 'Contenu mis à jour' : 'Contenu créé')
      onOpenChange(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleCategory = (cat: string) => {
    const current = categories ?? []
    if (current.includes(cat)) setValue('categories', current.filter(c => c !== cat))
    else setValue('categories', [...current, cat])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le contenu' : 'Nouveau contenu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input {...register('title')} placeholder="Titre du contenu..." className={errors.title ? 'border-destructive' : ''} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller name="type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Extrait</Label>
            <Textarea {...register('excerpt')} placeholder="Courte description..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Contenu</Label>
            <Textarea {...register('body')} placeholder="Contenu complet..." rows={6} />
          </div>

          <div className="space-y-2">
            <Label>Catégories</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)}>
                  <Badge variant={categories?.includes(cat) ? 'default' : 'outline'} className="cursor-pointer">
                    {categories?.includes(cat) && <X className="w-3 h-3 mr-1" />}
                    {cat}
                  </Badge>
                </button>
              ))}
            </div>
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
