import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImageUp, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { mediaService } from '@/services/media.service'
import { ApiError } from '@/lib/api-client'

// Média library — every image uploaded to Firebase Storage. Drag-and-drop (or
// click) to add one; existing images can be reused elsewhere via the media
// picker in the content forms.
export function MediaPage() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaService.list,
  })
  const items = data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Image supprimée')
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : 'Échec de la suppression.'),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return mediaService.upload(form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Image ajoutée à la médiathèque')
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Échec du téléversement."),
  })

  const onFile = (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez déposer une image.')
      return
    }
    uploadMutation.mutate(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Médiathèque</h1>
        <p className="text-muted-foreground">
          Toutes vos images. Ajoutez-en par glisser-déposer, puis réutilisez-les
          partout.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onFile(e.dataTransfer.files?.[0])
        }}
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-input'
        }`}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <ImageUp className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          Glissez-déposez une image ici, ou cliquez pour choisir un fichier.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-md" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune image pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-md border"
                >
                  <a href={m.url} target="_blank" rel="noreferrer">
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleteId(m.id)}
                    aria-label="Supprimer l'image"
                    className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1.5 text-muted-foreground opacity-0 shadow transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cette image ?"
        description="Elle sera retirée de la médiathèque et du service de stockage. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
