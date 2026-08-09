import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImageUp, Loader2 } from 'lucide-react'
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
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                Astuce : maintenez une image appuyée pour la supprimer.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {items.map((m) => (
                  <MediaTile key={m.id} url={m.url} onLongPress={() => setDeleteId(m.id)} />
                ))}
              </div>
            </>
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

// A media thumbnail. Press-and-hold (≥500ms, mouse or touch) triggers delete;
// a normal tap/click opens the image in a new tab.
function MediaTile({ url, onLongPress }: { url: string; onLongPress: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fired = useRef(false)

  const start = () => {
    fired.current = false
    timer.current = setTimeout(() => {
      fired.current = true
      onLongPress()
    }, 500)
  }
  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return (
    <div
      className="relative aspect-square cursor-pointer select-none overflow-hidden rounded-md border"
      title="Maintenez pour supprimer"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        // Don't open the image if the press was a long-press (delete intent).
        if (fired.current) return
        window.open(url, '_blank', 'noopener,noreferrer')
      }}
    >
      <img
        src={url}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-cover"
      />
    </div>
  )
}
