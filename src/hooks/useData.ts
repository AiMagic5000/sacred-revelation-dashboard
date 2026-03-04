'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseDataOptions<T> {
  initialData?: T
  revalidateOnMount?: boolean
}

interface UseDataResult<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  mutate: () => Promise<void>
}

export function useData<T>(
  url: string,
  options: UseDataOptions<T> = {}
): UseDataResult<T> {
  const [data, setData] = useState<T | undefined>(options.initialData)
  const [error, setError] = useState<Error | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      const result = await response.json()
      setData(result)
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options.revalidateOnMount !== false) {
      fetchData()
    }
  }, [fetchData, options.revalidateOnMount])

  return { data, error, isLoading, mutate: fetchData }
}

// ============================================
// EXISTING ENTITY HOOKS
// ============================================

export function usePartners() {
  return useData<Partner[]>('/api/partners')
}

export function useVolunteers() {
  return useData<Volunteer[]>('/api/volunteers')
}

export function useDonations() {
  return useData<Donation[]>('/api/donations')
}

export function useEvents() {
  return useData<Event[]>('/api/events')
}

export function useProduction(type?: 'farm' | 'food') {
  const url = type ? `/api/production?type=${type}` : '/api/production'
  return useData<ProductionRecord[]>(url)
}

export function useDistribution() {
  return useData<DistributionRecord[]>('/api/distribution')
}

export function useTrustData() {
  return useData<TrustData | null>('/api/trust-data')
}

export function useCompliance() {
  return useData<ComplianceItem[]>('/api/compliance')
}

export function useActivity(limit = 20) {
  return useData<ActivityLog[]>(`/api/activity?limit=${limit}`)
}

export function useDashboardStats() {
  return useData<DashboardStats>('/api/dashboard/stats')
}

export function useOrganization() {
  return useData<Organization>('/api/organization')
}

// ============================================
// NEW MINISTRY-SPECIFIC HOOKS
// ============================================

export function useBeneficiaryOrgs(category?: BeneficiaryCategory) {
  const url = category
    ? `/api/beneficiary-organizations?category=${encodeURIComponent(category)}`
    : '/api/beneficiary-organizations'
  return useData<BeneficiaryOrganization[]>(url)
}

export function useHealingSessions(sessionType?: HealingSessionType) {
  const url = sessionType
    ? `/api/healing-ministry?type=${encodeURIComponent(sessionType)}`
    : '/api/healing-ministry'
  return useData<HealingSession[]>(url)
}

export function useMusicEvents(eventType?: MusicEventType) {
  const url = eventType
    ? `/api/music-worship?type=${encodeURIComponent(eventType)}`
    : '/api/music-worship'
  return useData<MusicEvent[]>(url)
}

export function useCoachingSessions(status?: CoachingSessionStatus) {
  const url = status
    ? `/api/life-coaching?status=${encodeURIComponent(status)}`
    : '/api/life-coaching'
  return useData<CoachingSession[]>(url)
}

export function useElderResolutions(status?: ElderResolutionStatus) {
  const url = status
    ? `/api/elder-board?status=${encodeURIComponent(status)}`
    : '/api/elder-board'
  return useData<ElderBoardResolution[]>(url)
}

export function useLocations() {
  return useData<Location[]>('/api/locations')
}

export function useDocuments(category?: string, search?: string) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (search) params.set('search', search)
  const qs = params.toString()
  const url = qs ? `/api/documents?${qs}` : '/api/documents'
  return useData<DocumentRecord[]>(url)
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface DocumentRecord {
  id: string
  organization_id: string
  name: string
  type: string
  file_url: string
  file_size: number
  uploaded_by: string
  category: string
  storage_path?: string
  created_at: string
}

// ============================================
// EXISTING ENTITY INTERFACES
// ============================================

export interface Partner {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  role?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Volunteer {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  skills?: string[]
  status: 'active' | 'inactive'
  total_hours: number
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  organization_id: string
  donor_name: string
  donor_email?: string
  amount: number
  type: 'one-time' | 'recurring'
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  receipt_number?: string
  notes?: string
  created_at: string
}

export interface Event {
  id: string
  organization_id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  event_type?: string
  recurring: boolean
  created_at: string
  updated_at: string
}

export interface ProductionRecord {
  id: string
  organization_id: string
  record_type: 'farm' | 'food'
  title: string
  description?: string
  quantity?: number
  unit?: string
  production_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface DistributionRecord {
  id: string
  organization_id: string
  recipient_name: string
  recipient_contact?: string
  items_distributed: string
  quantity?: number
  distribution_date: string
  location?: string
  notes?: string
  created_at: string
}

export interface TrustData {
  id: string
  organization_id: string
  ministry_name: string
  ein_number?: string
  formation_date?: string
  state_of_formation?: string
  registered_agent?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface ComplianceItem {
  id: string
  organization_id: string
  title: string
  description?: string
  due_date?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  action: string
  description: string
  user_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  trial_ends_at: string
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  polar_customer_id?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  stats: {
    totalDonations: number
    activeVolunteers: number
    totalVolunteerHours: number
    partnersCount: number
    documentsCount: number
    produceHarvested: number
    churchesServed: number
    familiesFed: number
    deliveriesMade: number
  }
  upcomingEvents: Event[]
  recentActivity: ActivityLog[]
  organization: Organization
}

// ============================================
// LOCATION TYPE
// ============================================

export type LocationType =
  | 'Main Sanctuary'
  | 'Fellowship Hall'
  | 'Community Center'
  | 'Office'
  | 'Storage'
  | 'Farm/Garden'

export interface Location {
  id: string
  organization_id: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  location_type: LocationType
  capacity?: number
  description?: string
  is_primary: boolean
  contact_phone?: string
  created_at: string
  updated_at: string
}

// ============================================
// NEW MINISTRY-SPECIFIC TYPES
// ============================================

export type BeneficiaryCategory =
  | 'Humanitarian'
  | 'Veterans'
  | 'Faith-Based'
  | 'Children'
  | 'Native Communities'
  | 'Anti-Trafficking'
  | 'Medical'
  | 'Education'

export interface BeneficiaryOrganization {
  id: string
  organization_id: string
  name: string
  website_url?: string
  category?: BeneficiaryCategory
  contact_email?: string
  contact_phone?: string
  status: 'active' | 'inactive'
  total_distributed: number
  last_distribution_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type HealingSessionType =
  | 'Prayer'
  | 'Laying on of Hands'
  | 'Anointing'
  | 'Counseling'
  | 'Natural Health'
  | 'Sound Healing'
  | 'Touch Healing'

export interface HealingSession {
  id: string
  organization_id: string
  session_type: HealingSessionType
  facilitator_name: string
  attendees_count: number
  session_date: string
  location?: string
  notes?: string
  prayer_requests?: string[]
  created_at: string
  updated_at: string
}

export type MusicEventType =
  | 'Worship Service'
  | 'Concert'
  | 'Retreat'
  | 'Recording Session'
  | 'Sound Healing'
  | 'Music Ministry'
  | 'Praise Night'

export interface MusicEvent {
  id: string
  organization_id: string
  event_name: string
  event_type: MusicEventType
  musicians?: string[]
  songs_performed?: string[]
  event_date: string
  duration_minutes?: number
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type CoachingSessionType =
  | 'Training'
  | 'Counseling'
  | 'Prayer'
  | 'Mentoring'
  | 'Assessment'

export type CoachingSessionStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export interface CoachingSession {
  id: string
  organization_id: string
  coach_name: string
  client_name: string
  session_type: CoachingSessionType
  session_date: string
  duration_minutes: number
  status: CoachingSessionStatus
  notes?: string
  created_at: string
  updated_at: string
}

export type ElderResolutionVoteResult =
  | 'Unanimous'
  | 'Majority'
  | 'Tabled'
  | 'Withdrawn'

export type ElderResolutionStatus =
  | 'proposed'
  | 'approved'
  | 'rejected'
  | 'tabled'

export interface ElderBoardResolution {
  id: string
  organization_id: string
  resolution_number: string
  title: string
  description?: string
  proposed_by?: string
  seconded_by?: string
  vote_result?: ElderResolutionVoteResult
  resolution_date: string
  status: ElderResolutionStatus
  created_at: string
  updated_at: string
}

// ============================================
// MEMBER / STAFF / TRUSTEE HOOKS
// ============================================

/**
 * Members, Staff, and Trustees all store in the volunteers table
 * using a __type: tag in the skills array as discriminator.
 * The API routes handle filtering and formatting.
 */

export interface MemberRecord {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  skills: string[]
  status: 'active' | 'inactive'
  total_hours: number // repurposed as family_size
  created_at: string
  updated_at: string
}

export interface StaffRecord {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  skills: string[]
  status: 'active' | 'inactive'
  total_hours: number
  created_at: string
  updated_at: string
}

export interface TrusteeRecord {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  skills: string[]
  status: 'active' | 'inactive'
  total_hours: number
  created_at: string
  updated_at: string
}

export function useMembers() {
  return useData<MemberRecord[]>('/api/members')
}

export function useStaff() {
  return useData<StaffRecord[]>('/api/staff')
}

export function useTrustees() {
  return useData<TrusteeRecord[]>('/api/trustees')
}
