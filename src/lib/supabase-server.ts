import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Create a Supabase client for server-side operations
 * Uses the service role key which bypasses RLS
 */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

/**
 * Get the current user's organization from Clerk
 */
export async function getCurrentOrganization() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = createServerClient()

  // Find organization for this user
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // No org found for this user - check for unclaimed seed org
    const { data: seedOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', 'pending_clerk_user')
      .single()

    if (seedOrg) {
      // Claim the seed org for this user
      const { data: claimed, error: claimError } = await supabase
        .from('organizations')
        .update({ owner_id: userId })
        .eq('id', seedOrg.id)
        .select()
        .single()

      if (claimError) throw claimError
      return claimed
    }

    // No seed org either - create a fresh one
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: 'My Ministry',
        slug: `ministry-${userId.slice(0, 8)}`,
        owner_id: userId,
      })
      .select()
      .single()

    if (createError) throw createError
    return newOrg
  }

  if (error) throw error
  return org
}

/**
 * Get current user ID from Clerk
 */
export async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
