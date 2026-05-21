import { z } from 'zod'

export const memberSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  status: z.enum(['active', 'suspended', 'pending', 'expired']),
  tags: z.array(z.string()),
  notes: z.string().optional(),
})

export type MemberFormData = z.infer<typeof memberSchema>
