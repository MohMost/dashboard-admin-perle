import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mediaService } from '@/services/media.service'

// Picks an existing image from the Firebase-backed media library. Clicking a
// thumbnail returns its URL and closes.
export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSelect: (url: string) => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaService.list,
    enabled: open,
  })
  const items = data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Médiathèque</DialogTitle>
          <DialogDescription>
            Choisissez une image déjà téléversée.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucune image dans la médiathèque pour le moment.
          </p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelect(m.url)
                  onOpenChange(false)
                }}
                className="aspect-square overflow-hidden rounded-md border transition-colors hover:border-primary"
              >
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
