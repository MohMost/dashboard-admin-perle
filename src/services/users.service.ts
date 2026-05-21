import { usersMock } from '@/mocks/users.mock'
import type { AdminUser, UserFilters, PaginatedResponse } from '@/types'

export const usersService = {
  getUsers: (filters?: UserFilters): Promise<PaginatedResponse<AdminUser>> =>
    usersMock.getUsers(filters),

  getUserById: (id: string): Promise<AdminUser> =>
    usersMock.getUserById(id),

  createUser: (data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> =>
    usersMock.createUser(data),

  updateUser: (id: string, data: Partial<AdminUser>): Promise<AdminUser> =>
    usersMock.updateUser(id, data),

  deleteUser: (id: string): Promise<void> =>
    usersMock.deleteUser(id),

  suspendUser: (id: string): Promise<AdminUser> =>
    usersMock.suspendUser(id),

  activateUser: (id: string): Promise<AdminUser> =>
    usersMock.activateUser(id),
}
