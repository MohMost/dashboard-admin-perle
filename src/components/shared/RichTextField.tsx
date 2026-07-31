import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { toast } from 'sonner'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ImagePlus,
} from 'lucide-react'
import { apiUpload, ApiError } from '@/lib/api-client'

// Rich-text editor for article content. Stores HTML (via editor.getHTML()).
// Inline images upload through the SAME /admin/uploads endpoint as
// ImageUploadField, so switching to a real image host later needs no change.
interface UploadResponse {
  url: string
}

export function RichTextField({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-md' } }),
    ],
    content: value || '',
    // Vite CSR — render immediately (avoids the SSR hydration guard).
    immediatelyRender: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-40 p-3 focus:outline-none dark:prose-invert',
      },
    },
  })

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez choisir une image.')
      return
    }
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await apiUpload<UploadResponse>('/admin/uploads', form)
      editor?.chain().focus().setImage({ src: res.url }).run()
      toast.success('Image insérée')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Échec du téléversement.")
    }
  }

  if (!editor) return null

  const Btn = ({
    active,
    onClick,
    label,
    children,
  }: {
    active?: boolean
    onClick: () => void
    label: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded hover:bg-accent ${
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <Btn
          label="Gras"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn
          label="Italique"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          label="Titre 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          label="Titre 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Btn
          label="Liste à puces"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Btn>
        <Btn
          label="Liste numérotée"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Insérer une image" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void uploadImage(file)
            e.target.value = ''
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
