import type { ContentItem, PaginatedResponse, ContentFilters } from '@/types'
import { delay, slugify } from '@/lib/utils'
import { MOCK_CONTENT } from './seed'

let content = [...MOCK_CONTENT]

function filterContent(filters: ContentFilters): ContentItem[] {
  let result = [...content]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(c => c.title.toLowerCase().includes(q) || c.excerpt?.toLowerCase().includes(q))
  }
  if (filters.status && filters.status !== 'all') {
    result = result.filter(c => c.status === filters.status)
  }
  if (filters.type && filters.type !== 'all') {
    result = result.filter(c => c.type === filters.type)
  }
  if (filters.category) {
    result = result.filter(c => c.categories.includes(filters.category!))
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const contentMock = {
  async getContent(filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> {
    await delay(400)
    const filtered = filterContent(filters)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const start = (page - 1) * limit
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    }
  },

  async getContentById(id: string): Promise<ContentItem> {
    await delay(300)
    const item = content.find(c => c.id === id)
    if (!item) throw new Error('Contenu non trouvé.')
    return item
  },

  async createContent(data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<ContentItem> {
    await delay(600)
    const newItem: ContentItem = {
      ...data,
      id: `c${Date.now()}`,
      slug: slugify(data.title),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    content = [...content, newItem]
    return newItem
  },

  async updateContent(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    await delay(500)
    const idx = content.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Contenu non trouvé.')
    content[idx] = {
      ...content[idx],
      ...data,
      slug: data.title ? slugify(data.title) : content[idx].slug,
      updatedAt: new Date().toISOString(),
    }
    return content[idx]
  },

  async deleteContent(id: string): Promise<void> {
    await delay(500)
    content = content.filter(c => c.id !== id)
  },

  async publishContent(id: string): Promise<ContentItem> {
    return contentMock.updateContent(id, { status: 'published', publishedAt: new Date().toISOString() })
  },

  async unpublishContent(id: string): Promise<ContentItem> {
    return contentMock.updateContent(id, { status: 'draft', publishedAt: undefined })
  },

  async scheduleContent(id: string, scheduledAt: string): Promise<ContentItem> {
    return contentMock.updateContent(id, { status: 'scheduled', scheduledAt })
  },
}
