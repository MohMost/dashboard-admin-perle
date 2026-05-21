import type { AdminUser, PaginatedResponse, UserFilters } from '@/types'
import { delay, generateAccessCode } from '@/lib/utils'
import { MOCK_ADMIN_USERS } from './seed'

let users = [...MOCK_ADMIN_USERS]

function filterUsers(filters: UserFilters): AdminUser[] {
  return users.filter(u => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)) return false
    }
    if (filters.status && filters.status !== 'all' && u.status !== filters.status) return false
    if (filters.role && filters.role !== 'all' && u.role !== filters.role) return false
    return true
  })
}

export const usersMock = {
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<AdminUser>> {
    await delay(400)
    const filtered = filterUsers(filters)
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

  async getUserById(id: string): Promise<AdminUser> {
    await delay(300)
    const user = users.find(u => u.id === id)
    if (!user) throw new Error('Utilisateur non trouvé.')
    return user
  },

  async createUser(data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    await delay(600)
    if (users.find(u => u.email === data.email)) {
      throw new Error('Cet email est déjà utilisé.')
    }
    const newUser: AdminUser = {
      ...data,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users = [...users, newUser]
    return newUser
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    await delay(500)
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Utilisateur non trouvé.')
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() }
    return users[idx]
  },

  async deleteUser(id: string): Promise<void> {
    await delay(500)
    users = users.filter(u => u.id !== id)
  },

  async suspendUser(id: string): Promise<AdminUser> {
    return usersMock.updateUser(id, { status: 'suspended' })
  },

  async activateUser(id: string): Promise<AdminUser> {
    return usersMock.updateUser(id, { status: 'active' })
  },

  async generateInviteCode(_id: string): Promise<string> {
    await delay(300)
    return generateAccessCode()
  },
}
