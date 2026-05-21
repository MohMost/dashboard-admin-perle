import { membersMock } from '@/mocks/members.mock'
import type { Member, MemberFilters, PaginatedResponse } from '@/types'

export const membersService = {
  getMembers: (filters?: MemberFilters): Promise<PaginatedResponse<Member>> =>
    membersMock.getMembers(filters),

  getMemberById: (id: string): Promise<Member> =>
    membersMock.getMemberById(id),

  createMember: (data: Omit<Member, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Member> =>
    membersMock.createMember(data),

  updateMember: (id: string, data: Partial<Member>): Promise<Member> =>
    membersMock.updateMember(id, data),

  deleteMember: (id: string): Promise<void> =>
    membersMock.deleteMember(id),

  suspendMember: (id: string): Promise<Member> =>
    membersMock.suspendMember(id),

  activateMember: (id: string): Promise<Member> =>
    membersMock.activateMember(id),

  regenerateCode: (id: string): Promise<Member> =>
    membersMock.regenerateCode(id),

  bulkDelete: (ids: string[]): Promise<void> =>
    membersMock.bulkDelete(ids),

  bulkSuspend: (ids: string[]): Promise<void> =>
    membersMock.bulkSuspend(ids),
}
