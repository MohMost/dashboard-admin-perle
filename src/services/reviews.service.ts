import { apiFetch } from '@/lib/api-client'

// Backs the dashboard's Reviews moderation page. Admin-only endpoints under
// /api/admin/reviews (list with optional status filter, moderate, delete).
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Review {
  id: string
  userId: string
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  user?: { username: string }
}

export const reviewsService = {
  list: (status?: ReviewStatus) =>
    apiFetch<Review[]>(
      `/admin/reviews${status ? `?status=${status}` : ''}`,
    ),

  moderate: (id: string, status: 'APPROVED' | 'REJECTED') =>
    apiFetch<Review>(`/admin/reviews/${id}`, {
      method: 'PATCH',
      body: { status },
    }),

  remove: (id: string) =>
    apiFetch<unknown>(`/admin/reviews/${id}`, { method: 'DELETE' }),
}
