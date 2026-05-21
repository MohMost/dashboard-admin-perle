import { z } from 'zod'

export const userSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator']),
  status: z.enum(['active', 'suspended', 'inactive']),
})

export type UserFormData = z.infer<typeof userSchema>
