import { apiFetch, apiUpload } from '@/lib/api-client'

export interface Media {
  id: string
  url: string
  path: string
  contentType?: string | null
  createdAt: string
}

export const mediaService = {
  list: () => apiFetch<Media[]>('/admin/media'),
  upload: (form: FormData) => apiUpload<Media>('/admin/media', form),
}
