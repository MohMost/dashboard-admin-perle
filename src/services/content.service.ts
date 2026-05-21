import { contentMock } from '@/mocks/content.mock'
import type { ContentItem, ContentFilters, PaginatedResponse } from '@/types'

export const contentService = {
  getContent: (filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> =>
    contentMock.getContent(filters),

  getContentById: (id: string): Promise<ContentItem> =>
    contentMock.getContentById(id),

  createContent: (data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<ContentItem> =>
    contentMock.createContent(data),

  updateContent: (id: string, data: Partial<ContentItem>): Promise<ContentItem> =>
    contentMock.updateContent(id, data),

  deleteContent: (id: string): Promise<void> =>
    contentMock.deleteContent(id),

  publishContent: (id: string): Promise<ContentItem> =>
    contentMock.publishContent(id),

  unpublishContent: (id: string): Promise<ContentItem> =>
    contentMock.unpublishContent(id),

  scheduleContent: (id: string, scheduledAt: string): Promise<ContentItem> =>
    contentMock.scheduleContent(id, scheduledAt),

  archiveContent: (id: string): Promise<ContentItem> =>
    contentMock.updateContent(id, { status: 'archived' }),
}
