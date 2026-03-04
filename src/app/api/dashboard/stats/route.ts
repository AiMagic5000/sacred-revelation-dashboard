import { NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    // Get all stats in parallel
    const [
      donationsResult,
      volunteersResult,
      partnersResult,
      documentsResult,
      eventsResult,
      activityResult,
      productionResult,
      distributionResult,
    ] = await Promise.all([
      // Total donations
      supabase
        .from('donations')
        .select('amount')
        .eq('organization_id', org.id)
        .eq('status', 'completed'),

      // Active volunteers
      supabase
        .from('volunteers')
        .select('id, total_hours')
        .eq('organization_id', org.id)
        .eq('status', 'active'),

      // Partners (churches served)
      supabase
        .from('partners')
        .select('id')
        .eq('organization_id', org.id)
        .eq('status', 'active'),

      // Documents count
      supabase
        .from('documents')
        .select('id')
        .eq('organization_id', org.id),

      // Upcoming events
      supabase
        .from('events')
        .select('*')
        .eq('organization_id', org.id)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5),

      // Recent activity
      supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false })
        .limit(10),

      // Production records (for produce harvested)
      supabase
        .from('production')
        .select('quantity')
        .eq('organization_id', org.id)
        .eq('record_type', 'farm'),

      // Distribution records (for deliveries and families fed)
      supabase
        .from('distribution')
        .select('id, quantity')
        .eq('organization_id', org.id),
    ])

    // Calculate totals
    const totalDonations = donationsResult.data?.reduce(
      (sum, d) => sum + Number(d.amount),
      0
    ) || 0

    const totalVolunteerHours = volunteersResult.data?.reduce(
      (sum, v) => sum + Number(v.total_hours || 0),
      0
    ) || 0

    // Calculate produce harvested (sum of all farm production quantities)
    const produceHarvested = productionResult.data?.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    ) || 0

    // Deliveries and families fed from distribution records
    const deliveriesMade = distributionResult.data?.length || 0
    const familiesFed = distributionResult.data?.reduce(
      (sum, d) => sum + Number(d.quantity || 1),
      0
    ) || 0

    return NextResponse.json({
      stats: {
        totalDonations,
        activeVolunteers: volunteersResult.data?.length || 0,
        totalVolunteerHours,
        partnersCount: partnersResult.data?.length || 0,
        documentsCount: documentsResult.data?.length || 0,
        // Farm-specific stats
        produceHarvested,
        churchesServed: partnersResult.data?.length || 0, // Partners are churches
        familiesFed,
        deliveriesMade,
      },
      upcomingEvents: eventsResult.data || [],
      recentActivity: activityResult.data || [],
      organization: org,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
