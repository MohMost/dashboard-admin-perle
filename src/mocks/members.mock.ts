import type { Member, PaginatedResponse, MemberFilters } from '@/types'
import { delay, generateAccessCode } from '@/lib/utils'
import { MOCK_MEMBERS } from './seed'

let members = [...MOCK_MEMBERS]

function filterMembers(filters: MemberFilters): Member[] {
  let result = [...members]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(m =>
      `${m.firstName} ${m.lastName} ${m.email} ${m.accessCode}`.toLowerCase().includes(q)
    )
  }
  if (filters.status && filters.status !== 'all') {
    result = result.filter(m => m.status === filters.status)
  }
  if (filters.tag) {
    result = result.filter(m => m.tags.includes(filters.tag!))
  }
  if (filters.sortField) {
    result.sort((a, b) => {
      const aVal = a[filters.sortField as keyof Member] as string
      const bVal = b[filters.sortField as keyof Member] as string
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''))
      return filters.sortDirection === 'desc' ? -cmp : cmp
    })
  }
  return result
}

export const membersMock = {
  async getMembers(filters: MemberFilters = {}): Promise<PaginatedResponse<Member>> {
    await delay(400)
    const filtered = filterMembers(filters)
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

  async getMemberById(id: string): Promise<Member> {
    await delay(300)
    const member = members.find(m => m.id === id)
    if (!member) throw new Error('Membre non trouvé.')
    return member
  },

  async createMember(data: Omit<Member, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    await delay(600)
    if (members.find(m => m.email === data.email)) {
      throw new Error('Cet email est déjà utilisé.')
    }
    const newMember: Member = {
      ...data,
      id: `m${Date.now()}`,
      accessCode: generateAccessCode(),
      accessCodeSentAt: new Date().toISOString(),
      accessCodeExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    members = [...members, newMember]
    return newMember
  },

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    await delay(500)
    const idx = members.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('Membre non trouvé.')
    members[idx] = { ...members[idx], ...data, updatedAt: new Date().toISOString() }
    return members[idx]
  },

  async deleteMember(id: string): Promise<void> {
    await delay(500)
    members = members.filter(m => m.id !== id)
  },

  async suspendMember(id: string): Promise<Member> {
    return membersMock.updateMember(id, { status: 'suspended' })
  },

  async activateMember(id: string): Promise<Member> {
    return membersMock.updateMember(id, { status: 'active' })
  },

  async regenerateCode(id: string): Promise<Member> {
    await delay(400)
    const newCode = generateAccessCode()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    return membersMock.updateMember(id, {
      accessCode: newCode,
      accessCodeExpiresAt: expires,
      accessCodeSentAt: new Date().toISOString(),
    })
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await delay(600)
    members = members.filter(m => !ids.includes(m.id))
  },

  async bulkSuspend(ids: string[]): Promise<void> {
    await delay(600)
    members = members.map(m =>
      ids.includes(m.id) ? { ...m, status: 'suspended' as const, updatedAt: new Date().toISOString() } : m
    )
  },
}
