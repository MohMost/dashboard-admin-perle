// ============================================================
// Core Types
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'moderator'
export type UserStatus = 'active' | 'suspended' | 'inactive'
export type MemberStatus = 'active' | 'suspended' | 'pending' | 'expired'
export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived'
export type ContentType = 'article' | 'video' | 'audio' | 'image' | 'document'

// ============================================================
// Auth
// ============================================================

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: AuthUser
  token: string
  expiresAt: string
}

// ============================================================
// Admin Users
// ============================================================

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  avatar?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// Members (App users with access codes)
// ============================================================

export interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  status: MemberStatus
  accessCode: string
  accessCodeExpiresAt?: string
  accessCodeSentAt?: string
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// Content
// ============================================================

export interface ContentItem {
  id: string
  title: string
  slug: string
  type: ContentType
  status: ContentStatus
  excerpt?: string
  body?: string
  coverImage?: string
  categories: string[]
  tags: string[]
  author: string
  authorId: string
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  views: number
}

// ============================================================
// Analytics
// ============================================================

export interface AnalyticsSummary {
  totalMembers: number
  totalUsers: number
  totalContent: number
  activeMembers: number
  membersGrowth: number
  usersGrowth: number
  contentGrowth: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ActivityItem {
  id: string
  type: 'member_joined' | 'content_published' | 'user_created' | 'member_suspended' | 'code_generated'
  description: string
  actorName: string
  targetName?: string
  createdAt: string
}

// ============================================================
// Pagination & Filters
// ============================================================

export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MemberFilters {
  search?: string
  status?: MemberStatus | 'all'
  tag?: string
  page?: number
  limit?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export interface UserFilters {
  search?: string
  status?: UserStatus | 'all'
  role?: UserRole | 'all'
  page?: number
  limit?: number
}

export interface ContentFilters {
  search?: string
  status?: ContentStatus | 'all'
  type?: ContentType | 'all'
  category?: string
  page?: number
  limit?: number
}

// ============================================================
// Settings
// ============================================================

export interface PlatformSettings {
  platformName: string
  platformUrl: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  supportEmail: string
}

export interface AccessSettings {
  allowRegistration: boolean
  emailVerification: boolean
  memberApproval: boolean
  accessCodeExpireDays: number
  maxLoginAttempts: number
}

export interface EmailSettings {
  fromName: string
  fromEmail: string
  replyToEmail: string
  emailFooter: string
  invitationSubject: string
  invitationBody: string
}

export interface AppSettings {
  platform: PlatformSettings
  access: AccessSettings
  email: EmailSettings
}

// ============================================================
// API Response wrapper
// ============================================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status: number
}
