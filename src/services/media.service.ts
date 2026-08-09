import { apiFetch, apiUpload } from '@/lib/api-client'

export interface Media {
  id: string
  url: string
  path: string
  contentType?: string | null
  createdAt: string
}

export interface MediaUsage {
  provider: string
  usedBytes: number
  limitBytes: number | null
  usedPercent: number | null
  plan: string | null
}

export const mediaService = {
  list: () => apiFetch<Media[]>('/admin/media'),
  usage: () => apiFetch<MediaUsage>('/admin/media/usage'),
  upload: (form: FormData) => apiUpload<Media>('/admin/media', form),
  remove: (id: string) =>
    apiFetch<void>(`/admin/media/${id}`, { method: 'DELETE' }),
}
