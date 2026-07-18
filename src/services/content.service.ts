import { apiFetch } from '@/lib/api-client'

// Wired to the backend content API (BACKEND_PLAN.md Phase 5). Collections use
// the ACTIVE-guarded reads (`GET /api/content/*`, the admin is ACTIVE so it's
// allowed) and admin CRUD (`/api/admin/content/*`). Field shapes mirror the
// native app's content types.

export interface Recipe {
  id: string
  title: string
  image: string
  time: string
  difficulty: string
  category: string
  portions: number
  description: string
  cookidooUrl: string
  isNew: boolean
  ingredients: { label: string; qty: string }[]
  steps: string[]
  createdAt: string
  updatedAt: string
}
export interface WelcomeMessage {
  id: string
  subject: string
  body: string
  updatedAt: string
}
export interface Founder {
  id: string
  name: string
  fullName: string
  bio: string
  avatar: string
  updatedAt: string
}

export type ContentCollection =
  | 'recipes'
  | 'videos'
  | 'articles'
  | 'lives'
  | 'events'
  | 'faq'

// A content item is any record with an id (the generic manager reads fields
// dynamically per the collection config).
export type ContentRecord = { id: string } & Record<string, unknown>

export const contentService = {
  list: (collection: ContentCollection) =>
    apiFetch<ContentRecord[]>(`/content/${collection}`),

  create: (collection: ContentCollection, body: Record<string, unknown>) =>
    apiFetch<ContentRecord>(`/admin/content/${collection}`, {
      method: 'POST',
      body,
    }),

  update: (
    collection: ContentCollection,
    id: string,
    body: Record<string, unknown>,
  ) =>
    apiFetch<ContentRecord>(`/admin/content/${collection}/${id}`, {
      method: 'PATCH',
      body,
    }),

  remove: (collection: ContentCollection, id: string) =>
    apiFetch<unknown>(`/admin/content/${collection}/${id}`, { method: 'DELETE' }),

  // Singletons
  getWelcomeMessage: () => apiFetch<WelcomeMessage>('/content/welcome-message'),
  setWelcomeMessage: (body: { subject: string; body: string }) =>
    apiFetch<WelcomeMessage>('/admin/content/welcome-message', {
      method: 'PUT',
      body,
    }),
  getFounder: () => apiFetch<Founder>('/content/founder'),
  setFounder: (body: {
    name: string
    fullName: string
    bio: string
    avatar: string
  }) => apiFetch<Founder>('/admin/content/founder', { method: 'PUT', body }),
}
