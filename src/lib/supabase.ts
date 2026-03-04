import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

/**
 * Supabase client for browser-side operations
 * Uses the anon key which has RLS policies applied
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a Supabase client for server-side operations
 * Uses the service role key which bypasses RLS
 */
export function createServerClient() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

/**
 * Database types matching the Supabase schema
 */

export type Organization = {
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

export type TrustData = {
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

export type Partner = {
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

export type Volunteer = {
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

export type Donation = {
  id: string
  organization_id: string
  donor_name: string
  donor_email?: string
  amount: number
  type: 'one-time' | 'recurring'
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  created_at: string
}

export type Document = {
  id: string
  organization_id: string
  name: string
  type: string
  file_url: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export type ActivityLog = {
  id: string
  organization_id: string
  action: string
  description: string
  user_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ============================================
// NEW MINISTRY-SPECIFIC DATABASE TYPES
// ============================================

export type BeneficiaryOrganization = {
  id: string
  organization_id: string
  name: string
  website_url?: string
  category?:
    | 'Humanitarian'
    | 'Veterans'
    | 'Faith-Based'
    | 'Children'
    | 'Native Communities'
    | 'Anti-Trafficking'
    | 'Medical'
    | 'Education'
  contact_email?: string
  contact_phone?: string
  status: 'active' | 'inactive'
  total_distributed: number
  last_distribution_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type HealingSession = {
  id: string
  organization_id: string
  session_type:
    | 'Prayer'
    | 'Laying on of Hands'
    | 'Anointing'
    | 'Counseling'
    | 'Natural Health'
    | 'Sound Healing'
    | 'Touch Healing'
  facilitator_name: string
  attendees_count: number
  session_date: string
  location?: string
  notes?: string
  prayer_requests?: string[]
  created_at: string
  updated_at: string
}

export type MusicEvent = {
  id: string
  organization_id: string
  event_name: string
  event_type:
    | 'Worship Service'
    | 'Concert'
    | 'Retreat'
    | 'Recording Session'
    | 'Sound Healing'
    | 'Music Ministry'
    | 'Praise Night'
  musicians?: string[]
  songs_performed?: string[]
  event_date: string
  duration_minutes?: number
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type CoachingSession = {
  id: string
  organization_id: string
  coach_name: string
  client_name: string
  session_type:
    | 'Training'
    | 'Counseling'
    | 'Prayer'
    | 'Mentoring'
    | 'Assessment'
  session_date: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  created_at: string
  updated_at: string
}

export type ElderBoardResolution = {
  id: string
  organization_id: string
  resolution_number: string
  title: string
  description?: string
  proposed_by?: string
  seconded_by?: string
  vote_result?: 'Unanimous' | 'Majority' | 'Tabled' | 'Withdrawn'
  resolution_date: string
  status: 'proposed' | 'approved' | 'rejected' | 'tabled'
  created_at: string
  updated_at: string
}
