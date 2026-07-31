import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUploadField } from '@/components/shared/ImageUploadField'

// Edits an ordered list of image URLs (string[]). Each slot reuses
// ImageUploadField (drag-drop/click upload to /admin/uploads + preview +
// remove). "Ajouter une image" appends an empty slot; clearing a slot removes
// it. Same upload endpoint as everywhere else, so it stays swappable.
export function MultiImageField({
  value,
  onChange,
}: {
  value: string[]
  onChange: (urls: string[]) => void
}) {
  const setAt = (i: number, url: string) => {
    if (!url) {
      // Cleared → drop the slot.
      onChange(value.filter((_, idx) => idx !== i))
      return
    }
    onChange(value.map((v, idx) => (idx === i ? url : v)))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, i) => (
          <ImageUploadField key={i} value={url} onChange={(v) => setAt(i, v)} />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, ''])}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une image
      </Button>
    </div>
  )
}
