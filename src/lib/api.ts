// API utility functions for CRUD operations

import type {
  LocationType,
  BeneficiaryCategory,
  HealingSessionType,
  MusicEventType,
  CoachingSessionType,
  CoachingSessionStatus,
  ElderResolutionVoteResult,
  ElderResolutionStatus,
} from '@/hooks/useData'

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to create resource')
  }

  return response.json()
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to update resource')
  }

  return response.json()
}

export async function apiDelete(url: string): Promise<void> {
  const response = await fetch(url, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to delete resource')
  }
}

// ============================================
// EXISTING RESOURCE APIs
// ============================================

// Partner API
export const partnersApi = {
  create: (data: CreatePartnerData) => apiPost('/api/partners', data),
  update: (id: string, data: UpdatePartnerData) =>
    apiPut(`/api/partners/${id}`, data),
  delete: (id: string) => apiDelete(`/api/partners/${id}`),
}

// Volunteer API
export const volunteersApi = {
  create: (data: CreateVolunteerData) => apiPost('/api/volunteers', data),
  update: (id: string, data: UpdateVolunteerData) =>
    apiPut(`/api/volunteers/${id}`, data),
  delete: (id: string) => apiDelete(`/api/volunteers/${id}`),
}

// Donation API
export const donationsApi = {
  create: (data: CreateDonationData) => apiPost('/api/donations', data),
  update: (id: string, data: UpdateDonationData) =>
    apiPut(`/api/donations/${id}`, data),
  delete: (id: string) => apiDelete(`/api/donations/${id}`),
}

// Event API
export const eventsApi = {
  create: (data: CreateEventData) => apiPost('/api/events', data),
  update: (id: string, data: UpdateEventData) =>
    apiPut(`/api/events/${id}`, data),
  delete: (id: string) => apiDelete(`/api/events/${id}`),
}

// Location API
export const locationsApi = {
  create: (data: CreateLocationData) => apiPost('/api/locations', data),
  update: (id: string, data: UpdateLocationData) =>
    apiPut(`/api/locations/${id}`, data),
  delete: (id: string) => apiDelete(`/api/locations/${id}`),
}

// Production API
export const productionApi = {
  create: (data: CreateProductionData) => apiPost('/api/production', data),
  update: (id: string, data: UpdateProductionData) =>
    apiPut(`/api/production/${id}`, data),
  delete: (id: string) => apiDelete(`/api/production/${id}`),
}

// Distribution API
export const distributionApi = {
  create: (data: CreateDistributionData) => apiPost('/api/distribution', data),
  update: (id: string, data: UpdateDistributionData) =>
    apiPut(`/api/distribution/${id}`, data),
  delete: (id: string) => apiDelete(`/api/distribution/${id}`),
}

// Trust Data API
export const trustDataApi = {
  save: (data: SaveTrustData) => apiPost('/api/trust-data', data),
}

// Compliance API
export const complianceApi = {
  create: (data: CreateComplianceData) => apiPost('/api/compliance', data),
  update: (id: string, data: UpdateComplianceData) =>
    apiPut(`/api/compliance/${id}`, data),
  delete: (id: string) => apiDelete(`/api/compliance/${id}`),
}

// Organization API
export const organizationApi = {
  update: (data: UpdateOrgData) => apiPut('/api/organization', data),
}

// ============================================
// NEW MINISTRY-SPECIFIC APIs
// ============================================

// Beneficiary Organizations API
export const beneficiaryOrgsApi = {
  create: (data: CreateBeneficiaryOrgData) =>
    apiPost('/api/beneficiary-organizations', data),
  update: (id: string, data: UpdateBeneficiaryOrgData) =>
    apiPut(`/api/beneficiary-organizations/${id}`, data),
  delete: (id: string) => apiDelete(`/api/beneficiary-organizations/${id}`),
}

// Healing Ministry API
export const healingApi = {
  create: (data: CreateHealingSessionData) =>
    apiPost('/api/healing-ministry', data),
  update: (id: string, data: UpdateHealingSessionData) =>
    apiPut(`/api/healing-ministry/${id}`, data),
  delete: (id: string) => apiDelete(`/api/healing-ministry/${id}`),
}

// Music & Worship API
export const musicApi = {
  create: (data: CreateMusicEventData) => apiPost('/api/music-worship', data),
  update: (id: string, data: UpdateMusicEventData) =>
    apiPut(`/api/music-worship/${id}`, data),
  delete: (id: string) => apiDelete(`/api/music-worship/${id}`),
}

// Life Coaching API
export const coachingApi = {
  create: (data: CreateCoachingSessionData) =>
    apiPost('/api/life-coaching', data),
  update: (id: string, data: UpdateCoachingSessionData) =>
    apiPut(`/api/life-coaching/${id}`, data),
  delete: (id: string) => apiDelete(`/api/life-coaching/${id}`),
}

// Elder Board Resolutions API
export const resolutionsApi = {
  create: (data: CreateElderResolutionData) =>
    apiPost('/api/elder-board', data),
  update: (id: string, data: UpdateElderResolutionData) =>
    apiPut(`/api/elder-board/${id}`, data),
  delete: (id: string) => apiDelete(`/api/elder-board/${id}`),
}

// ============================================
// EXISTING PAYLOAD TYPES
// ============================================

export interface CreatePartnerData {
  name: string
  email?: string
  phone?: string
  role?: string
  status?: 'active' | 'inactive'
}

export interface UpdatePartnerData extends Partial<CreatePartnerData> {}

export interface CreateVolunteerData {
  name: string
  email?: string
  phone?: string
  skills?: string[]
  status?: 'active' | 'inactive'
  total_hours?: number
}

export interface UpdateVolunteerData extends Partial<CreateVolunteerData> {}

export interface CreateDonationData {
  donor_name: string
  donor_email?: string
  amount: number
  type?: 'one-time' | 'recurring'
  status?: 'pending' | 'completed' | 'failed'
  payment_method?: string
  notes?: string
}

export interface UpdateDonationData extends Partial<CreateDonationData> {}

export interface CreateEventData {
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  event_type?: string
  recurring?: boolean
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface CreateLocationData {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  location_type?: LocationType
  capacity?: number
  description?: string
  is_primary?: boolean
  contact_phone?: string
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

export interface CreateProductionData {
  record_type: 'farm' | 'food'
  title: string
  description?: string
  quantity?: number
  unit?: string
  production_date: string
  notes?: string
}

export interface UpdateProductionData
  extends Partial<Omit<CreateProductionData, 'record_type'>> {}

export interface CreateDistributionData {
  recipient_name: string
  recipient_contact?: string
  items_distributed: string
  quantity?: number
  distribution_date: string
  location?: string
  notes?: string
}

export interface UpdateDistributionData
  extends Partial<CreateDistributionData> {}

export interface SaveTrustData {
  ministry_name: string
  ein_number?: string
  formation_date?: string
  state_of_formation?: string
  registered_agent?: string
  address?: string
}

export interface CreateComplianceData {
  title: string
  description?: string
  due_date?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
}

export interface UpdateComplianceData extends Partial<CreateComplianceData> {}

export interface UpdateOrgData {
  name: string
}

// ============================================
// NEW MINISTRY-SPECIFIC PAYLOAD TYPES
// ============================================

export interface CreateBeneficiaryOrgData {
  name: string
  website_url?: string
  category?: BeneficiaryCategory
  contact_email?: string
  contact_phone?: string
  status?: 'active' | 'inactive'
  total_distributed?: number
  last_distribution_date?: string
  notes?: string
}

export interface UpdateBeneficiaryOrgData
  extends Partial<CreateBeneficiaryOrgData> {}

export interface CreateHealingSessionData {
  session_type: HealingSessionType
  facilitator_name: string
  attendees_count?: number
  session_date: string
  location?: string
  notes?: string
  prayer_requests?: string[]
}

export interface UpdateHealingSessionData
  extends Partial<CreateHealingSessionData> {}

export interface CreateMusicEventData {
  event_name: string
  event_type: MusicEventType
  musicians?: string[]
  songs_performed?: string[]
  event_date: string
  duration_minutes?: number
  location?: string
  notes?: string
}

export interface UpdateMusicEventData
  extends Partial<CreateMusicEventData> {}

export interface CreateCoachingSessionData {
  coach_name: string
  client_name: string
  session_type: CoachingSessionType
  session_date: string
  duration_minutes?: number
  status?: CoachingSessionStatus
  notes?: string
}

export interface UpdateCoachingSessionData
  extends Partial<CreateCoachingSessionData> {}

export interface CreateElderResolutionData {
  resolution_number: string
  title: string
  description?: string
  proposed_by?: string
  seconded_by?: string
  vote_result?: ElderResolutionVoteResult
  resolution_date: string
  status?: ElderResolutionStatus
}

export interface UpdateElderResolutionData
  extends Partial<CreateElderResolutionData> {}

// ============================================
// MEMBER / STAFF / TRUSTEE APIs
// ============================================

export interface CreateMemberData {
  name: string
  email?: string
  phone?: string
  role?: string
  status?: 'active' | 'inactive'
  family_size?: number
  notes?: string
}

export interface UpdateMemberData extends Partial<CreateMemberData> {}

export const membersApi = {
  create: (data: CreateMemberData) => apiPost('/api/members', data),
  update: (id: string, data: UpdateMemberData) =>
    apiPut(`/api/members/${id}`, data),
  delete: (id: string) => apiDelete(`/api/members/${id}`),
}

export interface CreateStaffData {
  name: string
  email?: string
  phone?: string
  title?: string
  department?: string
  hire_date?: string
  salary_range?: string
  status?: 'active' | 'inactive'
}

export interface UpdateStaffData extends Partial<CreateStaffData> {}

export const staffApi = {
  create: (data: CreateStaffData) => apiPost('/api/staff', data),
  update: (id: string, data: UpdateStaffData) =>
    apiPut(`/api/staff/${id}`, data),
  delete: (id: string) => apiDelete(`/api/staff/${id}`),
}

export interface CreateTrusteeData {
  name: string
  email?: string
  phone?: string
  role?: string
  appointment_date?: string
  term_expires?: string
  responsibilities?: string
  signature_on_file?: boolean
  status?: 'active' | 'inactive'
}

export interface UpdateTrusteeData extends Partial<CreateTrusteeData> {}

export const trusteesApi = {
  create: (data: CreateTrusteeData) => apiPost('/api/trustees', data),
  update: (id: string, data: UpdateTrusteeData) =>
    apiPut(`/api/trustees/${id}`, data),
  delete: (id: string) => apiDelete(`/api/trustees/${id}`),
}
