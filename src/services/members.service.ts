import { apiFetch } from '@/lib/api-client'
import type { Member, MemberFilters, MemberStatus, PaginatedResponse } from '@/types'

// Wired to the backend (BACKEND_PLAN.md Task 4.2). "Members" are native-app
// users (role MEMBER). Supported: list (+status/search filters), suspend,
// reactivate, delete. NOT supported by the real model — the app uses a single
// GLOBAL activation code, not per-member codes, and registration is self-serve,
// so there's no admin-side create/edit or per-member code to regenerate. Those
// methods reject with a clear message (surfaced as a toast by the callers).

interface BackendMember {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  username: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  isActivated: boolean
  activatedAt?: string | null
  activationCodeUsed?: string | null
  createdAt: string
  updatedAt: string
}

const NOT_SUPPORTED =
  "Action non disponible : les comptes utilisent un code d'activation global partagé (inscription en libre-service)."

function mapStatus(s: BackendMember['status']): MemberStatus {
  if (s === 'ACTIVE') return 'active'
  if (s === 'SUSPENDED') return 'suspended'
  return 'pending'
}

function mapMember(u: BackendMember): Member {
  return {
    id: u.id,
    username: u.username,
    // Accounts are username-only now (privacy); name/email are usually null.
    email: u.email ?? '',
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    status: mapStatus(u.status),
    // No per-member access code in the global-code model — show the code the
    // member activated with (or a dash while still pending).
    accessCode: u.activationCodeUsed ?? '—',
    tags: [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

// dashboard status filter → backend enum. 'expired' has no backend equivalent.
const STATUS_TO_BACKEND: Partial<Record<MemberStatus, string>> = {
  active: 'ACTIVE',
  pending: 'PENDING',
  suspended: 'SUSPENDED',
}

export const membersService = {
  getMembers: async (
    filters: MemberFilters = {},
  ): Promise<PaginatedResponse<Member>> => {
    const empty: PaginatedResponse<Member> = {
      data: [],
      total: 0,
      page: 1,
      limit: filters.limit ?? 200,
      totalPages: 0,
    }
    // 'expired' isn't a concept in the backend — nothing to show.
    if (filters.status === 'expired') return empty

    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') {
      const mapped = STATUS_TO_BACKEND[filters.status]
      if (mapped) params.set('status', mapped)
    }
    if (filters.search) params.set('search', filters.search)

    const qs = params.toString()
    const list = await apiFetch<BackendMember[]>(
      `/admin/members${qs ? `?${qs}` : ''}`,
    )
    const data = list.map(mapMember)
    return {
      data,
      total: data.length,
      page: 1,
      limit: filters.limit ?? data.length,
      totalPages: 1,
    }
  },

  getMemberById: async (id: string): Promise<Member> => {
    const list = await apiFetch<BackendMember[]>('/admin/members')
    const found = list.find((m) => m.id === id)
    if (!found) throw new Error('Membre non trouvé.')
    return mapMember(found)
  },

  createMember: (): Promise<Member> => Promise.reject(new Error(NOT_SUPPORTED)),

  updateMember: (): Promise<Member> => Promise.reject(new Error(NOT_SUPPORTED)),

  deleteMember: async (id: string): Promise<void> => {
    await apiFetch(`/admin/members/${id}`, { method: 'DELETE' })
  },

  suspendMember: async (id: string): Promise<Member> =>
    mapMember(
      await apiFetch<BackendMember>(`/admin/members/${id}`, {
        method: 'PATCH',
        body: { status: 'SUSPENDED' },
      }),
    ),

  activateMember: async (id: string): Promise<Member> =>
    mapMember(
      await apiFetch<BackendMember>(`/admin/members/${id}`, {
        method: 'PATCH',
        body: { status: 'ACTIVE' },
      }),
    ),

  regenerateCode: (): Promise<Member> => Promise.reject(new Error(NOT_SUPPORTED)),

  bulkDelete: async (ids: string[]): Promise<void> => {
    await Promise.all(
      ids.map((id) => apiFetch(`/admin/members/${id}`, { method: 'DELETE' })),
    )
  },

  bulkSuspend: async (ids: string[]): Promise<void> => {
    await Promise.all(
      ids.map((id) =>
        apiFetch(`/admin/members/${id}`, {
          method: 'PATCH',
          body: { status: 'SUSPENDED' },
        }),
      ),
    )
  },
}
