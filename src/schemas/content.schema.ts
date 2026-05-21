import { z } from 'zod'

export const contentSchema = z.object({
  title: z.string().min(3, 'Titre requis (minimum 3 caractères)'),
  type: z.enum(['article', 'video', 'audio', 'image', 'document']),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  scheduledAt: z.string().optional(),
})

export type ContentFormData = z.infer<typeof contentSchema>
