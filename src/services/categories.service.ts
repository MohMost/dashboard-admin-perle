import { apiFetch } from '@/lib/api-client'

// Backs the select-or-create category picker on the content forms. Categories
// are a managed backend list scoped per collection (recipe/video/article).
export interface Category {
  id: string
  name: string
  scope: string
  createdAt: string
}

export const categoriesService = {
  list: (scope: string) =>
    apiFetch<Category[]>(`/admin/categories?scope=${encodeURIComponent(scope)}`),

  create: (scope: string, name: string) =>
    apiFetch<Category>('/admin/categories', {
      method: 'POST',
      body: { scope, name },
    }),
}
