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
  introTitle: string
  introContent: string
  subject: string
  body: string
  steps: string[]
  image?: string | null
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
export interface Landing {
  id: string
  tagline: string
  title: string
  description: string
  image?: string | null
  updatedAt: string
}
export interface About {
  id: string
  image?: string | null
  body: string
  updatedAt: string
}
export interface Stat {
  value: string
  label: string
}
export interface WhoAmI {
  id: string
  bio: string
  storyImage: string
  why: string
  stats: Stat[]
  gridImages: string[]
  carouselImages: string[]
  quote: string
  updatedAt: string
}
export interface Legal {
  id: string
  privacy: string
  terms: string
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
  setWelcomeMessage: (body: {
    introTitle: string
    introContent: string
    subject: string
    body: string
    steps: string[]
  }) =>
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

  getLanding: () => apiFetch<Landing>('/content/landing'),
  setLanding: (body: {
    tagline: string
    title: string
    description: string
    image?: string
  }) => apiFetch<Landing>('/admin/content/landing', { method: 'PUT', body }),

  getAbout: () => apiFetch<About>('/content/about'),
  setAbout: (body: { image?: string; body: string }) =>
    apiFetch<About>('/admin/content/about', { method: 'PUT', body }),

  getWhoAmI: () => apiFetch<WhoAmI>('/content/who-am-i'),
  setWhoAmI: (body: {
    bio: string
    storyImage: string
    why: string
    stats: Stat[]
    gridImages: string[]
    carouselImages: string[]
    quote: string
  }) => apiFetch<WhoAmI>('/admin/content/who-am-i', { method: 'PUT', body }),

  getLegal: () => apiFetch<Legal>('/content/legal'),
  setLegal: (body: { privacy: string; terms: string }) =>
    apiFetch<Legal>('/admin/content/legal', { method: 'PUT', body }),
}
