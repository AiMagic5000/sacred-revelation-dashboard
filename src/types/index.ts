// Re-export database types
export type {
  Organization,
  TrustData,
  Partner,
  Volunteer,
  Donation,
  Document,
  ActivityLog,
  BeneficiaryOrganization,
  HealingSession,
  MusicEvent,
  CoachingSession,
  ElderBoardResolution,
} from '@/lib/supabase'

// Navigation types
export type NavItem = {
  title: string
  href: string
  icon: string
  badge?: string | number
}

// Dashboard stats
export type DashboardStats = {
  totalDonations: number
  totalVolunteers: number
  totalPartners: number
  activeDocuments: number
  recentActivity: ActivityLogItem[]
}

export type ActivityLogItem = {
  id: string
  action: string
  description: string
  timestamp: string
  user?: string
}

// API Response types
export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

// Form states
export type FormState = {
  isLoading: boolean
  error?: string
  success?: string
}

// Pagination
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// User context
export type UserContext = {
  userId: string
  organizationId: string
  role: 'owner' | 'admin' | 'member'
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired'
  trialEndsAt?: string
}
