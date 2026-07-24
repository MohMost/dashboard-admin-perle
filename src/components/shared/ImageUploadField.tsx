import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImageUp, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { apiUpload, ApiError } from '@/lib/api-client'

// Drag-and-drop image upload. Uploads the file to the admin upload endpoint and
// stores the returned URL as the field value (a plain string, so the rest of
// the content form is unchanged). A manual URL box remains as a fallback (e.g.
// to paste an already-hosted image). The backend delegates storage to a
// swappable provider, so pointing this at a real image host later needs no
// change here.
interface UploadResponse {
  url: string
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

export function ImageUploadField({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez déposer une image.')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await apiUpload<UploadResponse>('/admin/uploads', form)
      onChange(res.url)
      toast.success('Image téléversée')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Échec du téléversement.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
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
          const file = e.dataTransfer.files?.[0]
          if (file) void upload(file)
        }}
        className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-input'
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Aperçu"
              className="max-h-32 rounded object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-destructive"
              aria-label="Retirer l'image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Téléversement…</p>
          </>
        ) : (
          <>
            <ImageUp className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Glissez-déposez une image ici, ou cliquez pour choisir un fichier.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.target.value = ''
          }}
        />
      </div>
      <Input
        value={value}
        placeholder="…ou collez l'URL d'une image hébergée"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
