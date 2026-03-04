import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('trust_data')
      .select('*')
      .eq('organization_id', org.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json(data || null)
  } catch (error) {
    console.error('Error fetching trust data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trust data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    // Check if trust data already exists
    const { data: existing } = await supabase
      .from('trust_data')
      .select('id')
      .eq('organization_id', org.id)
      .single()

    let data
    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('trust_data')
        .update({
          ministry_name: body.ministry_name,
          ein_number: body.ein_number,
          formation_date: body.formation_date,
          state_of_formation: body.state_of_formation,
          registered_agent: body.registered_agent,
          address: body.address,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      data = updated
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('trust_data')
        .insert({
          organization_id: org.id,
          ministry_name: body.ministry_name,
          ein_number: body.ein_number,
          formation_date: body.formation_date,
          state_of_formation: body.state_of_formation,
          registered_agent: body.registered_agent,
          address: body.address,
        })
        .select()
        .single()

      if (error) throw error
      data = created
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'trust_data_updated',
      description: 'Updated trust/organization data',
    })

    return NextResponse.json(data, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving trust data:', error)
    return NextResponse.json(
      { error: 'Failed to save trust data' },
      { status: 500 }
    )
  }
}
