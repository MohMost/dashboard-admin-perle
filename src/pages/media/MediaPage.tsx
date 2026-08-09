import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, ImageUp, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { mediaService } from '@/services/media.service'

// Accepted upload formats + per-file size cap, enforced client-side before we
// hit the storage endpoint (the same rules live in ImageUploadField).
const ACCEPTED_TYPES = ['image/png', 'image/webp', 'image/jpeg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo

// Média library — every image uploaded to Firebase Storage. Drag-and-drop (or
// click) to add one or several; existing images can be reused elsewhere via the
// media picker in the content forms.
export function MediaPage() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  // Ids queued for deletion (single via the hover trash, or many via the
  // selection toolbar). Non-null opens the confirm dialog.
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null)
  // Multi-select mode, entered by long-pressing a tile.
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaService.list,
  })
  const items = data ?? []

  const { data: usage } = useQuery({
    queryKey: ['media-usage'],
    queryFn: mediaService.usage,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['media'] })
    queryClient.invalidateQueries({ queryKey: ['media-usage'] })
  }

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const enterSelectMode = (id: string) => {
    setSelectMode(true)
    setSelected(new Set([id]))
  }

  // Validate + upload a batch of files. Rejected files raise a toast; accepted
  // ones upload concurrently and produce a single summary toast.
  const handleFiles = async (fileList: FileList | File[] | null | undefined) => {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return

    const accepted: File[] = []
    let badFormat = false
    let tooLarge = false
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        badFormat = true
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        tooLarge = true
        continue
      }
      accepted.push(file)
    }
    if (badFormat) toast.error('Format non supporté (PNG, WebP ou JPEG).')
    if (tooLarge) toast.error('Image trop volumineuse (max 5 Mo).')
    if (accepted.length === 0) return

    setUploading(true)
    try {
      const results = await Promise.allSettled(
        accepted.map((file) => {
          const form = new FormData()
          form.append('file', file)
          return mediaService.upload(form)
        }),
      )
      const ok = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.length - ok
      invalidate()
      if (ok > 0) {
        toast.success(
          `${ok} image(s) ajoutée(s)` +
            (failed > 0 ? ` · ${failed} échec(s)` : ''),
        )
      } else {
        toast.error('Échec du téléversement.')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (ids: string[]) => {
    const results = await Promise.allSettled(ids.map((id) => mediaService.remove(id)))
    const ok = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - ok
    invalidate()
    if (ok > 0) {
      toast.success(
        ok === 1 ? 'Image supprimée' : `${ok} image(s) supprimée(s)`,
      )
    }
    if (failed > 0 && ok === 0) {
      toast.error('Échec de la suppression.')
    } else if (failed > 0) {
      toast.error(`${failed} suppression(s) échouée(s).`)
    }
    exitSelectMode()
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

      {usage && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Stockage utilisé
                {usage.plan ? ` · ${usage.plan}` : ''}
              </span>
              <span className="text-muted-foreground">
                {formatBytes(usage.usedBytes)}
                {usage.limitBytes ? ` / ${formatBytes(usage.limitBytes)}` : ''}
              </span>
            </div>
            {usage.limitBytes || usage.usedPercent != null ? (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    (usage.usedPercent ?? 0) >= 90 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, usage.usedPercent ?? 0)}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Aucune limite définie — indiquez-en une dans Paramètres →
                Intégrations pour suivre le quota.
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
          void handleFiles(e.dataTransfer.files)
        }}
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-input'
        }`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <ImageUp className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          Glissez-déposez une ou plusieurs images ici, ou cliquez pour choisir
          des fichiers.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {selectMode && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 p-3">
          <span className="text-sm font-medium">
            {selected.size} sélectionnée(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => setDeleteIds(Array.from(selected))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la sélection
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exitSelectMode}>
              Annuler
            </Button>
          </div>
        </div>
      )}

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
                Maintenez une image pour sélectionner plusieurs images.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {items.map((m) => (
                  <MediaTile
                    key={m.id}
                    url={m.url}
                    selectMode={selectMode}
                    selected={selected.has(m.id)}
                    onOpen={() => window.open(m.url, '_blank', 'noopener,noreferrer')}
                    onToggleSelect={() => toggleSelect(m.id)}
                    onLongPress={() => enterSelectMode(m.id)}
                    onDelete={() => setDeleteIds([m.id])}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteIds}
        onOpenChange={(open) => {
          if (!open) setDeleteIds(null)
        }}
        title={
          deleteIds && deleteIds.length > 1
            ? `Supprimer ${deleteIds.length} images ?`
            : 'Supprimer cette image ?'
        }
        description="Elles seront retirées de la médiathèque et du service de stockage. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteIds) void handleDelete(deleteIds)
          setDeleteIds(null)
        }}
      />
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 Mo'
  const gb = bytes / 1_000_000_000
  if (gb >= 1) return `${gb.toFixed(2)} Go`
  return `${(bytes / 1_000_000).toFixed(1)} Mo`
}

// A media thumbnail.
// - Long-press (≥500ms, mouse or touch) enters multi-select mode and selects it.
// - In select mode, a tap toggles its selection (never opens the image).
// - Otherwise a tap opens the image in a new tab.
// - On desktop, hovering reveals a trash button that deletes just this image.
function MediaTile({
  url,
  selectMode,
  selected,
  onOpen,
  onToggleSelect,
  onLongPress,
  onDelete,
}: {
  url: string
  selectMode: boolean
  selected: boolean
  onOpen: () => void
  onToggleSelect: () => void
  onLongPress: () => void
  onDelete: () => void
}) {
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
      className={`group relative aspect-square cursor-pointer select-none overflow-hidden rounded-md border ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      title={selectMode ? 'Touchez pour (dé)sélectionner' : 'Maintenez pour sélectionner'}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        // A long-press already handled the interaction (entered select mode).
        if (fired.current) return
        if (selectMode) onToggleSelect()
        else onOpen()
      }}
    >
      <img
        src={url}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-cover"
      />

      {selected && (
        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}

      {!selectMode && (
        <button
          type="button"
          aria-label="Supprimer l'image"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
