import type { UserRole } from '@/types'

export const ROLES: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'destructive' },
  admin: { label: 'Admin', color: 'default' },
  editor: { label: 'Editor', color: 'secondary' },
  moderator: { label: 'Moderator', color: 'outline' },
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin: ['users.*', 'members.*', 'content.*', 'settings.read'],
  editor: ['content.*', 'members.read'],
  moderator: ['members.*', 'content.read'],
}

export const PAGINATION_LIMITS = [10, 25, 50, 100]
export const DEFAULT_PAGE_LIMIT = 10

export const ACCESS_CODE_LENGTH = 8

export const CONTENT_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'audio', label: 'Audio' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
]

export const CONTENT_CATEGORIES = [
  'Bien-être',
  'Beauté',
  'Lifestyle',
  'Nutrition',
  'Fitness',
  'Mode',
  'Conseils',
  'Exclusif',
]

export const MEMBER_TAGS = [
  'VIP',
  'Premium',
  'Standard',
  'Trial',
  'Newsletter',
  'Ambassador',
]
